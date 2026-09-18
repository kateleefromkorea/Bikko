export interface FoodResult {
  id: string;
  name: string;
  brand?: string;
  caloriesPer100g: number;
}

interface UsdaNutrient {
  nutrientName: string;
  unitName: string;
  value: number;
}

interface UsdaFoodItem {
  fdcId: number;
  description: string;
  brandName?: string;
  brandOwner?: string;
  foodNutrients?: UsdaNutrient[];
}

const API_KEY = import.meta.env.VITE_USDA_API_KEY;

export async function searchFoods(query: string): Promise<FoodResult[]> {
  if (!API_KEY) {
    throw new Error(
      "Missing VITE_USDA_API_KEY. Get a free key at https://api.data.gov/signup and add it to .env.local.",
    );
  }
  if (!query.trim()) return [];

  const url = new URL("https://api.nal.usda.gov/fdc/v1/foods/search");
  url.searchParams.set("api_key", API_KEY);
  url.searchParams.set("query", query.trim());
  url.searchParams.set("pageSize", "15");

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`USDA search failed (${res.status})`);
  const data: { foods?: UsdaFoodItem[] } = await res.json();

  const results: FoodResult[] = [];
  for (const food of data.foods ?? []) {
    const energy = food.foodNutrients?.find(
      (n) => n.nutrientName === "Energy" && n.unitName?.toUpperCase() === "KCAL",
    );
    if (!energy) continue;
    results.push({
      id: String(food.fdcId),
      name: food.description,
      brand: food.brandName || food.brandOwner || undefined,
      caloriesPer100g: energy.value,
    });
  }
  return results;
}
