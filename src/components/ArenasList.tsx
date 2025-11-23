import ArenasFeed from "./ArenasFeed";

export default function ArenasList() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8">
      <ArenasFeed showHeading />
    </main>
  );
}

