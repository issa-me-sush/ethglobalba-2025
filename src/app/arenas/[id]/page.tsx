 "use client";

import { use } from "react";

import ArenaDetail from "@/components/ArenaDetail";
import Header from "@/components/Header";
import Providers from "@/components/Providers";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ArenaDetailPage({ params }: PageProps) {
  const { id } = use(params);

  return (
    <Providers>
      <Header />
      <ArenaDetail arenaId={id} />
    </Providers>
  );
}


