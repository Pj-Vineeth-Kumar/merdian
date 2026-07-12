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
    name: "Jaipur",
    region: "Rajasthan",
    blurb: "Pink City forts, palace courtyards, and buzzing bazaars.",
    ideal: "Ideal for 3-4 days",
    imageId: 1016,
    prompt: "4 days in Jaipur: Amber Fort, City Palace, Hawa Mahal, and the bazaars",
  },
  {
    name: "Kerala",
    region: "Backwaters",
    blurb: "Houseboats on palm-lined canals and cool tea-country hills.",
    ideal: "Ideal for 5-7 days",
    imageId: 1015,
    prompt: "6 days in Kerala: Alleppey backwaters, Munnar tea hills, and Fort Kochi",
  },
  {
    name: "Goa",
    region: "West coast",
    blurb: "Beaches, beach shacks, and sleepy Portuguese-era lanes.",
    ideal: "Ideal for 3-5 days",
    imageId: 1039,
    prompt: "A long weekend in Goa: North Goa beaches, cafes, and Old Goa churches",
  },
  {
    name: "Ladakh",
    region: "Himalayas",
    blurb: "High-altitude lakes, hilltop monasteries, and mountain passes.",
    ideal: "Ideal for 6-8 days",
    imageId: 1018,
    prompt: "7 days in Ladakh: Leh, Pangong Lake, Nubra Valley, and monasteries",
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
