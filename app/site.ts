// Shop contact details in one place, so the phone number only has to be
// corrected once. The links elsewhere on the site still hardcode these; move
// them over as those files get touched.
export const shop = {
  storePhone: "718-886-1190",
  storePhoneHref: "tel:+17188861190",
  // The owner's cell. WhatsApp and SMS both land here.
  ownerPhone: "201-815-1040",
  whatsappNumber: "12018151040",
  smsHref: "sms:+12018151040",
  email: "nyflowergarden@hotmail.com",
  address: "171-10 39th Ave\nFlushing, NY 11358",
  mapsHref: "https://maps.google.com/?q=171-10+39th+Ave+Flushing+NY+11358",
  hours: "Mon–Sat, 6 AM–2 PM\nSunday, 6 AM–12 PM",
};

// Web3Forms delivers the contact form to the shop inbox. It is free and needs
// no server: sign up at https://web3forms.com with nyflowergarden@hotmail.com,
// paste the access key it emails you here, and redeploy. Until then the form
// still works — it opens the WhatsApp draft and offers a one-tap email copy
// instead of sending one automatically.
export const web3formsAccessKey = "f6e3c1b7-6a30-4046-9b9b-77706f80f1cb";

export const formServiceConfigured =
  web3formsAccessKey.length > 0 && !web3formsAccessKey.startsWith("YOUR_");

export function whatsappHref(message: string) {
  return `https://wa.me/${shop.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
