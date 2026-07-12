import { ArrowUpRight, MapPin } from "lucide-react";

interface Destination {
  name: string;
  region: string;
  blurb: string;
  ideal: string;
  imageId: number;
  prompt: string;
}

// Placeholder photography via Lorem Picsum (stable id URLs). The seed images are
// generic landscapes, not the actual cities — swap for licensed shots later.
const DESTINATIONS: Destination[] = [
  {
    name: "Kyoto",
    region: "Japan",
    blurb: "Temples, moss gardens, and slow mornings before the crowds arrive.",
    ideal: "Ideal for 4-6 days",
    imageId: 1039,
    prompt: "5 days in Kyoto: temples, gardens, food markets, and a day trip to Nara",
  },
  {
    name: "Lisbon",
    region: "Portugal",
    blurb: "Tiled hills, miradouro viewpoints, and long seafood lunches.",
    ideal: "Ideal for 3-5 days",
    imageId: 1015,
    prompt: "A long weekend in Lisbon: viewpoints, seafood, and a day trip to Sintra",
  },
  {
    name: "Cape Town",
    region: "South Africa",
    blurb: "A city where the mountains run straight into two oceans.",
    ideal: "Ideal for 5-7 days",
    imageId: 1018,
    prompt: "6 days in Cape Town: Table Mountain, coastal drives, and the winelands",
  },
  {
    name: "Queenstown",
    region: "New Zealand",
    blurb: "Alpine lakes, big skies, and adventure at every turn.",
    ideal: "Ideal for 4-6 days",
    imageId: 1016,
    prompt: "5 days in Queenstown: lakes, hikes, and one adrenaline day",
  },
];

export function PopularDestinations({ onPick }: { onPick: (prompt: string) => void }) {
  return (
    <section aria-labelledby="popular-heading" className="flex flex-col gap-5">
      <h2 id="popular-heading" className="font-display text-xl font-semibold tracking-tight">
        Popular destinations
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {DESTINATIONS.map((destination) => (
          <button
            key={destination.name}
            type="button"
            onClick={() => onPick(destination.prompt)}
            className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card text-left shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <div className="relative h-36 overflow-hidden">
              <div
                className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{
                  backgroundColor: "hsl(var(--muted))",
                  backgroundImage: `url(https://picsum.photos/id/${destination.imageId}/640/400)`,
                }}
              />
              <span className="absolute right-2.5 top-2.5 grid size-7 place-items-center rounded-full bg-card/80 text-foreground opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
                <ArrowUpRight className="size-4" aria-hidden />
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-1.5 p-4">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-display text-base font-semibold tracking-tight">
                  {destination.name}
                </h3>
                <span className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
                  <MapPin className="size-3" aria-hidden />
                  {destination.region}
                </span>
              </div>
              <p className="text-pretty text-sm leading-snug text-muted-foreground">
                {destination.blurb}
              </p>
              <span className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-primary">
                {destination.ideal}
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
