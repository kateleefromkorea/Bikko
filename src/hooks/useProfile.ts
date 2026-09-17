import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export interface ProfileRow {
  name: string;
  date_of_birth: string | null;
  gender: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  activity_level: string | null;
  calorie_goal: number;
  water_goal: number;
  sleep_goal: number;
}

const EMPTY_PROFILE: ProfileRow = {
  name: "",
  date_of_birth: null,
  gender: null,
  height_cm: null,
  weight_kg: null,
  activity_level: null,
  calorie_goal: 2000,
  water_goal: 8,
  sleep_goal: 8,
};

export function useProfile(userId: string | null) {
  const [profile, setProfileState] = useState<ProfileRow>(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setProfileState(EMPTY_PROFILE);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from("profiles")
      .select("name, date_of_birth, gender, height_cm, weight_kg, activity_level, calorie_goal, water_goal, sleep_goal")
      .eq("user_id", userId)
      .single()
      .then(({ data }) => {
        if (data) setProfileState(data as ProfileRow);
        setLoading(false);
      });
  }, [userId]);

  async function updateProfile(patch: Partial<ProfileRow>) {
    setProfileState((p) => ({ ...p, ...patch }));
    if (!userId) return;
    await supabase.from("profiles").update(patch).eq("user_id", userId);
  }

  return { profile, updateProfile, loading };
}
