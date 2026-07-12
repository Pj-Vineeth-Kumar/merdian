// Short labels keep the pills compact so they wrap into a centered cloud under
// the search bar; each carries a richer prompt that fills the input on click.
const EXAMPLES = [
  { label: "Jaipur in 3 days", prompt: "3 days in Jaipur: forts, palaces, and bazaars" },
  {
    label: "Kerala backwaters",
    prompt: "5 days in Kerala: Alleppey backwaters, Munnar tea hills, and Kochi",
  },
  { label: "Goa long weekend", prompt: "A long weekend in Goa: beaches, cafes, and old Goa churches" },
  {
    label: "Golden Triangle",
    prompt: "6 days across the Golden Triangle: Delhi, Agra, and Jaipur",
  },
  { label: "Ladakh road trip", prompt: "7 days in Ladakh: Leh, Pangong Lake, and Nubra Valley" },
  {
    label: "Varanasi & the Ganges",
    prompt: "3 days in Varanasi: ghats, temples, and a sunrise boat ride",
  },
] as const;

export function ExamplePrompts({ onPick }: { onPick: (prompt: string) => void }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/55">
        Try one
      </span>
      <div className="flex flex-wrap justify-center gap-2">
        {EXAMPLES.map((example) => (
          <button
            key={example.label}
            type="button"
            onClick={() => onPick(example.prompt)}
            className="rounded-full border border-border/80 bg-card/50 px-3 py-1.5 text-sm text-muted-foreground backdrop-blur-sm transition-colors hover:border-primary/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {example.label}
          </button>
        ))}
      </div>
    </div>
  );
}
