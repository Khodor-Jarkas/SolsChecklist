import { redirect } from "next/navigation";
import { createClient, getUser } from "@/lib/supabase/server";
import { CraftingChecklist } from "@/components/CraftingChecklist";

export default async function CraftingPage() {
  const user = await getUser();
  if (!user) redirect("/sign-in");

  const supabase = await createClient();
  const [{ data: items }, { data: owned }] = await Promise.all([
    supabase.from("items").select("*").order("kind").order("name"),
    supabase.from("user_items").select("item_id, count"),
  ]);

  const ownedMap = new Map<number, number>();
  for (const row of owned ?? []) ownedMap.set(row.item_id, row.count);

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Crafting</h1>
        <p className="text-sm text-[var(--foreground)]/70 mt-1">
          Track gear, potions, and materials you&apos;ve crafted or gathered.
        </p>
      </header>
      <CraftingChecklist
        items={items ?? []}
        initialOwned={Object.fromEntries(ownedMap)}
      />
    </section>
  );
}
