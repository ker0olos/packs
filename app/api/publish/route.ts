import axios from "axios";

import { deserialize } from "bson";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

import { captureException } from "@sentry/nextjs";

import nanoid from "~/utils/nanoid";

import { getAccessToken } from "~/utils/oauth";

import { getWebhook } from "~/utils/embeds";

import { IImageInput, TEN_MB } from "~/components/ImageInput";

import { Character, CharacterRole, Media, Pack } from "~/utils/types";

// interface Credentials {
//   apiUrl: string;
//   authorizationToken: string;
//   downloadUrl: string;
// }

// interface Upload {
//   uploadUrl: string;
//   authorizationToken: string;
// }

export interface Data {
  old: Pack["manifest"];
  title?: string;
  private?: boolean;
  nsfw?: boolean;
  author?: string;
  description?: string;
  webhookUrl?: string;
  image?: IImageInput;
  characters?: Character[];
  media?: Media[];
  maintainers?: string[];
  conflicts?: string[];
  new?: boolean;
  username?: string;
}

const publicWebhookUrl = process.env.PUBLIC_DISCORD_WEBHOOK_URL;

const S3 = new S3Client({
  region: "auto",
  endpoint: process.env.S3_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.S3_KEY_ID!,
    secretAccessKey: process.env.S3_ACCESS_KEY!,
  },
});

const uploadImage = async ({
  file,
}: {
  file: NonNullable<IImageInput["file"]>;
}): Promise<string | undefined> => {
  if (file.size > TEN_MB) {
    console.error("image is over 10 mb");
    return "";
  }

  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9]/g, "-");

  const fileName = `${nanoid(8)}-${sanitizedFileName}`;

  const bucketName = process.env.S3_BUCKET_NAME;

  try {
    const command = new PutObjectCommand({
      Key: fileName,
      Bucket: bucketName,
      Body: file.data.buffer,
      CacheControl: "max-age=259200", // 3 days
      ContentLength: file.size,
      ContentType: file.type,
      ACL: "public-read",
    });

    await S3.send(command);

    const url = `${process.env.S3_PUBLIC_ENDPOINT}/${fileName}`;

    // console.log("uploaded image", url);

    return url;
  } catch (error) {
    console.error("Error uploading file:", error);
    captureException(error);
    throw error;
  }
};

export async function POST(request: Request) {
  try {
    const endpoint = process.env.API_ENDPOINT;
    const accessToken = await getAccessToken();

    if (!accessToken) {
      throw new Error("Access token not defined");
    }

    const data = deserialize(
      new Uint8Array(await request.arrayBuffer())
    ) as Data;

    const pack = data.old;

    const old = JSON.stringify(pack);

    if (typeof data.private === "boolean") {
      pack.private = data.private;
    }

    if (typeof data.nsfw === "boolean") {
      pack.nsfw = data.nsfw;
    }

    if (typeof data.title === "string") {
      pack.title = data.title.trim();
    }

    if (typeof data.author === "string") {
      pack.author = data.author.trim();
    }

    if (typeof data.description === "string") {
      pack.description = data.description.trim();
    }

    if (typeof data.webhookUrl === "string") {
      pack.webhookUrl = data.webhookUrl;
    }

    if (data.image?.file) {
      pack.image = await uploadImage({
        file: data.image.file,
      });
    } else if (data.image?.url) {
      pack.image = data.image.url;
    }

    pack.media = [];
    pack.characters = [];

    pack.maintainers = data.maintainers ?? [];
    pack.conflicts = data.conflicts ?? [];

    data.media?.sort((a, b) => {
      return (b.popularity ?? 0) - (a.popularity ?? 0);
    });

    data.characters?.sort((a, b) => {
      return (b.rating || 1) - (a.rating || 1);
    });

    pack.media = await Promise.all(
      data.media?.map(async (media) => {
        const url = media.images?.[0]?.file?.size
          ? await uploadImage({ file: media.images[0].file })
          : media.images?.[0]?.url
          ? media.images[0].url
          : undefined;

        const characters: {
          role: CharacterRole;
          characterId: string;
        }[] = [];

        data.characters?.forEach((character) => {
          const find = character.media?.find(
            ({ mediaId }) => media.id === mediaId
          );

          if (find) {
            characters!.push({
              characterId: character.id,
              role: find.role,
            });
          }
        });

        let images: { url: string }[];

        if (url?.length) {
          images = [{ url }];
        } else if (media.images?.[0]?.url) {
          images = media.images?.map(({ url }) => ({ url }));
        } else {
          images = [];
        }

        return {
          ...media,
          characters,
          images,
        };
      }) ?? []
    );

    pack.characters = await Promise.all(
      data.characters?.map(async (char) => {
        const url = char.images?.[0]?.file?.size
          ? await uploadImage({ file: char.images[0].file })
          : char.images?.[0]?.url
          ? char.images[0].url
          : undefined;

        let images: { url: string }[];

        if (url?.length) {
          images = [{ url }];
        } else if (char.images?.[0]?.url) {
          images = char.images?.map(({ url }) => ({ url }));
        } else {
          images = [];
        }

        return {
          ...char,
          images,
        };
      }) ?? []
    );

    if (endpoint) {
      const response = await axios(`${endpoint}/publish`, {
        method: "POST",
        headers: { authorization: `Bearer ${accessToken}` },
        data: JSON.stringify(
          {
            manifest: pack,
            accessToken: accessToken,
          },
          (_, value) => (value !== null ? value : undefined)
        ),
        validateStatus: (status) =>
          status === 200 || status === 201 || status === 400,
      });

      if (response.status !== 201) {
        const { errors } = response.data;

        return new Response(JSON.stringify({ errors }), {
          status: response.status,
          headers: { "content-type": "application/json" },
        });
      }

      const body = getWebhook({
        pack,
        username: data.username!,
        old: !data.new ? JSON.parse(old) : undefined,
      });

      if (publicWebhookUrl && !pack.private && !pack.nsfw) {
        fetch(publicWebhookUrl, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        }).catch(console.error);
      }

      if (pack.webhookUrl) {
        fetch(pack.webhookUrl, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        }).catch(console.error);
      }

      return new Response(JSON.stringify(pack.id), {
        headers: { "content-type": "application/json" },
      });
    } else {
      throw new Error("Fable endpoint not defined");
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error(err);
    captureException(err);
    return new Response(JSON.stringify({ error: err?.message }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
