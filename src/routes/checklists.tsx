import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  ListChecks,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useChecklists, useEquipmentLibrary, type Checklist } from "@/lib/gigs";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/checklists")({
  head: () => ({
    meta: [
      { title: "Checklists — GigList" },
      {
        name: "description",
        content:
          "Create and edit reusable equipment checklists you can apply to any gig in GigList.",
      },
      { property: "og:title", content: "Checklists — GigList" },
      {
        property: "og:description",
        content: "Create and edit reusable equipment checklists for your gigs.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChecklistsPage,
});

function ChecklistsPage() {
  const { checklists, hydrated, createChecklist, updateChecklist, deleteChecklist } =
    useChecklists();
  const [newName, setNewName] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const create = () => {
    const name = newName.trim();
    if (!name) return;
    const list = createChecklist(name, []);
    setNewName("");
    setOpenId(list.id);
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-background px-5 pb-32 pt-6">
      <div className="flex items-center gap-3">
        <Link
          to="/"
          aria-label="Back to gigs"
          className="grid size-11 shrink-0 place-items-center rounded-full border border-border bg-card text-foreground shadow-soft transition-transform active:scale-95"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Checklists
          </h1>
          <p className="text-sm text-muted-foreground">Reusable gear lists</p>
        </div>
      </div>

      {!hydrated ? null : (
        <ul className="mt-6 space-y-3">
          {checklists.map((list) => (
            <ChecklistCard
              key={list.id}
              list={list}
              open={openId === list.id}
              onToggleOpen={() => setOpenId(openId === list.id ? null : list.id)}
              onUpdate={(u) => updateChecklist(list.id, u)}
              onDelete={() => {
                if (window.confirm(`Delete "${list.name}"?`)) deleteChecklist(list.id);
              }}
            />
          ))}
        </ul>
      )}

      <div className="fixed inset-x-0 bottom-0 z-10 mx-auto w-full max-w-md bg-gradient-to-t from-background via-background to-transparent px-5 pb-6 pt-8">
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-lift">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && create()}
            placeholder="New checklist name…"
            className="h-11 min-w-0 flex-1 rounded-xl bg-transparent px-3 text-base text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={create}
            disabled={!newName.trim()}
            className="flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-primary px-4 font-display font-semibold text-primary-foreground transition-all active:scale-95 disabled:opacity-40"
          >
            <Plus className="size-4" strokeWidth={2.5} />
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

function ChecklistCard({
  list,
  open,
  onToggleOpen,
  onUpdate,
  onDelete,
}: {
  list: Checklist;
  open: boolean;
  onToggleOpen: () => void;
  onUpdate: (updater: (l: Checklist) => Checklist) => void;
  onDelete: () => void;
}) {
  const { equipment } = useEquipmentLibrary();
  const [renaming, setRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState(list.name);
  const [newItem, setNewItem] = useState("");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState("");

  const setItems = (items: string[]) => onUpdate((l) => ({ ...l, items }));

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= list.items.length) return;
    const next = [...list.items];
    const moved = next[index]!;
    next[index] = next[target]!;
    next[target] = moved;
    setItems(next);
  };

  return (
    <li className="rounded-3xl border border-border bg-card p-4 shadow-soft">
      <div className="flex items-center gap-2">
        {renaming ? (
          <>
            <input
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              autoFocus
              className="h-11 min-w-0 flex-1 rounded-xl border border-input bg-background px-3 text-base outline-none focus:ring-2 focus:ring-ring"
            />
            <IconBtn
              label="Save name"
              onClick={() => {
                if (nameDraft.trim()) onUpdate((l) => ({ ...l, name: nameDraft.trim() }));
                setRenaming(false);
              }}
            >
              <Check className="size-4" />
            </IconBtn>
            <IconBtn label="Cancel rename" onClick={() => setRenaming(false)}>
              <X className="size-4" />
            </IconBtn>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onToggleOpen}
              className="min-w-0 flex-1 text-left"
            >
              <p className="truncate font-display text-lg font-semibold text-card-foreground">
                {list.name}
              </p>
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <ListChecks className="size-3.5" />
                {list.items.length} items
              </p>
            </button>
            <IconBtn
              label={`Rename ${list.name}`}
              onClick={() => {
                setNameDraft(list.name);
                setRenaming(true);
              }}
            >
              <Pencil className="size-4" />
            </IconBtn>
            <IconBtn label={`Delete ${list.name}`} onClick={onDelete}>
              <Trash2 className="size-4" />
            </IconBtn>
          </>
        )}
      </div>

      {open && (
        <div className="mt-4 border-t border-border pt-4">
          <ul className="space-y-2">
            {list.items.map((item, index) => (
              <li
                key={`${item}-${index}`}
                className="flex items-center gap-1 rounded-2xl border border-border bg-background p-1.5 pl-3"
              >
                {editIndex === index ? (
                  <>
                    <input
                      value={editDraft}
                      onChange={(e) => setEditDraft(e.target.value)}
                      autoFocus
                      className="h-10 min-w-0 flex-1 rounded-xl border border-input bg-background px-2 text-base outline-none focus:ring-2 focus:ring-ring"
                    />
                    <IconBtn
                      label="Save item"
                      onClick={() => {
                        if (editDraft.trim()) {
                          const next = [...list.items];
                          next[index] = editDraft.trim();
                          setItems(next);
                        }
                        setEditIndex(null);
                      }}
                    >
                      <Check className="size-4" />
                    </IconBtn>
                    <IconBtn label="Cancel edit" onClick={() => setEditIndex(null)}>
                      <X className="size-4" />
                    </IconBtn>
                  </>
                ) : (
                  <>
                    <span className="min-w-0 flex-1 truncate text-base text-foreground">
                      {item}
                    </span>
                    <IconBtn
                      label={`Move ${item} up`}
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                    >
                      <ArrowUp className="size-4" />
                    </IconBtn>
                    <IconBtn
                      label={`Move ${item} down`}
                      disabled={index === list.items.length - 1}
                      onClick={() => move(index, 1)}
                    >
                      <ArrowDown className="size-4" />
                    </IconBtn>
                    <IconBtn
                      label={`Rename ${item}`}
                      onClick={() => {
                        setEditDraft(item);
                        setEditIndex(index);
                      }}
                    >
                      <Pencil className="size-4" />
                    </IconBtn>
                    <IconBtn
                      label={`Remove ${item}`}
                      onClick={() => setItems(list.items.filter((_, i) => i !== index))}
                    >
                      <Trash2 className="size-4" />
                    </IconBtn>
                  </>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-3 flex items-center gap-2">
            <input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newItem.trim()) {
                  setItems([...list.items, newItem.trim()]);
                  setNewItem("");
                }
              }}
              placeholder="Add equipment…"
              className="h-11 min-w-0 flex-1 rounded-xl border border-input bg-background px-3 text-base outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="button"
              disabled={!newItem.trim()}
              onClick={() => {
                setItems([...list.items, newItem.trim()]);
                setNewItem("");
              }}
              className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground active:scale-95 disabled:opacity-40"
            >
              <Plus className="size-5" />
            </button>
          </div>

          <p className="mt-4 text-xs font-medium text-muted-foreground">
            Quick add from your equipment
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {equipment.map((name) => {
              const already = list.items.some(
                (i) => i.toLowerCase() === name.toLowerCase(),
              );
              return (
                <button
                  key={name}
                  type="button"
                  disabled={already}
                  onClick={() => setItems([...list.items, name])}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-semibold transition-all active:scale-95",
                    already
                      ? "border-success/40 bg-success-soft text-muted-foreground"
                      : "border-border bg-background text-foreground",
                  )}
                >
                  {already ? "✓ " : "+ "}
                  {name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </li>
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
      className="grid size-10 shrink-0 place-items-center rounded-xl text-muted-foreground transition-all hover:bg-secondary active:scale-90 disabled:opacity-25"
    >
      {children}
    </button>
  );
}
