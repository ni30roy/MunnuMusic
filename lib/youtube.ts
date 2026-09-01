import "server-only";

export interface YoutubeSearchResult {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
}

// The YouTube Data API returns snippet text HTML-escaped.
const HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
};

function decodeHtmlEntities(text: string) {
  return text.replace(/&amp;|&lt;|&gt;|&quot;|&#39;|&apos;/g, (entity) => HTML_ENTITIES[entity]);
}

// Never throws: a YouTube outage, quota exhaustion, or network failure
// degrades to an empty result list instead of taking down the whole search
// page (which also shows local library results in the same request).
export async function searchYoutube(query: string): Promise<YoutubeSearchResult[]> {
  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("type", "video");
  url.searchParams.set("videoCategoryId", "10"); // Music
  url.searchParams.set("maxResults", "20");
  url.searchParams.set("q", query);
  url.searchParams.set("key", process.env.YOUTUBE_API_KEY as string);

  let res: Response;
  try {
    res = await fetch(url.toString());
  } catch (err) {
    console.error("YouTube search request failed:", err);
    return [];
  }

  if (!res.ok) {
    console.error(`YouTube search failed with status ${res.status}`);
    return [];
  }

  try {
    const data = await res.json();
    return (data.items ?? []).map(
      (item: {
        id: { videoId: string };
        snippet: {
          title: string;
          channelTitle: string;
          thumbnails: { default?: { url: string }; medium?: { url: string } };
        };
      }) => ({
        videoId: item.id.videoId,
        title: decodeHtmlEntities(item.snippet.title),
        channelTitle: decodeHtmlEntities(item.snippet.channelTitle),
        thumbnailUrl:
          item.snippet.thumbnails.medium?.url ?? item.snippet.thumbnails.default?.url ?? "",
      })
    );
  } catch (err) {
    console.error("Failed to parse YouTube search response:", err);
    return [];
  }
}
