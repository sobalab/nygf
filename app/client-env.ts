"use client";

import { useSyncExternalStore } from "react";

// Two facts about the browser that the server cannot know, read the way React
// asks for facts that live outside it. Both were effects that set state on
// mount, which works but tells React the value changed when it did not — the
// component simply learned it. useSyncExternalStore says that directly: a
// server snapshot, a client snapshot, and a subscription for the one that can
// change. No second render pass, and nothing to clean up.

// Whether we are past the server render. Everything the page arms — the pinned
// story track, the staged reveals — is off until this is true, so the markup
// that ships is the markup a reader without JavaScript is left with.
const noop = () => () => {};
export function useMounted() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}

// A media query as a value. False on the server, since there is no viewport to
// measure and the wide layout is the one the markup is written for.
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (notify) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", notify);
      return () => list.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
