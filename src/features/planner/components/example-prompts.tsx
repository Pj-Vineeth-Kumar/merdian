const EXAMPLES = [
  "3 days in Kyoto: temples, food markets, and a day trip to Nara",
  "A long weekend in Lisbon on a mid-range budget, lots of viewpoints",
  "5 days in Mexico City for a first-timer who loves art and tacos",
  "48 hours in Reykjavik in winter: northern lights and hot springs",
] as const;

export function ExamplePrompts({ onPick }: { onPick: (prompt: string) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        Try one
      </span>
      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => onPick(example)}
            className="rounded-full border border-border bg-card/40 px-3 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
