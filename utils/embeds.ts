import type { Manifest } from "~/utils/types.ts";

interface Webhook {
  username?: string;
  avatar_url?: string;
  content?: string;
  embeds?: Embed[];
}

interface Embed {
  title?: string;
  description?: string;
  thumbnail?: { url: string };
  image?: { url: string };
  author?: { name?: string };
  footer?: { text?: string };
  fields?: {
    name: string;
    value: string;
    inline?: boolean;
  }[];
}

const empty = "\u200B";

const defaultUsername = "Community Packs";

const defaultAvatar =
  "https://raw.githubusercontent.com/fable-community/packs/main/static/icon-512x512.png";

export const getWebhook = ({
  username,
  pack,
  old,
}: {
  username: string;
  pack: Manifest;
  old?: Manifest;
}): Webhook => {
  const webhook: Webhook = {
    username: defaultUsername,
    avatar_url: defaultAvatar,
    embeds: [{ description: `${username} updated ${pack.title ?? pack.id}` }],
  };

  if (!old) {
    webhook.embeds = [
      { description: `${username} published a new pack` },
      {
        title: pack.title ?? pack.id,
        description: pack.description,
        footer: { text: `id: ${pack.id}` },
      },
    ];

    if (pack.image) {
      webhook.embeds[0].thumbnail = { url: pack.image };
    }

    return webhook;
  }

  pack.characters?.forEach((a) => {
    const embed: Embed = {};

    let media: string | undefined = undefined;

    if (a.images?.[0]?.url) {
      embed.thumbnail = { url: a.images[0].url };
    }

    if (a.media?.[0]?.mediaId) {
      media = pack.media?.find((m) => m.id === a.media?.[0]?.mediaId)?.title
        .english;
    }

    if (a.gender && a.age) {
      embed.footer = { text: `${a.gender}, ${a.age}` };
    } else if (a.gender) {
      embed.footer = { text: `${a.gender}` };
    } else if (a.age) {
      embed.footer = { text: `${a.age}` };
    }

    if (a.name.english && media) {
      embed.fields = [
        {
          name: media,
          value: a.name.english,
        },
      ];
    } else if (a.name.english) {
      embed.fields = [
        {
          name: a.name.english,
          value: empty,
        },
      ];
    }

    const b = old.characters?.find((b) => a.id === b.id);

    if (!b || JSON.stringify(a) !== JSON.stringify(b)) {
      webhook.embeds!.push(embed);
    }
  });

  webhook.embeds = webhook.embeds?.slice(0, 3);

  return webhook;
};
