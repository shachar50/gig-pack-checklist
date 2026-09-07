import { createFileRoute, Link, notFound, useParams } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  CalendarDays,
  Check,
  PartyPopper,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { formatGigDate, useGigs, type GearItem } from "@/lib/gigs";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/gigs/$gigId")({
  loader: ({ params }) => {
    if (typeof window === "undefined") return null;
    try {
      const gigs = JSON.parse(localStorage.getItem("giglist.gigs.v1") ?? "[]");
      if (!gigs.some((g: { id: string }) => g.id === params.gigId)) throw notFound();
    } catch (e) {
      if (e && typeof e === "object" && "isNotFound" in e) throw e;
    }
    return null;
  },
  head: () => ({
    meta: [
      { title: "Gig checklist — GigList" },
      { name: "description", content: "Check off your equipment as you pack for the gig." },
      { property: "og:title", content: "Gig checklist — GigList" },
      { property: "og:description", content: "Check off your equipment as you pack for the gig." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GigPage,
  notFoundComponent: GigNotFound,
});

function GigNotFound() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center bg-background px-5 text-center">
      <p className="font-display text-2xl font-bold text-foreground">Gig not found</p>
      <p className="mt-2 text-sm text-muted-foreground">
        It may have been deleted.
      </p>
      <Link
        to="/"
        className="mt-6 rounded-2xl bg-primary px-6 py-3 font-display font-semibold text-primary-foreground"
      >
        Back to gigs
      </Link>
    </div>
  );
}

