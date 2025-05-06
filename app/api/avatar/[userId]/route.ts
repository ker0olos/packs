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

    if (user.avatar) {
      const response = await fetch(
        `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
      );

      return new Response(await response.arrayBuffer(), {
        headers: {
          "cache-control": `max-age=${86400 * 1}`,
          "content-type": `image/png`,
        },
      });
    } else {
      throw new Error();
    }
  } catch {
    const response = await fetch(
      "https://cdn.discordapp.com/embed/avatars/0.png"
    );
    return response;
  }
}
