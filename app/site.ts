// Where the site lives, resolved at build time so every route stays static.
// Vercel sets VERCEL_PROJECT_PRODUCTION_URL to the production domain (no
// protocol) on every deployment, so preview builds still point their OG tags,
// canonicals and sitemap at the live site. Set NEXT_PUBLIC_SITE_URL once a
// custom domain is attached.
//   It sits here rather than in the root layout because the sitemap needs the
// same answer, and two copies of this expression is how a preview build ends up
// publishing localhost.
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

// Shop contact details in one place, so the phone number only has to be
// corrected once. The links elsewhere on the site still hardcode these; move
// them over as those files get touched.
export const shop = {
  storePhone: "718-886-1190",
  storePhoneHref: "tel:+17188861190",
  // The owner's cell, and the number the shop works from. Most links to it are
  // sms: ones — a thread the owner reads on the phone already in their hand —
  // but it is a phone and it is answered, so the contact page's call card dials
  // it. Both hrefs are kept: the one to use is whether the surface is offering a
  // message or a call, and neither should be built by hand at the call site.
  ownerPhone: "201-815-1040",
  smsHref: "sms:+12018151040",
  ownerPhoneHref: "tel:+12018151040",
  email: "nyflowergarden@hotmail.com",
  address: "171-10 39th Ave\nFlushing, NY 11358",
  mapsHref: "https://maps.google.com/?q=171-10+39th+Ave+Flushing+NY+11358",
  hours: "Mon–Sat, 6 AM–2 PM\nSunday, 6 AM–12 PM",
};

// Web3Forms delivers the contact form to the shop inbox. It is free and needs
// no server: sign up at https://web3forms.com with nyflowergarden@hotmail.com,
// paste the access key it emails you here, and redeploy. Until then the form
// still works — it opens the text draft and offers a one-tap email copy
// instead of sending one automatically.
export const web3formsAccessKey = "f6e3c1b7-6a30-4046-9b9b-77706f80f1cb";

export const formServiceConfigured =
  web3formsAccessKey.length > 0 && !web3formsAccessKey.startsWith("YOUR_");

// A text draft to the owner's cell, written out and waiting to be sent. It is
// where an inquiry is actually read: the cell takes iMessage and SMS, and that
// is the thread the shop works from.
//   The separator before the body is the one part of sms: that platforms
// disagree on. RFC 5724 says "?", which is what Android wants; Apple's Messages
// fills the body only when it is "&" and drops it silently otherwise, which is
// the worst of the two failures — a draft that opens addressed to the right
// number with nothing written in it.
//   Read the agent off navigator rather than off a build-time constant, and
// only ever call this from a click: the answer differs between the server and
// the browser, so a value rendered into markup would be a hydration mismatch.
export function smsDraftHref(message: string) {
  const apple = typeof navigator !== "undefined" && /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent);
  return `${shop.smsHref}${apple ? "&" : "?"}body=${encodeURIComponent(message)}`;
}
