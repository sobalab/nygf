"use client";

import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { whatsappHref } from "./site";

// Every "ask" on the site used to be a wa.me link, which means an inquiry that
// only ever reaches one of the shop's two inboxes: whatever is said in that
// thread leaves no trace in the email the shop actually files against. The
// inquiry form reaches both — it posts to the shop's inbox and opens the
// WhatsApp draft in the same submit — so the ask now offers that first and
// keeps the one-tap thread beside it for a question that doesn't need a list.
//
// The trigger stays an anchor pointing at WhatsApp rather than becoming a
// button. Three things fall out of that and all three matter: the existing
// button classes style it without a line of new CSS, the link still works with
// the script gone or still loading, and a reader who copies the link address
// gets a WhatsApp link rather than nothing. The dialog is an enhancement on top
// of a link that already went somewhere sensible.
export function Ask({
  className,
  children,
  message,
  inquiry,
}: {
  className?: string;
  children: ReactNode;
  /** The WhatsApp draft, used both by the fallback href and by the dialog. */
  message: string;
  /** Where "send an inquiry" goes, with whatever the reader was looking at
      already named in the query so the form opens knowing it. */
  inquiry: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  // <dialog> is only rendered once it has been asked for. Otherwise the flower
  // pages, which are static HTML and carry one of these per page, would ship a
  // hidden copy of the same panel to every reader who never opens it.
  const [asked, setAsked] = useState(false);
  const wa = whatsappHref(message);

  useEffect(() => {
    if (asked) ref.current?.showModal();
  }, [asked]);

  function open(event: MouseEvent<HTMLAnchorElement>) {
    // Modified clicks are a reader asking for the link itself — a new tab, a
    // new window, a saved target. Those get WhatsApp, as the href says.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    setAsked(true);
  }

  return (
    <>
      <a className={className} href={wa} target="_blank" rel="noreferrer" onClick={open}>
        {children}
      </a>
      {asked ? (
        // Native modal: the backdrop, the Escape key, the focus loop and the
        // rest of the page going inert are all the element's own, and none of
        // them are worth reimplementing. Closing unmounts it so a second ask
        // opens a fresh one rather than a stale one being re-shown.
        <dialog className="ask-dialog" ref={ref} onClose={() => setAsked(false)}>
          <h2>Two Ways to Ask</h2>
          <p>
            An inquiry reaches the shop twice, by email and on WhatsApp, so nothing is lost if a thread goes quiet. A
            message on its own is quicker when the answer is one line.
          </p>
          <div className="ask-actions">
            <a className="solid-button" href={inquiry}>Send an inquiry</a>
            <a className="ask-quiet" href={wa} target="_blank" rel="noreferrer" onClick={() => ref.current?.close()}>
              Message on WhatsApp
            </a>
          </div>
          <button type="button" className="ask-close" onClick={() => ref.current?.close()} aria-label="Close">
            <span aria-hidden="true">×</span>
          </button>
        </dialog>
      ) : null}
    </>
  );
}
