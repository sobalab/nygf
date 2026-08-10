import type { CSSProperties, ReactNode } from "react";

// Text that cuts into view. Each piece sits in a box that clips it, and starts
// a full piece-height below its own baseline; the run lifts them to zero one
// after another, so the line looks scraped into existence rather than faded up.
//
// The whole effect is delay arithmetic on one keyframe, so nothing here runs on
// the client — no hook, no state, no measurement. The component only decides how
// the string is cut up and what number each piece carries; globals.css turns
// that number into a delay (see .cut-piece). It renders on the server and works
// with JavaScript switched off.
//
// WORD BOUNDARIES SURVIVE EVERY MODE, which is the one structural rule here:
//   - Splitting by characters still nests them inside a per-word box. Without
//     it a long word breaks mid-word at a narrow width, stranding "Excep-" on
//     one line and "tional" on the next, because each character would be its
//     own wrapping opportunity.
//   - Lines stay their own element so each one lifts off its own baseline. A
//     single box around a two-line heading would send the second line rising
//     from the bottom of the first, which reads as a slide, not a cut.

type StaggerFrom = "first" | "last" | "center" | "random";

type Props = {
  // Newlines are line breaks: the heading's two lines are one string, so the
  // stagger runs unbroken across both rather than restarting on the second.
  text: string;
  // "words" | "characters" | "lines", or any other string, which is used as the
  // delimiter to cut on.
  splitBy?: string;
  staggerFrom?: StaggerFrom;
  // Milliseconds between one piece starting and the next.
  stagger?: number;
  duration?: number;
  // A number is milliseconds. A string is passed to CSS untouched, so a caller
  // can hand over a custom property and hang the run off something the
  // stylesheet already knows — the hero waits on --hero-start that way.
  delay?: number | string;
  // Pieces rise from below by default and drop from above when reversed.
  reverse?: boolean;
  // Line index from which lines are set in <em>. The heading italicises its
  // second line, and that has to survive being cut into characters.
  emphasizeFrom?: number;
  className?: string;
};

// Deterministic, because the server and the browser both run this and have to
// agree — Math.random() would render one order into the HTML and a different one
// on hydration. Seeded off the text, so a given string always shuffles the same
// way and the order is stable across reloads.
function shuffledOrder(total: number, seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const order = Array.from({ length: total }, (_, i) => i);
  for (let i = total - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    const j = ((h ^ (h >>> 16)) >>> 0) % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

// Which turn a piece takes. Not its position — its place in the queue.
function orderFor(total: number, from: StaggerFrom, seed: string) {
  if (from === "random") return shuffledOrder(total, seed);
  return Array.from({ length: total }, (_, i) => {
    if (from === "last") return total - 1 - i;
    // Fractional on an even count, which is what makes a pair either side of
    // the middle start together rather than one leading by a whole step.
    if (from === "center") return Math.abs(i - (total - 1) / 2);
    return i;
  });
}

// A line is cut into boxes that may not break, and each box into the pieces
// that animate. Splitting on whitespace with a capture keeps the gaps, so the
// spaces stay real text between the boxes and the line wraps as prose does.
function cutLine(line: string, splitBy: string) {
  if (splitBy === "lines") return [[line]];
  const chunks = splitBy === "words" || splitBy === "characters" ? line.split(/(\s+)/) : line.split(splitBy);
  return chunks
    .filter((chunk) => chunk.length > 0)
    .map((chunk) => (splitBy === "characters" && chunk.trim() ? Array.from(chunk) : [chunk]));
}

export function CutReveal({
  text,
  splitBy = "characters",
  staggerFrom = "first",
  stagger = 28,
  duration = 700,
  delay = 0,
  reverse = false,
  emphasizeFrom,
  className,
}: Props) {
  const lines = text.split("\n").map((line) => cutLine(line, splitBy));
  // Numbered across the whole string rather than per line, so the queue carries
  // over the break instead of two runs starting at once.
  const total = lines.reduce((sum, boxes) => sum + boxes.reduce((n, box) => n + box.filter((p) => p.trim()).length, 0), 0);
  const order = orderFor(total, staggerFrom, text);

  let piece = 0;
  const style = {
    "--cut-duration": `${duration}ms`,
    "--cut-stagger": `${stagger}ms`,
    "--cut-delay": typeof delay === "number" ? `${delay}ms` : delay,
    "--cut-from": reverse ? "-118%" : "118%",
  } as CSSProperties;

  return (
    // The string is said once, here. Everything under it is scenery: a reader
    // on a screen reader should hear the heading, not thirty-five fragments of
    // it, and the spaces between the boxes would be read out too.
    <span className={className ? `cut ${className}` : "cut"} style={style} aria-label={text}>
      <span aria-hidden="true">
        {lines.map((boxes, lineIndex) => {
          const Line = emphasizeFrom !== undefined && lineIndex >= emphasizeFrom ? "em" : "span";
          return (
            <Line className="cut-line" key={lineIndex}>
              {boxes.map((box, boxIndex) => {
                // Runs of whitespace are the gaps between boxes, not boxes of
                // their own: kept as bare text so the line breaks at them.
                if (box.length === 1 && !box[0].trim()) return box[0];
                return (
                  <span className="cut-box" key={boxIndex}>
                    {box.map((content, i) => {
                      const style = { "--i": order[piece++] } as CSSProperties;
                      return (
                        <span className="cut-mask" key={i}>
                          <span className="cut-piece" style={style}>
                            {content}
                          </span>
                        </span>
                      );
                    })}
                  </span>
                );
              })}
            </Line>
          );
        })}
      </span>
    </span>
  );
}

export type { Props as CutRevealProps, StaggerFrom, ReactNode };
