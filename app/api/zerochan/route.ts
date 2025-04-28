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

    const url = `${endpoint}/${encodeURIComponent(
      data.query
    )}?l=${limit}&p=${after}&d=portrait&json`;

    // console.log(url);

    const _res = await fetch(url, {
      headers: {
        "User-Agent": `Fable Discord Bot Packs Integration - user${nanoid()}`,
      },
    });

    if (_res.status === 200) {
      const { items: images }: { items: Image[] } = await _res.json();
      return new Response(JSON.stringify({ images }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(null, { status: _res.status });
  } catch (error: unknown) {
    console.error("An error occurred:", error);
    return new Response(JSON.stringify({ message: "An internal server error occurred." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
