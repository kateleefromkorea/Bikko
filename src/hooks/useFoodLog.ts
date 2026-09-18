import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { FoodLogItem, HabitData, MealKey } from "../types";

const MEAL_KEYS: MealKey[] = ["breakfast", "lunch", "dinner", "snacks"];

function round(n: number) {
  return Math.round(n * 10) / 10;
}

export function useFoodLog(
  userId: string | null,
  date: string,
  data: HabitData,
  onChange: (data: HabitData) => void,
) {
  const [items, setItems] = useState<FoodLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from("food_log_items")
      .select("id, meal, name, grams, calories_per_100g, calories")
      .eq("user_id", userId)
      .eq("date", date)
      .then(({ data: rows }) => {
        setItems(
          (rows ?? []).map((r) => ({
            id: r.id,
            meal: r.meal as MealKey,
            name: r.name,
            grams: Number(r.grams),
            caloriesPer100g: Number(r.calories_per_100g),
            calories: Number(r.calories),
          })),
        );
        setLoading(false);
      });
  }, [userId, date]);

  function syncAggregate(nextItems: FoodLogItem[]) {
    const mealTotals: Record<MealKey, number> = { breakfast: 0, lunch: 0, dinner: 0, snacks: 0 };
    for (const item of nextItems) mealTotals[item.meal] += item.calories;
    const dayTotal = MEAL_KEYS.reduce((sum, k) => sum + mealTotals[k], 0);

    const rounded = Object.fromEntries(MEAL_KEYS.map((k) => [k, round(mealTotals[k])]));
    const note = JSON.stringify(rounded);
    const existing = data.food.find((e) => e.date === date);
    const food = existing
      ? data.food.map((e) => (e.date === date ? { ...e, value: round(dayTotal), note } : e))
      : [...data.food, { date, value: round(dayTotal), note }];

    onChange({ ...data, food });
  }

  async function addItem(meal: MealKey, food: { name: string; grams: number; caloriesPer100g: number }) {
    if (!userId) return;
    const calories = round((food.caloriesPer100g * food.grams) / 100);
    const { data: inserted } = await supabase
      .from("food_log_items")
      .insert({
        user_id: userId,
        date,
        meal,
        name: food.name,
        grams: food.grams,
        calories_per_100g: food.caloriesPer100g,
        calories,
      })
      .select("id")
      .single();

    const newItem: FoodLogItem = {
      id: inserted?.id ?? crypto.randomUUID(),
      meal,
      name: food.name,
      grams: food.grams,
      caloriesPer100g: food.caloriesPer100g,
      calories,
    };
    const next = [...items, newItem];
    setItems(next);
    syncAggregate(next);
  }

  async function updateGrams(itemId: string, grams: number) {
    const next = items.map((item) =>
      item.id === itemId ? { ...item, grams, calories: round((item.caloriesPer100g * grams) / 100) } : item,
    );
    setItems(next);
    syncAggregate(next);
    const updated = next.find((i) => i.id === itemId)!;
    await supabase.from("food_log_items").update({ grams, calories: updated.calories }).eq("id", itemId);
  }

  async function deleteItem(itemId: string) {
    const next = items.filter((item) => item.id !== itemId);
    setItems(next);
    syncAggregate(next);
    await supabase.from("food_log_items").delete().eq("id", itemId);
  }

  return { items, loading, addItem, updateGrams, deleteItem };
}
