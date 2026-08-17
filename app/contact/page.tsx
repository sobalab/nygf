"use client";

import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { SiteFooter, SiteHeader } from "../chrome";
import { formServiceConfigured, shop, web3formsAccessKey, whatsappHref } from "../site";

type Status = "idle" | "sending" | "sent" | "error";

const EMPTY = {
  name: "",
  phone: "",
  email: "",
  business: "",
  fulfilment: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  service: "General order",
  needBy: "",
  needs: "",
};

// The offerings named on the catalogue page, plus the general case that covers
// everything sold by the bunch. Adding one there means adding it here, or a
// buyer reads about a service and then has nowhere to say they want it.
const SERVICES = ["General order", "Wedding flowers", "Dutch flowers", "Tropical flowers"];

// A date input hands back 2026-08-20. Read it back as a plain local date so the
// message says "Thu, Aug 20" rather than shifting a day across the timezone.
function readableDate(value: string) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

function summarise(form: typeof EMPTY) {
  // Skipped optional fields drop out entirely rather than leaving a gap.
  const details = [
    `Name: ${form.name}`,
    form.business && `Business: ${form.business}`,
    `Phone: ${form.phone}`,
    form.email && `Email: ${form.email}`,
    `Service: ${form.service}`,
    form.fulfilment && `Pickup or delivery: ${form.fulfilment}`,
    form.address && `Delivery address: ${[form.address, form.city, [form.state, form.zip].filter(Boolean).join(" ")].filter(Boolean).join(", ")}`,
    form.needBy && `Needed by: ${readableDate(form.needBy)}`,
  ].filter(Boolean);

  return ["Hello, I'd like to place a wholesale order.", "", ...details, "", "What I need:", form.needs].join("\n");
}

