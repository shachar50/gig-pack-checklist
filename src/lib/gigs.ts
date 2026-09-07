import { useCallback, useEffect, useState } from "react";

export interface GearItem {
  id: string;
  name: string;
  packed: boolean;
}

export interface Gig {
  id: string;
  name: string;
  date: string; // yyyy-mm-dd
  time?: string | undefined; // HH:MM (24h)
  arrivalTime?: string | undefined; // HH:MM (24h)
  location?: string | undefined;
  items: GearItem[];
}

export const DEFAULT_ITEMS = [
  "Piano",
  "Laptop",
  "Audio interface",
  "iPad",
  "Laptop stand",
  "Music stand",
  "Guitar",
  "Stereo TRS/PL cable",
  "USB cable",
  "Power supply",
  "Sustain pedal",
  "Extension cable",
];

export interface GigTemplate {
  id: string;
  name: string;
  description: string;
  items: string[];
}

export const TEMPLATES: GigTemplate[] = [
  {
    id: "piano-laptop",
    name: "Piano + Laptop",
    description: "Keys rig with laptop and audio interface",
    items: [
      "Piano",
      "Laptop",
      "Audio interface",
      "Laptop stand",
      "USB cable",
      "Power supply",
      "Sustain pedal",
      "Extension cable",
    ],
  },
  {
    id: "guitar",
    name: "Guitar",
    description: "Just the guitar essentials",
    items: [
      "Guitar",
      "Guitar case / gig bag",
      "Spare strings",
      "Picks",
      "Capo",
      "Instrument cable",
      "Tuner",
      "Power supply",
    ],
  },
  {
    id: "full-setup",
    name: "Full Setup",
    description: "The complete rig — everything on the list",
    items: DEFAULT_ITEMS,
  },
];

const STORAGE_KEY = "giglist.gigs.v1";

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function makeItems(names: string[]): GearItem[] {
  return names.map((name) => ({ id: uid(), name, packed: false }));
}

function readGigs(): Gig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeGigs(gigs: Gig[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(gigs));
}

export function useGigs() {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setGigs(readGigs());
    setHydrated(true);
  }, []);

  const update = useCallback((next: Gig[]) => {
    setGigs(next);
    writeGigs(next);
  }, []);

  const createGig = useCallback(
    (
      name: string,
      date: string,
      itemNames: string[],
      details?: { time?: string | undefined; arrivalTime?: string | undefined; location?: string | undefined },
    ): Gig => {
      const gig: Gig = { id: uid(), name, date, items: makeItems(itemNames), ...details };
      update([...readGigs(), gig]);
      return gig;
    },
    [update],
  );

  const deleteGig = useCallback(
    (id: string) => {
      update(readGigs().filter((g) => g.id !== id));
    },
    [update],
  );

  const updateGig = useCallback(
    (id: string, updater: (gig: Gig) => Gig) => {
      update(readGigs().map((g) => (g.id === id ? updater(g) : g)));
    },
    [update],
  );

  return { gigs, hydrated, createGig, deleteGig, updateGig };
}

export function formatGigTime(time?: string): string {
  if (!time) return "";
  const parts = time.split(":").map(Number);
  const h = parts[0];
  const m = parts[1];
  if (h === undefined || m === undefined || Number.isNaN(h) || Number.isNaN(m)) return time;
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function googleMapsUrl(location: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}

export function formatGigDate(date: string): string {
  try {
    const d = new Date(date + "T00:00:00");
    return d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return date;
  }
}
