"use client";

import { useRef, useState, type FormEvent } from "react";
import { SiteFooter, SiteHeader } from "../chrome";
import { formServiceConfigured, shop, web3formsAccessKey, whatsappHref } from "../site";

type Status = "idle" | "sending" | "sent" | "error";

const EMPTY = {
  name: "",
  phone: "",
  email: "",
  business: "",
  fulfilment: "",
  service: "General order",
  needBy: "",
  needs: "",
};

const SERVICES = ["General order", "Wedding flowers", "Dutch flowers"];

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
    form.needBy && `Needed by: ${readableDate(form.needBy)}`,
  ].filter(Boolean);

  return ["Hello, I'd like to place a wholesale order.", "", ...details, "", "What I need:", form.needs].join("\n");
}

export default function Contact() {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState<Status>("idle");
  const honeypot = useRef<HTMLInputElement>(null);

  const message = summarise(form);
  const waUrl = whatsappHref(message);
  const mailtoUrl = `mailto:${shop.email}?subject=${encodeURIComponent(`Wholesale flower inquiry — ${form.name}`)}&body=${encodeURIComponent(message)}`;

  function set(key: keyof typeof EMPTY, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
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
    window.open(waUrl, "_blank", "noopener,noreferrer");

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
    <main>
      <SiteHeader />

      <section className="page-head section-pad">
        <h1>Tell Us What You Need</h1>
        <p className="section-note">
          Prices move with the market daily and are never posted, so we answer by phone or WhatsApp. Send the list and
          we will come back with what is in the cooler and what it costs today.
        </p>
      </section>

      <section className="enquiry section-pad">
        <div className="enquiry-form">
          {status === "sent" ? (
            <div className="enquiry-sent" role="status" aria-live="polite">
              <h2>Thank You, {form.name.split(" ")[0] || "we have it"}.</h2>
              <p>
                {formServiceConfigured
                  ? "Your list is on its way to the shop, and a WhatsApp draft is open in another tab. Send it and you will have a thread with the owner directly."
                  : "A WhatsApp draft is open in another tab with your list already written out. Send it, or email the same copy instead."}
              </p>
              <div className="enquiry-actions">
                <a className="solid-button" href={waUrl} target="_blank" rel="noreferrer">
                  Open WhatsApp again
                </a>
                {formServiceConfigured ? null : (
                  <a className="text-link" href={mailtoUrl}>
                    Email a copy
                  </a>
                )}
              </div>
              <button type="button" className="enquiry-reset" onClick={() => { setForm(EMPTY); setStatus("idle"); }}>
                Send another list
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Hidden from people, tempting to bots. */}
              <input ref={honeypot} className="honeypot" type="text" name="botcheck" tabIndex={-1} autoComplete="off" aria-hidden="true" />

              <div className="field">
                <label htmlFor="name">Name</label>
                <input id="name" name="name" type="text" required autoComplete="name" value={form.name} onChange={(e) => set("name", e.target.value)} />
              </div>

              <div className="field-row">
                <div className="field">
                  <label htmlFor="phone">Phone or WhatsApp</label>
                  <input id="phone" name="phone" type="tel" required autoComplete="tel" placeholder="201-815-1040" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                  <p className="field-hint">How we reply. Prices are quoted on the call.</p>
                </div>
                <div className="field">
                  <label htmlFor="email">Email <em>optional</em></label>
                  <input id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
                </div>
              </div>

              <div className="field">
                <label htmlFor="business">Business name <em>optional</em></label>
                <input id="business" name="business" type="text" autoComplete="organization" value={form.business} onChange={(e) => set("business", e.target.value)} />
              </div>

              <fieldset className="field">
                <legend>What kind of order</legend>
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
                  <legend>Pickup or delivery</legend>
                  <div className="choices">
                    {["Pickup", "Delivery"].map((option) => (
                      <label className="choice" key={option}>
                        <input type="radio" name="fulfilment" value={option} checked={form.fulfilment === option} onChange={(e) => set("fulfilment", e.target.value)} />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                  <p className="field-hint">We deliver across the New York metro area and nearby Connecticut.</p>
                </fieldset>
                <div className="field">
                  <label htmlFor="needBy">When you need it</label>
                  <input id="needBy" name="needBy" type="date" value={form.needBy} onChange={(e) => set("needBy", e.target.value)} />
                  <p className="field-hint">A rough date is fine. It changes what we can source.</p>
                </div>
              </div>

              <div className="field">
                <label htmlFor="needs">What you need</label>
                <textarea
                  id="needs"
                  name="needs"
                  required
                  rows={7}
                  placeholder="20 bunches Premium Rose, 10 Eucalyptus, 5 Hydrangea."
                  value={form.needs}
                  onChange={(e) => set("needs", e.target.value)}
                />
                <p className="field-hint">Variety and bunch count is all we need. Colours and substitutions can wait for the call.</p>
              </div>

              {status === "error" ? (
                <p className="field-error" role="alert">
                  That did not send. Your WhatsApp draft should still be open, or <a href={mailtoUrl}>email the list</a> instead.
                </p>
              ) : null}

              <button type="submit" className="enquiry-submit" disabled={status === "sending"}>
                {status === "sending" ? "Sending" : "Send this list"}
              </button>
              <p className="field-hint enquiry-note">Submitting also opens a WhatsApp draft so you have a thread with the owner.</p>
            </form>
          )}
        </div>

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
      </section>

      <SiteFooter />
    </main>
  );
}
