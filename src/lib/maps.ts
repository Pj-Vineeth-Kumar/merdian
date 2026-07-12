/**
 * Build a Google Maps search URL for a place. Opening it in a new tab lets the
 * user see the exact location, reviews, and directions — turning each AI-named
 * stop into something they can actually navigate to.
 */
export function googleMapsUrl(place: string, near?: string | null): string {
  const query = near ? `${place}, ${near}` : place;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
