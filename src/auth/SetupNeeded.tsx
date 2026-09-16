export default function SetupNeeded() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 text-sm text-foreground">
        <h1 className="text-lg font-extrabold mb-2">Supabase isn't configured yet</h1>
        <p className="text-muted-foreground mb-3">
          Copy <code className="px-1 rounded bg-muted">.env.example</code> to{" "}
          <code className="px-1 rounded bg-muted">.env.local</code> and fill in your Supabase project's URL and anon
          key, then restart the dev server.
        </p>
        <p className="text-muted-foreground">
          Run the SQL in <code className="px-1 rounded bg-muted">src/db/schema.sql</code> in your Supabase project's
          SQL editor first, if you haven't already.
        </p>
      </div>
    </div>
  );
}
