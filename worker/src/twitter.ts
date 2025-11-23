import type { Config } from "./config";

export type CandidateTweetAuthor = {
  username: string;
  displayName?: string;
};

export type CandidateTweet = {
  id: string;
  url?: string;
  text: string;
  createdAt: string;
  likeCount: number;
  retweetCount: number;
  replyCount: number;
  viewCount: number;
  quoteCount: number;
  author: CandidateTweetAuthor;
};

interface TwitterSearchResultRaw {
  tweets: any[];
}

export async function searchCandidateTweets(config: Config): Promise<CandidateTweet[]> {
  const url = new URL("/twitter/tweet/advanced_search", config.twitterBaseUrl);
  url.searchParams.set("query", 'lang:en -is:retweet min_faves:200');
  url.searchParams.set("queryType", "Latest");

  const res = await fetch(url.toString(), {
    headers: {
      "X-API-Key": config.twitterApiKey,
    },
  });

  if (!res.ok) {
    throw new Error(`twitterapi.io search failed: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as TwitterSearchResultRaw;

  const tweets: CandidateTweet[] =
    data.tweets?.map(raw => {
      const authorRaw = raw.author ?? raw.user ?? raw.userDetails ?? {};

      const username: string =
        authorRaw.username ??
        authorRaw.handle ??
        authorRaw.screenName ??
        authorRaw.screen_name ??
        authorRaw.name ??
        "unknown";

      const displayName: string | undefined =
        authorRaw.name ?? authorRaw.screenName ?? authorRaw.screen_name ?? undefined;

      return {
        id: raw.id,
        url: raw.url,
        text: raw.text ?? "",
        createdAt: raw.createdAt,
        likeCount: raw.likeCount ?? 0,
        retweetCount: raw.retweetCount ?? 0,
        replyCount: raw.replyCount ?? 0,
        viewCount:
          raw.viewCount ??
          raw.views ??
          raw.impressionCount ??
          raw.impressions ??
          0,
        quoteCount: raw.quoteCount ?? raw.quotes ?? 0,
        author: {
          username,
          displayName,
        },
      };
    }) ?? [];

  return tweets;
}


