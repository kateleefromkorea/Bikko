import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { TimeOfDay } from "../types";

export interface Medication {
  id: string;
  name: string;
  time_of_day: TimeOfDay;
}

export function useMedications(userId: string | null) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setMedications([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from("medications")
      .select("id, name, time_of_day")
      .eq("user_id", userId)
      .then(({ data }) => {
        setMedications(data ?? []);
        setLoading(false);
      });
  }, [userId]);

  async function addMedication(name: string, timeOfDay: TimeOfDay) {
    if (!userId) return;
    const id = crypto.randomUUID();
    setMedications((prev) => [...prev, { id, name, time_of_day: timeOfDay }]);
    await supabase.from("medications").insert({ id, user_id: userId, name, time_of_day: timeOfDay });
  }

  async function removeMedication(id: string) {
    setMedications((prev) => prev.filter((m) => m.id !== id));
    if (!userId) return;
    await supabase.from("medications").delete().eq("id", id);
  }

  async function updateTimeOfDay(id: string, timeOfDay: TimeOfDay) {
    setMedications((prev) => prev.map((m) => (m.id === id ? { ...m, time_of_day: timeOfDay } : m)));
    if (!userId) return;
    await supabase.from("medications").update({ time_of_day: timeOfDay }).eq("id", id);
  }

  return { medications, addMedication, removeMedication, updateTimeOfDay, loading };
}
