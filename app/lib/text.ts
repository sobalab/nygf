// One spelling for both sides of every search on the site: lower case, and
// accents pulled off the letters they sit on, so "peonies" finds Peony's
// neighbours and a typed "e" still reaches an "é". The query runs through the
// same function as the haystack, so the two strings are always compared in the
// same form.
//   This lives in its own module rather than in catalogue-data.ts, where it
// started, because the admin cooler search wants the identical rule and must not
// import the catalogue to get it. That file runs two invariants at module load
// and throws on either — correct while only prerendered routes import it, since
// the failure is a build failure. A runtime module importing it would move those
// throws to request time, and a mistyped colour would take the cooler screen
// down at six in the morning. Nine lines here is the price of keeping them apart.
export function normalize(value: string) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

export function normalizeQuery(value: string) {
  return normalize(value.trim());
}