function GigPage() {
  const { gigId } = useParams({ from: "/gigs/$gigId" });
  const { gigs, hydrated, updateGig } = useGigs();
  const [newItem, setNewItem] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [justCompleted, setJustCompleted] = useState(false);
  const prevDoneRef = useRef(false);

  const gig = gigs.find((g) => g.id === gigId);

  const packed = gig?.items.filter((i) => i.packed).length ?? 0;
  const total = gig?.items.length ?? 0;
  const done = total > 0 && packed === total;
  const pct = total === 0 ? 0 : Math.round((packed / total) * 100);

  useEffect(() => {
    if (done && !prevDoneRef.current && prevDoneRef.current !== undefined) {
      // only celebrate on transition after hydration
      if (prevDoneRef.current === false && hydrated) setJustCompleted(true);
    }
    prevDoneRef.current = done;
  }, [done, hydrated]);

  if (!hydrated) return <div className="min-h-screen bg-background" />;
  if (!gig) return <GigNotFound />;

  const setItems = (items: GearItem[]) => updateGig(gig.id, (g) => ({ ...g, items }));

  const toggle = (id: string) =>
    setItems(gig.items.map((i) => (i.id === id ? { ...i, packed: !i.packed } : i)));

  const addItem = () => {
    const name = newItem.trim();
    if (!name) return;
    setItems([...gig.items, { id: crypto.randomUUID(), name, packed: false }]);
    setNewItem("");
  };

  const removeItem = (id: string) => setItems(gig.items.filter((i) => i.id !== id));

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= gig.items.length) return;
    const next = [...gig.items];
    const moved = next[index];
    next[index] = next[target]!;
    next[target] = moved!;
    setItems(next);
  };

  const saveEdit = () => {
    if (editingId && editingName.trim()) {
      setItems(
        gig.items.map((i) => (i.id === editingId ? { ...i, name: editingName.trim() } : i)),
      );
    }
    setEditingId(null);
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-background px-5 pb-40 pt-6">
      {/* Top bar */}
      <div className="flex items-center gap-3">
        <Link
          to="/"
          aria-label="Back to gigs"
          className="grid size-11 shrink-0 place-items-center rounded-full border border-border bg-card text-foreground shadow-soft transition-transform active:scale-95"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-2xl font-bold tracking-tight text-foreground">
            {gig.name}
          </h1>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarDays className="size-3.5 shrink-0" />
            {formatGigDate(gig.date)}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-6 rounded-3xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-end justify-between">
          <p className="font-display text-4xl font-bold tabular-nums text-foreground">
            {packed}
            <span className="text-xl font-medium text-muted-foreground"> / {total}</span>
          </p>
          <p
            className={cn(
              "text-sm font-semibold",
              done ? "text-success" : "text-muted-foreground",
            )}
          >
            {done ? "All packed!" : `${pct}% packed`}
          </p>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-secondary">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out",
              done ? "bg-success" : "bg-primary",
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Completed banner */}
      {done && (
        <div
          className={cn(
            "mt-4 flex items-center gap-3 rounded-3xl bg-success p-5 text-success-foreground shadow-soft",
            justCompleted && "animate-pop",
          )}
        >
          <PartyPopper className="size-7 shrink-0" />
          <div>
            <p className="font-display text-lg font-bold">You're all packed!</p>
            <p className="text-sm opacity-90">Break a leg out there.</p>
          </div>
        </div>
      )}

      {/* Checklist */}
      <ul className="mt-6 space-y-2.5">
        {gig.items.map((item, index) => (
          <li
            key={item.id}
            className={cn(
              "rounded-2xl border bg-card transition-all duration-300",
              item.packed ? "border-success/40 bg-success-soft" : "border-border shadow-soft",
            )}
          >
            {editingId === item.id ? (
              <div className="flex items-center gap-2 p-3">
                <input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEdit();
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  autoFocus
                  className="h-11 min-w-0 flex-1 rounded-xl border border-input bg-background px-3 text-base outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="button"
                  aria-label="Save name"
                  onClick={saveEdit}
                  className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground active:scale-95"
                >
                  <Check className="size-5" />
                </button>
                <button
                  type="button"
                  aria-label="Cancel"
                  onClick={() => setEditingId(null)}
                  className="grid size-11 shrink-0 place-items-center rounded-xl border border-border bg-card text-muted-foreground active:scale-95"
                >
                  <X className="size-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 p-2 pl-3">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={item.packed}
                  aria-label={`Mark ${item.name} as packed`}
                  onClick={() => toggle(item.id)}
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-full border-2 transition-all duration-200 active:scale-90",
                    item.packed
                      ? "animate-checkpop border-success bg-success text-success-foreground"
                      : "border-muted-foreground/40 bg-background text-transparent",
                  )}
                >
                  <Check className="size-5" strokeWidth={3} />
                </button>
                <button
                  type="button"
                  onClick={() => toggle(item.id)}
                  className="min-w-0 flex-1 py-3 text-left"
                >
                  <span
                    className={cn(
                      "text-base font-medium transition-all duration-300",
                      item.packed
                        ? "text-muted-foreground line-through decoration-success/60 decoration-2"
                        : "text-card-foreground",
                    )}
                  >
                    {item.name}
                  </span>
                </button>
                <div className="flex shrink-0 items-center">
                  <IconBtn
                    label={`Move ${item.name} up`}
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                  >
                    <ArrowUp className="size-4" />
                  </IconBtn>
                  <IconBtn
                    label={`Move ${item.name} down`}
                    disabled={index === gig.items.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    <ArrowDown className="size-4" />
                  </IconBtn>
                  <IconBtn
                    label={`Rename ${item.name}`}
                    onClick={() => {
                      setEditingId(item.id);
                      setEditingName(item.name);
                    }}
                  >
                    <Pencil className="size-4" />
                  </IconBtn>
                  <IconBtn label={`Delete ${item.name}`} onClick={() => removeItem(item.id)}>
                    <Trash2 className="size-4" />
                  </IconBtn>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* Add item */}
      <div className="fixed inset-x-0 bottom-0 z-10 mx-auto w-full max-w-md bg-gradient-to-t from-background via-background to-transparent px-5 pb-6 pt-8">
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-lift">
          <input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addItem()}
            placeholder="Add an item…"
            className="h-11 min-w-0 flex-1 rounded-xl bg-transparent px-3 text-base text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={addItem}
            disabled={!newItem.trim()}
            className="flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-primary px-4 font-display font-semibold text-primary-foreground transition-all active:scale-95 disabled:opacity-40"
          >
            <Plus className="size-4" strokeWidth={2.5} />
            Add item
          </button>
        </div>
      </div>
    </div>
  );
}

function IconBtn({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="grid size-10 place-items-center rounded-xl text-muted-foreground transition-all hover:bg-secondary active:scale-90 disabled:opacity-25"
    >
      {children}
    </button>
  );
}
