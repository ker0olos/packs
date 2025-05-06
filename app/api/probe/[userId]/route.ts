export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const botToken = process.env.BOT_TOKEN;

    const { userId } = await params;

    const response = await fetch(`https://discord.com/api/users/${userId}`, {
      method: "GET",
      headers: {
        "content-type": "application/json",
        authorization: `Bot ${botToken}`,
      },
    });

    const user = await response.json();

    if (user) {
      return new Response(JSON.stringify(user), {
        headers: {
          "content-type": "application/json",
          "cache-control": `max-age=${86400 * 1}`,
          "access-control-allow-origin": "*",
        },
      });
    } else {
      throw new Error();
    }
  } catch {
    return new Response(null);
  }
}
