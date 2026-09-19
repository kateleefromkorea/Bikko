// One icon vocabulary for the whole app. Kept apart from metabolics.ts so the
// calorie maths stays free of anything presentational, and kept as lookups by
// key so a goal or activity level names its icon in exactly one place.

import {
  Activity, Apple, Armchair, Bell, Bike, Camera, ChartColumn, ChartPie,
  CircleCheck, Droplet, Dumbbell, Flame, Footprints, Gem, Hash, Heart,
  HeartPulse, Moon, Salad, Satellite, Scale, Smartphone, Sprout, Stethoscope,
  TrendingDown, Utensils, Watch, Wind,
  type LucideIcon,
} from "lucide-react";

export type { LucideIcon };

export const GOAL_ICONS: Record<string, LucideIcon> = {
  weight_loss: TrendingDown,
  muscle_building: Dumbbell,
  maintenance: Scale,
  nutrition: Salad,
  chronic: Stethoscope,
  longevity: Sprout,
};

export const ACTIVITY_ICONS: Record<string, LucideIcon> = {
  "Sedentary": Armchair,
  "Lightly active": Footprints,
  "Moderately active": Bike,
  "Very active": Dumbbell,
  "Extra active": Flame,
};

export const SOURCE_ICONS: Record<string, LucideIcon> = {
  "Apple Health": Apple,
  "Apple Watch": Watch,
  "Google Fit": Activity,
  "Fitbit": Footprints,
  "Garmin Connect": Satellite,
  "WHOOP": HeartPulse,
  "Oura Ring": Gem,
  "Samsung Health": Smartphone,
};

export const TRACKING_ICONS: Record<string, LucideIcon> = {
  "Detailed macros": ChartPie,
  "Simple calories": Hash,
  "Visual meals": Camera,
};

export const HABIT_ICONS: Record<string, LucideIcon> = {
  Calories: Utensils,
  Water: Droplet,
  Sleep: Moon,
  Activity: Footprints,
};

export const VALUE_PROP_ICONS: LucideIcon[] = [Sprout, Utensils, ChartColumn];

export const INSIGHT_ICONS = {
  heart: Heart,
  breathing: Wind,
  recovery: HeartPulse,
  energy: Flame,
  calm: Moon,
  sleep: Moon,
  steps: Footprints,
  ok: CircleCheck,
  reminder: Bell,
} satisfies Record<string, LucideIcon>;
