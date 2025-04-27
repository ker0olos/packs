"use client";

import { useState } from "react";

import { serialize } from "bson";

import ImageInput from "~/components/ImageInput";
import Dialog from "~/components/Dialog";
import { Dismissible } from "~/components/Notice";
import Media from "~/components/Media";
import Characters from "~/components/Characters";
import Maintainers from "~/components/Maintainers";
import Conflicts from "~/components/Conflicts";
import TextInput from "~/components/TextInput";
import PublishPopup from "~/components/PublishPopup";
import HowToInstallDialog from "~/components/HowToInstallDialog";

import { ArrowLeft, Check, Settings2, Clipboard } from "lucide-react";

import { i18n } from "~/utils/i18n";

import type { Data } from "~/app/api/publish/route";

import { User, type Pack } from "~/utils/types";

import { PackProvider, usePackContext } from "~/contexts/PackContext";

const IS_BROWSER = typeof document !== "undefined";

const ManageContent = (props: { pack: Pack; user: User }) => {
  const url = new URLSearchParams(IS_BROWSER ? location.search : "");

  const pack: Readonly<Pack["manifest"]> = JSON.parse(
    JSON.stringify(props.pack.manifest)
  );

  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [howToInstallVisible] = useState(url.has("new"));

  const {
    author,
    setAuthor,
    characters,
    conflicts,
    description,
    setDescription,
    dirty,
    setDirty,
    image,
    setImage,
    maintainers,
    media,
    nsfw,
    setNsfw,
    packId,
    privacy,
    setPrivacy,
    title,
    setTitle,
    webhookUrl,
    setWebhookUrl,
  } = usePackContext();

  const getData = (): Data => ({
    old: props.pack?.manifest ?? pack,
    title,
    private: privacy,
    nsfw,
    author,
    description,
    webhookUrl,
    image,
    media,
    characters,
    maintainers,
    conflicts,
  });

  const onPublish = async () => {
    const body = {
      new: false,
      ...getData(),
      username: props.user.display_name ?? props.user.username ?? "undefined",
    };

    setLoading(true);

    try {
      const response = await fetch(`/api/publish`, {
        method: "POST",
        body: serialize(body),
      });

      if (response.status === 200) {
        setDirty(false);
        setLoading(false);
      } else {
        const text = await response.text();

        if (!text.startsWith("{")) {
          setError(text);
          console.error(text);
        } else {
          const { errors } = JSON.parse(text) as {
            errors: { path: string[]; message: string }[];
          };

          document
            .querySelectorAll(`[invalid]`)
            .forEach((ele) => ele.removeAttribute(`invalid`));

          document
            .querySelectorAll(`[shake]`)
            .forEach((ele) => ele.removeAttribute(`shake`));

          console.error(errors);

          errors.forEach(({ path }) => {
            if (path[0] === "media" || path[0] === "characters") {
              const i = parseInt(path[1]);

              const item =
                path[0] === "characters" ? pack.characters![i] : pack.media![i];

              const child = document.querySelector(`[data-id="${item.id}"]`);

              setTimeout(() => {
                child?.setAttribute("shake", "true");
                child?.setAttribute("invalid", "true");
              }, 100);
            }
          });
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: Error | any) {
      setError(err?.message);
      console.error(err?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error && <Dismissible>{error}</Dismissible>}

      <div
        className={
          "flex fixed top-0 left-0 w-full h-full bg-embed overflow-x-hidden overflow-y-auto"
        }
      >
        {/* this component require client-side javascript enabled */}
        <noscript>{i18n("noScript")}</noscript>

        <HowToInstallDialog packId={packId} visible={howToInstallVisible} />

        <div className={"m-4 w-full h-full"}>
          <div className={"flex items-center gap-4 w-full"}>
            <a href={"/dashboard"}>
              <ArrowLeft className={"w-[28px] h-[28px] cursor-pointer"} />
            </a>

            <ImageInput
              name={"pack-image"}
              default={pack.image}
              className={"w-[44px] aspect-square rounded-full"}
              accept={["image/png", "image/jpeg", "image/webp"]}
              onChange={(value) => {
                setImage(value);
                setDirty(true);
              }}
            />

            <input
              type={"text"}
              value={title}
              pattern=".{3,128}"
              className={"bg-embed h-[48px] grow"}
              placeholder={i18n("packTitle")}
              onInput={(ev) => {
                setTitle((ev.target as HTMLInputElement).value);
                setDirty(true);
              }}
            />

            <PublishPopup
              loading={loading}
              dirty={dirty}
              onPublish={onPublish}
            />

            <Settings2
              className={"w-[28px] h-[28px] cursor-pointer"}
              data-dialog={"extra"}
            />
          </div>

          <div className={"grid grid-flow-col overflow-auto mt-2"}>
            {(i18n("tabs") as unknown as string[]).map((s, i) => (
              <div
                key={i}
                className={[
                  "text-center px-1 py-4 font-[600] uppercase cursor-pointer border-b-2 hover:border-white",
                  active === i ? "border-white" : "border-grey",
                ].join(" ")}
                onClick={() => setActive(i)}
              >
                {s}
              </div>
            ))}
          </div>

          <Characters visible={active === 0} />

          <Media visible={active === 1} />

          <Maintainers
            visible={active === 2}
            owner={props.pack?.owner ?? props.user.id}
          />

          <Conflicts visible={active === 3} />
        </div>

        <Dialog
          name={"extra"}
          className={
            "flex items-center justify-center w-full h-full left-0 top-0 pointer-events-none"
          }
        >
          <div
            className={
              "flex flex-col gap-6 bg-embed2 overflow-x-hidden overflow-y-auto rounded-xl m-4 p-6 h-[80vh] w-[70vw]  pointer-events-auto"
            }
          >
            <Check
              data-dialog-cancel={"extra"}
              className={"cursor-pointer w-[28px] h-[28px] ml-auto shrink-0	"}
            />

            <div
              className={"bg-highlight flex items-center p-4 rounded-xl"}
              data-clipboard={`/packs install id: ${packId}`}
            >
              <i className={"italic grow select-all"}>
                {`/packs install id: ${packId}`}
              </i>
              <Clipboard className={"w-[18px] h-[18px] cursor-pointer"} />
            </div>

            <div className={"flex flex-col grow gap-2"}>
              <label className={"uppercase text-[0.8rem] text-disabled"}>
                {i18n("packVisibility")}
              </label>

              <div className={"flex flex-col rounded-xl overflow-hidden"}>
                <button
                  onClick={() => {
                    setPrivacy(!privacy);
                    setDirty(true);
                  }}
                  className={
                    "py-4 justify-start text-left flex gap-4 bg-embed hover:shadow-none"
                  }
                >
                  <div className={"p-2 border-2 border-grey rounded-lg"}>
                    <Check
                      className={privacy ? "w-5 h-5 opacity-0" : "w-5 h-5"}
                    />
                  </div>
                  <span>{i18n("publicPackNotice")}</span>
                </button>
              </div>
            </div>

            <div className={"flex flex-col grow gap-2"}>
              <label className={"uppercase text-[0.8rem] text-disabled"}>
                {i18n("packNSFW")}
              </label>

              <div className={"flex flex-col rounded-xl overflow-hidden"}>
                <button
                  onClick={() => {
                    setNsfw(!nsfw);
                    setDirty(true);
                  }}
                  className={
                    "py-4 justify-start text-left flex gap-4 bg-embed hover:shadow-none"
                  }
                >
                  <div className={"p-2 border-2 border-grey rounded-lg"}>
                    <Check
                      className={!nsfw ? "w-5 h-5 opacity-0" : "w-5 h-5"}
                    />
                  </div>
                  <span>{i18n("packNSFWHint")}</span>
                </button>
              </div>
            </div>

            <TextInput
              value={author}
              label={i18n("packAuthor")}
              placeholder={i18n("placeholderPackAuthor")}
              onInput={(value) => {
                setAuthor(value);
                setDirty(true);
              }}
            />

            <TextInput
              multiline
              value={description}
              label={i18n("packDescription")}
              placeholder={i18n("placeholderPackDescription")}
              onInput={(value) => {
                setDescription(value);
                setDirty(true);
              }}
            />

            <TextInput
              value={webhookUrl}
              label={i18n("packWebhookUrl")}
              hint={i18n("packWebhookUrlHint")}
              pattern={"https://discord.com/api/webhooks/[0-9]{18,19}/.+"}
              placeholder={
                "https://discord.com/api/webhooks/185033133521895424/AAabbb"
              }
              onInput={(value) => {
                setWebhookUrl(value);
                setDirty(true);
              }}
            />
          </div>
        </Dialog>
      </div>
    </>
  );
};

const Manage = (props: { user: User; pack: Pack }) => {
  return (
    <PackProvider pack={props.pack}>
      <ManageContent user={props.user} pack={props.pack} />
    </PackProvider>
  );
};

export default Manage;