export default function Contact() {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState<Status>("idle");
  // Whether the WhatsApp tab actually opened on submit. An inquiry is meant to
  // land in both of the shop's inboxes, and this is the half that a browser can
  // refuse without telling anyone.
  const [drafted, setDrafted] = useState(true);
  const honeypot = useRef<HTMLInputElement>(null);

  // /contact?sent — the confirmation without sending anything, so the panel can
  // be looked at and styled without a real inquiry landing in the shop's inbox
  // every time. ?sent=Jane fills the name the heading greets.
  //   Development only: NODE_ENV is inlined at build time, so the whole block
  // is dropped from a production bundle rather than shipped behind a flag a
  // visitor could find and trip.
  //   In an effect rather than in the initial state, because this component is
  // rendered on the server first: reading the query string during that first
  // render would hand back "idle" there and "sent" here, and React would be
  // hydrating a confirmation over a form.
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const preview = new URLSearchParams(window.location.search).get("sent");
    if (preview === null) return;
    if (preview) setForm((current) => ({ ...current, name: preview }));
    setStatus("sent");
  }, []);

  // What the reader was looking at when they asked. The catalogue's offerings
  // send ?service, which lands on one of the radios; a variety page sends
  // ?about, which opens the list with the flower already written on it so the
  // buyer adds a count rather than retyping the name they just read.
  //   Read here rather than through the router's hook for the same reason the
  // preview above is: this page renders on the server first, and a query string
  // read during that render is a hydration mismatch waiting to happen.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const service = params.get("service");
    const about = params.get("about");
    const matched = service && SERVICES.find((name) => name.toLowerCase() === service.toLowerCase());
    if (!matched && !about) return;
    setForm((current) => ({
      ...current,
      ...(matched ? { service: matched } : {}),
      ...(about ? { needs: about } : {}),
    }));
  }, []);

  const sent = status === "sent";
  const message = summarise(form);
  const waUrl = whatsappHref(message);
  const mailtoUrl = `mailto:${shop.email}?subject=${encodeURIComponent(`Wholesale flower inquiry — ${form.name}`)}&body=${encodeURIComponent(message)}`;

  function set(key: keyof typeof EMPTY, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  // Picking pickup takes the delivery answers back out rather than leaving them
  // in state, where they would still reach the message.
  function setFulfilment(value: string) {
    setForm((current) => ({ ...current, fulfilment: value, ...(value === "Delivery" ? {} : { address: "", city: "", state: "", zip: "" }) }));
  }

  // The confirmation panel is much shorter than the form it replaces, so without
  // this you are left staring at the empty bottom of the page.
  function confirm() {
    setStatus("sent");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (honeypot.current?.value) return; // a bot filled the hidden field

    // Open the WhatsApp draft inside the click gesture, before any await, or the
    // browser treats it as an unrequested popup and blocks it.
    //   The handle is what says whether it opened: a blocked popup hands back
    // null, and the confirmation below has to be able to tell, because promising
    // a tab that was never allowed is how the WhatsApp half of an inquiry gets
    // quietly dropped. Which is also why the window is opened bare and its
    // opener cut afterwards rather than being asked for with "noopener" — that
    // feature makes the call return null whether it worked or not.
    const draft = window.open(waUrl, "_blank");
    if (draft) draft.opener = null;
    setDrafted(Boolean(draft));

    if (!formServiceConfigured) {
      confirm();
      return;
    }

    setStatus("sending");
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: web3formsAccessKey,
          subject: `Wholesale flower inquiry — ${form.name}`,
          from_name: form.name,
          replyto: form.email || undefined,
          name: form.name,
          phone: form.phone,
          email: form.email,
          business: form.business,
          service: form.service,
          pickup_or_delivery: form.fulfilment,
          delivery_address: [form.address, form.city, [form.state, form.zip].filter(Boolean).join(" ")].filter(Boolean).join(", "),
          needed_by: readableDate(form.needBy),
          message: form.needs,
        }),
      });
      const data = (await response.json()) as { success?: boolean };
      if (data.success) confirm();
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <main style={{ "--footer-well": "var(--band-contact)" } as CSSProperties}>
      <SiteHeader />

      {/* Everything on this page asks for the list, so once the list is sent
          there is nothing left for the head to introduce or the aside to offer
          as an alternative to — both would be answering a question the reader
          has already finished with. What is left is the confirmation, and it
          takes the page on its own. */}
      {sent ? null : (
        <section className="page-head section-pad">
          <h1>Tell Us What You Need</h1>
          <p className="section-note">
            Prices move with the market daily and are never posted, so we can answer any questions by email, phone or
            WhatsApp. Send your list and we will come back with what is in the cooler and what it costs.
          </p>
        </section>
      )}

      <section className={sent ? "enquiry enquiry-done section-pad" : "enquiry section-pad"}>
        <div className="enquiry-form">
          {sent ? (
            <div className="enquiry-sent" role="status" aria-live="polite">
              <h2>Thank You, {form.name.split(" ")[0] || "we have it"}.</h2>
              {/* Three things can be true here and the reader is owed the right
                  one: the email either went or there is no service to send it
                  with, and the WhatsApp draft either opened or the browser held
                  the tab back. The second half is a step still to take either
                  way, so it keeps the solid button under whichever line runs. */}
              <p>
                {formServiceConfigured
                  ? drafted
                    ? "Your list is on its way to the shop by email, and a WhatsApp draft is open in another tab. Send that too and the owner has the thread as well as the inbox copy."
                    : "Your list is on its way to the shop by email. Your browser held back the WhatsApp tab, so open the draft below and send it to reach the owner directly as well."
                  : drafted
                    ? "A WhatsApp draft is open in another tab with your list already written out. Send it, and email the same copy so the shop has it both ways."
                    : "Your browser held back the WhatsApp tab. Open the draft below and send it, and email the same copy so the shop has it both ways."}
              </p>
              <div className="enquiry-actions">
                <a className="solid-button" href={waUrl} target="_blank" rel="noreferrer">
                  {drafted ? "Open WhatsApp again" : "Open the WhatsApp draft"}
                </a>
                {formServiceConfigured ? null : (
                  <a className="text-link" href={mailtoUrl}>
                    Email a copy
                  </a>
                )}
              </div>
              <button type="button" className="enquiry-reset" onClick={() => { setForm(EMPTY); setStatus("idle"); setDrafted(true); }}>
                Send another list
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Hidden from people, tempting to bots. */}
              <input ref={honeypot} className="honeypot" type="text" name="botcheck" tabIndex={-1} autoComplete="off" aria-hidden="true" />

              <div className="field">
                <label htmlFor="name">Name<span className="req" aria-hidden="true">*</span></label>
                <input id="name" name="name" type="text" required autoComplete="name" value={form.name} onChange={(e) => set("name", e.target.value)} />
              </div>

              <div className="field-row">
                <div className="field">
                  <label htmlFor="phone">Phone or WhatsApp<span className="req" aria-hidden="true">*</span></label>
                  <input id="phone" name="phone" type="tel" required autoComplete="tel" placeholder="212-555-0123" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="email">Email <em>optional</em></label>
                  <input id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
                </div>
              </div>

              {/* Business name belongs to any order, so it sits here by default.
                  Delivery asks for it again beside the address it labels, and
                  it moves rather than doubling up — one input either way, and
                  the value carries across because it lives in form state. */}
              {form.fulfilment === "Delivery" ? null : (
                <div className="field">
                  <label htmlFor="business">Business Name <em>optional</em></label>
                  <input id="business" name="business" type="text" autoComplete="organization" value={form.business} onChange={(e) => set("business", e.target.value)} />
                </div>
              )}

              <fieldset className="field">
                <legend>What Kind of Order</legend>
                <div className="choices">
                  {SERVICES.map((service) => (
                    <label className="choice" key={service}>
                      <input type="radio" name="service" value={service} checked={form.service === service} onChange={(e) => set("service", e.target.value)} />
                      <span>{service}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="field-row">
                <fieldset className="field">
                  <legend>Pickup or Delivery</legend>
                  <p className="field-hint" id="fulfilment-hint">We deliver across the New York metro area and nearby Connecticut.</p>
                  <div className="choices" aria-describedby="fulfilment-hint">
                    {["Pickup", "Delivery"].map((option) => (
                      <label className="choice" key={option}>
                        <input type="radio" name="fulfilment" value={option} checked={form.fulfilment === option} onChange={(e) => setFulfilment(e.target.value)} />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div className="field">
                  <label htmlFor="needBy">When You Need It</label>
                  <p className="field-hint" id="needBy-hint">A rough date is fine. It changes what we can source.</p>
                  <input id="needBy" name="needBy" type="date" aria-describedby="needBy-hint" value={form.needBy} onChange={(e) => set("needBy", e.target.value)} />
                </div>
              </div>

              {/* Only delivery needs somewhere to arrive, so the questions that
                  go with it are asked only when it is chosen. The address is
                  split into its four parts rather than kept on one line: given
                  the autocomplete tokens below, a browser holding a saved
                  address fills all four from the first one the reader touches,
                  where a single free-text line only ever gets the street. */}
              {form.fulfilment === "Delivery" ? (
                <>
                  <div className="field">
                    <label htmlFor="address">Delivery Address<span className="req" aria-hidden="true">*</span></label>
                    <input id="address" name="address" type="text" required autoComplete="address-line1" placeholder="171-10 39th Ave" value={form.address} onChange={(e) => set("address", e.target.value)} />
                  </div>

                  <div className="field-row field-row-address">
                    <div className="field">
                      <label htmlFor="city">City<span className="req" aria-hidden="true">*</span></label>
                      <input id="city" name="city" type="text" required autoComplete="address-level2" placeholder="Flushing" value={form.city} onChange={(e) => set("city", e.target.value)} />
                    </div>
                    <div className="field">
                      <label htmlFor="state">State<span className="req" aria-hidden="true">*</span></label>
                      <input id="state" name="state" type="text" required autoComplete="address-level1" placeholder="NY" value={form.state} onChange={(e) => set("state", e.target.value)} />
                    </div>
                    <div className="field">
                      <label htmlFor="zip">ZIP<span className="req" aria-hidden="true">*</span></label>
                      <input id="zip" name="zip" type="text" required autoComplete="postal-code" inputMode="numeric" pattern="[0-9]{5}(-[0-9]{4})?" placeholder="11358" value={form.zip} onChange={(e) => set("zip", e.target.value)} />
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor="business">Business Name <em>optional</em></label>
                    <input id="business" name="business" type="text" autoComplete="organization" value={form.business} onChange={(e) => set("business", e.target.value)} />
                  </div>
                </>
              ) : null}

              <div className="field">
                <label htmlFor="needs">What You Need<span className="req" aria-hidden="true">*</span></label>
                <p className="field-hint" id="needs-hint">Please include flower type variety and bunch count. Colors and substitutions can be discussed further on call or message.</p>
                <textarea
                  id="needs"
                  name="needs"
                  required
                  rows={7}
                  placeholder="20 bunches Red Rose, 10 Eucalyptus, 5 Hydrangea."
                  aria-describedby="needs-hint"
                  value={form.needs}
                  onChange={(e) => set("needs", e.target.value)}
                />
              </div>

              {status === "error" ? (
                <p className="field-error" role="alert">
                  That did not send. Your WhatsApp draft should still be open, or <a href={mailtoUrl}>email the list</a> instead.
                </p>
              ) : null}

              {/* Above the button for the same reason every hint above sits above
                  its input: it says what the control will do, so it is read
                  before the control rather than after it. */}
              <p className="field-hint enquiry-note">Sending emails your list to the shop and opens a WhatsApp draft, so it reaches us both ways.</p>
              <button type="submit" className="enquiry-submit" disabled={status === "sending"}>
                {status === "sending" ? "Sending" : "Send inquiry"}
              </button>
            </form>
          )}
        </div>

        {sent ? null : (
        <aside className="enquiry-aside">
          <h2>Or Just Call.</h2>
          <p className="section-note">Most orders are settled in a two minute phone call. We answer in English and Korean.</p>
          <div className="enquiry-details">
            <p>
              <span>Store phone (voice only)</span>
              <a href={shop.storePhoneHref}>{shop.storePhone}</a>
            </p>
            <p>
              <span>Owner (WhatsApp or SMS)</span>
              <a href={`https://wa.me/${shop.whatsappNumber}`} target="_blank" rel="noreferrer">{shop.ownerPhone}</a>
              <br />
              <a href={shop.smsHref}>Send SMS</a>
            </p>
            <p>
              <span>Email</span>
              <a href={`mailto:${shop.email}?subject=Wholesale%20flower%20inquiry`}>{shop.email}</a>
            </p>
            <p>
              <span>Visit / Pickup</span>
              <a href={shop.mapsHref} target="_blank" rel="noreferrer">171-10 39th Ave<br />Flushing, NY 11358</a>
            </p>
            <p>
              <span>Hours</span>
              Mon–Sat, 6 AM–2 PM<br />Sunday, 6 AM–12 PM
            </p>
          </div>
        </aside>
        )}
      </section>

      <SiteFooter />
    </main>
  );
}
