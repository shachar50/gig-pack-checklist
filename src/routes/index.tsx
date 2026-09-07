import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronRight,
  LayoutTemplate,
  Music,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { DEFAULT_ITEMS, TEMPLATES, formatGigDate, formatGigTime, useGigs } from "@/lib/gigs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GigList — Pack your gear, nail the gig" },
      {
        name: "description",
        content:
          "GigList is a simple packing checklist for musicians. Create a gig, check off your equipment, and never leave a cable behind.",
      },
      { property: "og:title", content: "GigList — Pack your gear, nail the gig" },
      {
        property: "og:description",
        content:
          "A simple packing checklist for musicians. Create a gig, check off your equipment, and never leave a cable behind.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { gigs, hydrated, createGig, deleteGig } = useGigs();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [location, setLocation] = useState("");
  const [templateId, setTemplateId] = useState<string>("custom");

  const upcoming = [...gigs].sort((a, b) => a.date.localeCompare(b.date));

  const handleCreate = () => {
    if (!name.trim() || !date) return;
    const items =
      templateId === "custom"
        ? DEFAULT_ITEMS
        : (TEMPLATES.find((t) => t.id === templateId)?.items ?? DEFAULT_ITEMS);
    const gig = createGig(name.trim(), date, items, {
      time: time || undefined,
      arrivalTime: arrivalTime || undefined,
      location: location.trim() || undefined,
    });
    setDialogOpen(false);
    setName("");
    setTime("");
    setArrivalTime("");
    setLocation("");
    setTemplateId("custom");
    window.location.href = `/gigs/${gig.id}`;
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-background px-5 pb-32 pt-10">
      {/* Header */}
      <header className="flex items-center gap-3">
        <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-soft">
          <Music className="size-6" strokeWidth={2.2} />
        </div>
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            GigList
          </h1>
          <p className="text-sm text-muted-foreground">Pack it. Play it.</p>
        </div>
      </header>

      {/* Upcoming gigs */}
      <h2 className="mt-10 font-display text-lg font-semibold text-foreground">
        Upcoming gigs
      </h2>

      {!hydrated ? null : upcoming.length === 0 ? (
        <div className="mt-4 rounded-3xl border border-dashed border-border bg-card p-8 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-secondary">
            <Sparkles className="size-6 text-muted-foreground" />
          </div>
          <p className="mt-4 font-medium text-foreground">No gigs yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first gig and start packing.
          </p>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {upcoming.map((gig) => {
            const packed = gig.items.filter((i) => i.packed).length;
            const total = gig.items.length;
            const pct = total === 0 ? 0 : Math.round((packed / total) * 100);
            const done = total > 0 && packed === total;
            return (
              <li key={gig.id} className="group relative">
                <Link
                  to="/gigs/$gigId"
                  params={{ gigId: gig.id }}
                  className="block rounded-3xl border border-border bg-card p-5 shadow-soft transition-transform duration-200 active:scale-[0.98]"
                >
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-display text-lg font-semibold text-card-foreground">
                        {gig.name}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <CalendarDays className="size-3.5 shrink-0" />
                        {formatGigDate(gig.date)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {done && (
                        <span className="flex items-center gap-1 rounded-full bg-success px-2.5 py-1 text-xs font-semibold text-success-foreground">
                          <Check className="size-3" strokeWidth={3} />
                          Packed
                        </span>
                      )}
                      <ChevronRight className="size-5 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-muted-foreground">
                        {packed} / {total} packed
                      </span>
                      <span className="text-muted-foreground">{pct}%</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-secondary">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          done ? "bg-success" : "bg-primary",
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </Link>
                <button
                  type="button"
                  aria-label={`Delete ${gig.name}`}
                  onClick={(e) => {
                    e.preventDefault();
                    if (window.confirm(`Delete "${gig.name}"?`)) deleteGig(gig.id);
                  }}
                  className="absolute -top-2 -left-2 grid size-8 place-items-center rounded-full border border-border bg-card text-muted-foreground opacity-0 shadow-soft transition-opacity group-hover:opacity-100 focus:opacity-100"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* New gig button */}
      <div className="fixed inset-x-0 bottom-0 z-10 mx-auto w-full max-w-md bg-gradient-to-t from-background via-background to-transparent px-5 pb-6 pt-8">
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary font-display text-lg font-semibold text-primary-foreground shadow-lift transition-transform duration-200 active:scale-[0.98]"
        >
          <Plus className="size-5" strokeWidth={2.5} />
          New Gig
        </button>
      </div>

      {/* Create dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="top-auto bottom-0 left-0 right-0 mx-auto w-full max-w-md translate-x-0 translate-y-0 rounded-t-3xl rounded-b-none border-0 p-6 pb-10 sm:left-[50%] sm:top-[50%] sm:bottom-auto sm:right-auto sm:w-[calc(100%-2rem)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-bold">
              New gig
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="gig-name">Gig name</Label>
              <Input
                id="gig-name"
                placeholder="e.g. Open mic at The Blue Note"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 rounded-xl text-base"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gig-date">Date</Label>
              <Input
                id="gig-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-12 rounded-xl text-base"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <LayoutTemplate className="size-3.5" />
                Checklist
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <TemplateCard
                  name="Full checklist"
                  description={`All ${DEFAULT_ITEMS.length} default items`}
                  selected={templateId === "custom"}
                  onClick={() => setTemplateId("custom")}
                />
                {TEMPLATES.map((t) => (
                  <TemplateCard
                    key={t.id}
                    name={t.name}
                    description={`${t.items.length} items`}
                    selected={templateId === t.id}
                    onClick={() => setTemplateId(t.id)}
                  />
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={handleCreate}
              disabled={!name.trim() || !date}
              className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 font-display text-lg font-semibold text-primary-foreground transition-opacity disabled:opacity-40"
            >
              Create gig
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TemplateCard({
  name,
  description,
  selected,
  onClick,
}: {
  name: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-2xl border-2 p-3.5 text-left transition-all duration-150 active:scale-[0.97]",
        selected
          ? "border-primary bg-accent"
          : "border-border bg-card hover:border-muted-foreground/30",
      )}
    >
      <p className="font-display text-sm font-semibold text-card-foreground">
        {name}
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
    </button>
  );
}
