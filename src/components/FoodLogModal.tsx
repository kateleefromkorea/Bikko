import { useState } from "react";
import { searchFoods, type FoodResult } from "../lib/usdaFoodSearch";
import type { FoodLogItem, MealKey } from "../types";

interface Props {
  meal: MealKey;
  mealLabel: string;
  items: FoodLogItem[];
  onAdd: (food: { name: string; grams: number; caloriesPer100g: number }) => void;
  onUpdateGrams: (itemId: string, grams: number) => void;
  onDelete: (itemId: string) => void;
  onClose: () => void;
}

const inputCls =
  "flex-1 rounded-xl border border-border px-3 py-2 text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring";
const btnPrimary =
  "px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50";

export default function FoodLogModal({ meal, mealLabel, items, onAdd, onUpdateGrams, onDelete, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gramsByResult, setGramsByResult] = useState<Record<string, string>>({});
  const [manualMode, setManualMode] = useState(false);
  const [manual, setManual] = useState({ name: "", grams: "100", calories: "" });

  const total = items.reduce((sum, i) => sum + i.calories, 0);

  async function runSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setError(null);
    try {
      const found = await searchFoods(query);
      setResults(found);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  function addResult(result: FoodResult) {
    const grams = parseFloat(gramsByResult[result.id] ?? "100") || 100;
    onAdd({ name: result.name, grams, caloriesPer100g: result.caloriesPer100g });
  }

  function addManual() {
    const grams = parseFloat(manual.grams) || 0;
    const calories = parseFloat(manual.calories) || 0;
    if (!manual.name.trim() || grams <= 0) return;
    const caloriesPer100g = (calories / grams) * 100;
    onAdd({ name: manual.name.trim(), grams, caloriesPer100g });
    setManual({ name: "", grams: "100", calories: "" });
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-card rounded-2xl p-6 max-h-[85vh] overflow-y-auto flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-foreground text-xl">{mealLabel}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{Math.round(total)} kcal logged</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg">✕</button>
        </div>

        {items.length > 0 && (
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-xl border border-border bg-muted p-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{Math.round(item.calories)} kcal</p>
                </div>
                <input
                  type="number"
                  min="0"
                  value={item.grams}
                  onChange={(e) => onUpdateGrams(item.id, parseFloat(e.target.value) || 0)}
                  className="w-20 rounded-lg border border-border px-2 py-1.5 text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <span className="text-xs text-muted-foreground">g</span>
                <button onClick={() => onDelete(item.id)} className="text-muted-foreground hover:text-foreground text-sm">✕</button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={runSearch} className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a food, e.g. banana"
            className={inputCls}
          />
          <button type="submit" disabled={searching} className={btnPrimary}>
            {searching ? "…" : "Search"}
          </button>
        </form>

        {error && <p className="text-xs text-red-600">{error}</p>}

        {results.length > 0 && (
          <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
            {results.map((result) => (
              <div key={result.id} className="flex items-center gap-2 rounded-xl border border-border p-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{result.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {result.brand ? `${result.brand} · ` : ""}
                    {Math.round(result.caloriesPer100g)} kcal / 100g
                  </p>
                </div>
                <input
                  type="number"
                  min="1"
                  placeholder="100"
                  value={gramsByResult[result.id] ?? ""}
                  onChange={(e) => setGramsByResult((p) => ({ ...p, [result.id]: e.target.value }))}
                  className="w-16 rounded-lg border border-border px-2 py-1.5 text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <span className="text-xs text-muted-foreground">g</span>
                <button onClick={() => addResult(result)} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-all">
                  Add
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="pt-2 border-t border-border">
          {manualMode ? (
            <div className="flex flex-col gap-2">
              <input
                value={manual.name}
                onChange={(e) => setManual((p) => ({ ...p, name: e.target.value }))}
                placeholder="Food name"
                className={`${inputCls} w-full`}
              />
              <div className="flex gap-2">
                <input
                  type="number" min="0"
                  value={manual.grams}
                  onChange={(e) => setManual((p) => ({ ...p, grams: e.target.value }))}
                  placeholder="Grams"
                  className={inputCls}
                />
                <input
                  type="number" min="0"
                  value={manual.calories}
                  onChange={(e) => setManual((p) => ({ ...p, calories: e.target.value }))}
                  placeholder="Calories"
                  className={inputCls}
                />
              </div>
              <div className="flex gap-2">
                <button onClick={addManual} className={btnPrimary}>Add manually</button>
                <button onClick={() => setManualMode(false)} className="px-4 py-2 rounded-xl bg-secondary text-secondary-foreground text-sm font-semibold">Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setManualMode(true)} className="text-sm text-primary font-bold hover:opacity-70 transition-all">
              Can't find it? Add manually
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
