const UP = [
  "record high",
  "upgrade",
  "beats",
  "beat",
  "surge",
  "surges",
  "rally",
  "rallies",
  "jumps",
  "jump",
  "gains",
  "gain",
  "rises",
  "rise",
  "rose",
  "approved",
  "approval",
  "surplus",
  "stimulus",
  "dovish",
];

const DOWN = [
  "downgrade",
  "misses",
  "miss",
  "plunge",
  "plunges",
  "falls",
  "fall",
  "fell",
  "drops",
  "drop",
  "dropped",
  "default",
  "glut",
  "lawsuit",
  "investigation",
  "recession",
  "hawkish",
  "ban",
];

export function headlineTone(title: string): { tone: "positive" | "negative" | "mixed" | "none"; word: string } {
  const text = ` ${title.toLowerCase()} `;
  const has = (word: string) => text.includes(word);
  const up = UP.find(has) ?? "";
  const down = DOWN.find(has) ?? "";
  if (up && down) return { tone: "mixed", word: `${up}, ${down}` };
  if (up) return { tone: "positive", word: up };
  if (down) return { tone: "negative", word: down };
  return { tone: "none", word: "" };
}
