 "use client";

import type { ReactNode } from "react";

import type { ArenaCategory, ArenaStatus } from "@/lib/arenas/types";
import { IconExternalLink, IconLike, IconReply, IconRetweet, IconViews } from "./Icons";

interface TweetCardProps {
  authorHandle: string;
  authorDisplayName?: string;
  createdAt: string;
  text?: string;
  tweetUrl?: string;
  likes0?: number;
  retweets0?: number;
  replies0?: number;
  views0?: number;
  bangerLine?: number;
  scoreLine?: number | null;
  status?: ArenaStatus;
  category?: ArenaCategory | null;
  href?: string;
  children?: ReactNode;
}

function formatRelativeTime(iso: string) {
  const created = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return `${diffSec}s`;
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHr < 24) return `${diffHr}h`;
  if (diffDay < 7) return `${diffDay}d`;
  return created.toLocaleDateString();
}

function getInitials(handle: string) {
  if (!handle) return "?";
  const clean = handle.replace(/^@/, "");
  return clean.slice(0, 2).toUpperCase();
}

export default function TweetCard(props: TweetCardProps) {
  const {
    authorHandle,
    authorDisplayName,
    createdAt,
    text,
    tweetUrl,
    likes0,
    retweets0,
    replies0,
    views0,
    bangerLine,
    scoreLine,
    status,
    category,
    href,
    children,
  } = props;

  const content = (
    <article className="flex gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm shadow-sm shadow-slate-900/60 transition hover:bg-slate-900/80">
      <div className="mt-1">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-600 to-slate-800 text-xs font-semibold text-slate-50">
          {getInitials(authorHandle)}
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <header className="flex items-center gap-1 text-[13px]">
          <span className="max-w-[10rem] truncate font-semibold text-slate-50">
            {authorDisplayName ?? authorHandle}
          </span>
          <span className="max-w-[10rem] truncate text-slate-500">@{authorHandle}</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-500">{formatRelativeTime(createdAt)}</span>
        </header>
        {text && <p className="whitespace-pre-wrap text-[15px] text-slate-100">{text}</p>}
        {!text && tweetUrl && (
          <p className="text-[13px] text-slate-400">Tweet preview unavailable.</p>
        )}
        <footer className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
          {(likes0 !== undefined ||
            retweets0 !== undefined ||
            replies0 !== undefined ||
            views0 !== undefined) && (
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
              {likes0 !== undefined && (
                <span className="inline-flex items-center gap-1">
                  <IconLike className="h-3 w-3 text-slate-400" />
                  <span>{likes0.toLocaleString()}</span>
                </span>
              )}
              {retweets0 !== undefined && (
                <span className="inline-flex items-center gap-1">
                  <IconRetweet className="h-3 w-3 text-slate-400" />
                  <span>{retweets0.toLocaleString()}</span>
                </span>
              )}
              {replies0 !== undefined && (
                <span className="inline-flex items-center gap-1">
                  <IconReply className="h-3 w-3 text-slate-400" />
                  <span>{replies0.toLocaleString()}</span>
                </span>
              )}
              {views0 !== undefined && (
                <span className="inline-flex items-center gap-1">
                  <IconViews className="h-3 w-3 text-slate-400" />
                  <span>{views0.toLocaleString()}</span>
                </span>
              )}
            </div>
          )}
          {scoreLine != null && (
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-2 py-0.5 text-[11px] font-medium text-sky-300">
              Score line{" "}
              <span className="font-semibold text-sky-400">
                {scoreLine.toFixed(1)}
              </span>
            </span>
          )}
          {bangerLine !== undefined && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
              Banger line{" "}
              <span className="font-semibold text-emerald-400">
                {bangerLine.toLocaleString()} likes
              </span>
            </span>
          )}
          {status && (
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 px-2 py-0.5 text-[11px] uppercase tracking-[0.16em] text-slate-400">
              {status}
            </span>
          )}
          {category && (
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-800 bg-slate-900/80 px-2 py-0.5 text-[11px] font-medium text-slate-300">
              {category === "crypto" && "CT"}
              {category === "ai" && "AI / Tech"}
              {category === "politics" && "Politics"}
              {category === "meme" && "Meme"}
              {category === "other" && "Other"}
            </span>
          )}
          {tweetUrl && (
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-full border border-slate-800 bg-slate-900/70 px-2 py-0.5 text-[11px] font-medium text-slate-300 transition hover:border-emerald-500 hover:text-emerald-300"
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                window.open(tweetUrl, "_blank", "noopener,noreferrer");
              }}
            >
              <IconExternalLink className="h-3 w-3" />
              <span>View on X</span>
            </button>
          )}
          {children}
        </footer>
      </div>
    </article>
  );

  if (href) {
    return (
      <a
        href={href}
        className="block no-underline"
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      >
        {content}
      </a>
    );
  }
  return content;
}


