const DEFAULT_PLAYER_URL =
  process.env.NEXT_PUBLIC_TWITTER_PLAYER_URL ?? "https://bangerarena.fun";

type TwitterPageProps = {
  searchParams?: Promise<{ url?: string }>;
};

/**
 * Lightweight /twitter route intended to be embedded as a Twitter "player" card.
 * Async server component using the app router's searchParams prop, so it can be safely
 * prerendered/exported and used as a Twitter card player URL.
 */
export default async function TwitterPlayerPage({ searchParams }: TwitterPageProps) {
  const resolved = (await searchParams) ?? {};
  const url = resolved.url || DEFAULT_PLAYER_URL;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-slate-100">
      <div className="fixed left-2 top-2 z-50 rounded-full bg-black/70 px-3 py-1 text-[11px] font-medium text-slate-100">
        Banger Arenas · Twitter player
      </div>

      <div className="h-[560px] w-[360px] overflow-hidden rounded-lg border border-slate-800 bg-black shadow-lg shadow-slate-900/60 sm:h-screen sm:max-h-[560px]">
        <iframe
          src={url}
          title="Banger Arenas"
          className="h-full w-full"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          loading="lazy"
          allow="web3"
          scrolling="yes"
          style={{
            border: "none",
            overflow: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        />
      </div>
    </main>
  );
}


