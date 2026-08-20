"use client";

import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { shop, smsDraftHref } from "./site";

// Every "ask" on the site used to be a one-tap message, which means an inquiry
// that only ever reaches one of the shop's two inboxes: whatever is said in
// that thread leaves no trace in the email the shop actually files against. The
// inquiry form reaches both — it posts to the shop's inbox and opens the text
// draft in the same submit — so the ask now offers that first and keeps the
// one-tap thread beside it for a question that doesn't need a list.
//
// The trigger stays an anchor pointing at the cell rather than becoming a
// button. Three things fall out of that and all three matter: the existing
// button classes style it without a line of new CSS, the link still works with
// the script gone or still loading, and a reader who copies the link address
// gets the shop's number rather than nothing. The dialog is an enhancement on
// top of a link that already went somewhere sensible.
//   What is in the markup is the bare number, and the written-out draft is put
// together on the click: the body a text draft carries is spelled one way on
// Apple's phones and another everywhere else, so the address can only be
// settled in the browser — see smsDraftHref — and a value that differs between
// the server and the browser cannot be rendered into an href.
export function Ask({
  className,
  children,
  message,
  inquiry,
}: {
  className?: string;
  children: ReactNode;
  /** What the text draft says, written out on the click that asks for it. */
  message: string;
  /** Where "send an inquiry" goes, with whatever the reader was looking at
      already named in the query so the form opens knowing it. */
  inquiry: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const still = useReducedMotion();
  // <dialog> is only rendered once it has been asked for. Otherwise the flower
  // pages, which are static HTML and carry one of these per page, would ship a
  // hidden copy of the same panel to every reader who never opens it.
  const [asked, setAsked] = useState(false);

  useEffect(() => {
    if (asked) ref.current?.showModal();
  }, [asked]);

  function open(event: MouseEvent<HTMLAnchorElement>) {
    // Modified clicks are a reader asking for the link itself — a new tab, a
    // new window, a saved target. Those get the bare number, as the href says.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    setAsked(true);
  }

  function text() {
    ref.current?.close();
    window.location.href = smsDraftHref(message);
  }

  return (
    <>
      <a className={className} href={shop.smsHref} onClick={open}>
        {children}
      </a>
      {asked ? (
        // Native modal: the backdrop, the Escape key, the focus loop and the
        // rest of the page going inert are all the element's own, and none of
        // them are worth reimplementing. Closing unmounts it so a second ask
        // opens a fresh one rather than a stale one being re-shown.
        // The panel is a motion element but the backdrop behind it is not, and
        // cannot be: ::backdrop is a pseudo-element with no node to hand to
        // Motion, so its fade stays in the stylesheet. The two are matched by
        // hand — same duration, same curve — which is the price of the native
        // dialog being worth keeping.
        <motion.dialog
          className="ask-dialog"
          ref={ref}
          onClose={() => setAsked(false)}
          initial={still ? false : { opacity: 0, y: 14, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: still ? 0 : 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2>Two Ways to Ask</h2>
          <p>
            An inquiry reaches the shop twice, by email and by text, so nothing is lost if a thread goes quiet. A
            text on its own is quicker when the answer is one line.
          </p>
          <div className="ask-actions">
            <a className="solid-button" href={inquiry}>Send an inquiry</a>
            <a className="ask-quiet" href={shop.smsHref} onClick={(event) => { event.preventDefault(); text(); }}>
              Send a text
            </a>
          </div>
          <button type="button" className="ask-close" onClick={() => ref.current?.close()} aria-label="Close">
            <span aria-hidden="true">×</span>
          </button>
        </motion.dialog>
      ) : null}
    </>
  );
}
