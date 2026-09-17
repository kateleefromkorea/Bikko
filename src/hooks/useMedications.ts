import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export interface Medication {
  id: string;
  name: string;
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
      .select("id, name")
      .eq("user_id", userId)
      .then(({ data }) => {
        setMedications(data ?? []);
        setLoading(false);
      });
  }, [userId]);

  async function addMedication(name: string) {
    if (!userId) return;
    const id = crypto.randomUUID();
    setMedications((prev) => [...prev, { id, name }]);
    await supabase.from("medications").insert({ id, user_id: userId, name });
  }

  async function removeMedication(id: string) {
    setMedications((prev) => prev.filter((m) => m.id !== id));
    if (!userId) return;
    await supabase.from("medications").delete().eq("id", id);
  }

  return { medications, addMedication, removeMedication, loading };
}
