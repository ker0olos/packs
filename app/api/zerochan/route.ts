import nanoid from "~/utils/nanoid";

const endpoint = "https://www.zerochan.net";

export interface Data {
  query: string;
  // after?: number;
}

export interface Image {
  id: number;
  width: number;
  height: number;
  thumbnail: string;
  source: string;
  tag: string;
  tags: string[];
}

export async function POST(request: Request) {
  try {
    const data: Data = await request.json();

    const limit = 10;
    const after = 0;

    // Parse query to extract name and media title
    // Expected format: "name (media title)"
    const queryMatch = data.query.match(/^(.+?)\s*\((.+?)\)$/);
    
    let queries: string[] = [data.query]; // Default to original query
    
    if (queryMatch) {
      const name = queryMatch[1].trim();
      const mediaTitle = queryMatch[2].trim();
      const originalQuery = data.query;
      const duplicatedQuery = `${name}, ${name} (${mediaTitle})`;
      queries = [originalQuery, duplicatedQuery];
    }

    // Create URLs for all queries
    const urls = queries.map(query => 
      `${endpoint}/${encodeURIComponent(query)}?l=${limit}&p=${after}&d=portrait&json`
    );

    // console.log(urls);

    // Make all API calls simultaneously using Promise.all
    const responses = await Promise.all(
      urls.map(url => 
        fetch(url, {
          headers: {
            "User-Agent": `Fable Discord Bot Packs Integration - user${nanoid()}`,
          },
        })
      )
    );

    // Process responses
    const allImages: Image[] = [];
    
    for (const response of responses) {
      if (response.status === 200) {
        const { items: images }: { items: Image[] } = await response.json();
        if (images && Array.isArray(images)) {
          allImages.push(...images);
        }
      }
    }

    // Remove duplicates based on image ID
    const uniqueImages = allImages.filter((image, index, self) => 
      index === self.findIndex(img => img.id === image.id)
    );

    return new Response(JSON.stringify({ images: uniqueImages }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("An error occurred:", error);
    return new Response(JSON.stringify({ message: "An internal server error occurred." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
