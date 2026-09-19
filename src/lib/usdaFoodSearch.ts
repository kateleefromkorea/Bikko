export interface FoodResult {
  id: string;
  name: string;
  brand?: string;
  caloriesPer100g: number;
  saved?: boolean; // true for the user's own saved foods, not USDA results
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

// USDA's default search is very noisy: a plain "banana" query returns ~5,000
// hits where the top results are duplicate branded entries, banana *dishes*,
// and even banana peppers — the plain fruit lands around 10th. Two fixes:
//   1. Restrict to the Foundation / SR Legacy datasets (generic whole foods),
//      which removes all branded-product noise.
//   2. Re-rank what's left so the plainest match for the query wins.
const DATA_TYPES = "Foundation,SR Legacy";

function normalize(s: string) {
  return s.toLowerCase().trim().replace(/s$/, "");
}

function relevanceScore(description: string, query: string) {
  const q = normalize(query);
  const desc = description.toLowerCase();
  const firstSegment = normalize(description.split(",")[0]);

  let score = 0;
  if (firstSegment === q) score += 100;
  else if (firstSegment.startsWith(q)) score += 60;
  else if (desc.includes(q)) score += 20;

  // Prefer concise entries: "Bananas, raw" over "Bananas, dehydrated, or banana powder".
  score -= description.length * 0.1;
  return score;
}

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
  url.searchParams.set("pageSize", "25");
  url.searchParams.set("dataType", DATA_TYPES);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`USDA search failed (${res.status})`);
  const data: { foods?: UsdaFoodItem[] } = await res.json();

  const results: { result: FoodResult; score: number }[] = [];
  for (const food of data.foods ?? []) {
    const energy = food.foodNutrients?.find(
      (n) => n.nutrientName === "Energy" && n.unitName?.toUpperCase() === "KCAL",
    );
    if (!energy) continue;
    results.push({
      result: {
        id: String(food.fdcId),
        name: food.description,
        brand: food.brandName || food.brandOwner || undefined,
        caloriesPer100g: energy.value,
      },
      score: relevanceScore(food.description, query),
    });
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((r) => r.result);
}
