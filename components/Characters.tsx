"use client";

/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useRef, useState } from "react";

import { hideDialog, showDialog } from "~/public/dialogs";

import Notice from "~/components/Notice";
import Dialog from "~/components/Dialog";
import Star from "~/components/Star";
import Select from "~/components/Select";
import TextInput from "~/components/TextInput";
import ImageInput from "~/components/ImageInput";
import Sort from "~/components/Sort";

import { ZeroChanModal } from "~/components/ZeroChanModal";

import { Trash2, Plus, Check } from "lucide-react";

import { i18n } from "~/utils/i18n";
import { getRelativeTimeString } from "~/utils/timeString";

import { type Character, CharacterRole } from "~/utils/types";

import nanoid from "~/utils/nanoid";

import { usePackContext } from "~/contexts/PackContext";
import { sortCharacters } from "~/utils/sorting";

import type { RequestData as Data } from "~/app/api/autogen/route";

const defaultImage =
  "https://raw.githubusercontent.com/fable-community/images-proxy/main/default/default.svg";

const Characters = ({ visible }: { visible: boolean }) => {
  const [, updateState] = useState({});
  const [descriptionLoading, setDescriptionLoading] = useState(false);
  const [zeroChanModalVisible, setZeroChanModalVisible] = useState(false);
  const [newAliasValue, setNewAliasValue] = useState("");
  const [substringQuery, setSubstringQuery] = useState("");

  const {
    media,
    characters,
    setCharacters,
    charactersSorting: sorting,
    setCharactersSorting: setSorting,
    charactersSortingOrder: order,
    setCharactersSortingOrder: setOrder,
    characterData: signal,
    setCharacterData,
    setDirty,
  } = usePackContext();

  const dialogRef = useRef<HTMLDivElement>(null);

  // used to force the entire component to redrew
  const forceUpdate = useCallback(() => updateState({}), []);

  const primaryMedia = signal.media?.[0];

  const primaryMediaRef = primaryMedia
    ? media.find(({ id }) => primaryMedia.mediaId === id)
    : undefined;

  const onCharacterUpdate = useCallback(() => {
    setDirty(true);
    signal.updated = new Date().toISOString();
    setCharacterData({ ...signal });
  }, [signal, setDirty, setCharacterData]);

  useEffect(() => {
    setCharacters(
      sortCharacters(
        characters.map((c) => (c.id === signal.id ? signal : c)),
        media,
        sorting,
        order
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signal, sorting, order]);

  const onZeroChan = () => setZeroChanModalVisible(true);

  const onAutogenerate = useCallback(() => {
    setDescriptionLoading(true);

    const characterName = signal.name.english;

    const _media = signal.media?.[0];

    const mediaTitle = _media
      ? media.find(({ id }) => _media.mediaId === id)?.title?.english
      : undefined;

    fetch("/api/autogen", {
      method: "POST",
      body: JSON.stringify({ mediaTitle, characterName } satisfies Data),
    })
      .then(async (response) => {
        if (!response.ok) {
          signal.description = "Internal Server Error";
          return;
        }

        const data: { content: string } = await response.json();

        if (!data?.content) {
          signal.description = "Internal Server Error";
          return;
        }

        signal.description = data.content;
      })
      .finally(() => {
        setDescriptionLoading(false);
        onCharacterUpdate();
      });
  }, [media, onCharacterUpdate, signal]);

  // reset zerochan
  useEffect(() => {
    setZeroChanModalVisible(false);
  }, [signal]);

  // reset dialog scroll y
  useEffect(() => {
    requestAnimationFrame(() => (dialogRef.current!.scrollTop = 0));
  }, [zeroChanModalVisible]);

  return (
    <div className={visible ? "" : "hidden"}>
      <div
        className={
          "flex flex-col gap-8 max-w-[980px] mx-auto pb-[15vh] pt-[2.5vh]"
        }
      >
        <button
          data-dialog={"characters"}
          className={"flex justify-start gap-2 bg-transparent"}
          onClick={() => {
            const item: Character = {
              rating: 1,
              id: `${nanoid(4)}`,
              name: { english: "" },
              added: new Date().toISOString(),
            };

            setCharacters([item, ...characters]);
            setCharacterData(item);
          }}
        >
          <Plus className={"w-4 h-4"} />
          {i18n("addNewCharacter")}
        </button>
        <TextInput
          placeholder={i18n("searchCharactersPlaceholder")}
          className={"border-b-2 border-grey border-solid rounded-[0px]"}
          onInput={(value) => setSubstringQuery(value)}
          value={substringQuery}
        />
        <div
          className={
            "flex flex-row max-h-[30px] items-center border-grey border-b-2 py-8 gap-3"
          }
        >
          <div className={"w-auto h-[90px] aspect-[90/127] mr-4"} />
          <Sort
            name={"name"}
            order={order}
            sorting={sorting}
            setOrder={setOrder}
            setSorting={setSorting}
          >
            {i18n("name")}
          </Sort>
          <Sort
            name={"media"}
            order={order}
            sorting={sorting}
            setOrder={setOrder}
            setSorting={setSorting}
          >
            {i18n("primaryMedia")}
          </Sort>
          <Sort
            name={"role"}
            order={order}
            sorting={sorting}
            setOrder={setOrder}
            setSorting={setSorting}
          >
            {i18n("role")}
          </Sort>
          <Sort
            name={"rating"}
            order={order}
            sorting={sorting}
            setOrder={setOrder}
            setSorting={setSorting}
          >
            {i18n("rating")}
          </Sort>
          <Sort
            name={"updated"}
            order={order}
            sorting={sorting}
            setOrder={setOrder}
            setSorting={setSorting}
          >
            {i18n("updated")}
          </Sort>
        </div>

        {Object.values(characters).map((char, i) => {
          const name = char.name.english ?? "";

          const substringIndex = name
            .toLocaleLowerCase()
            .indexOf(substringQuery.toLocaleLowerCase());

          if (substringQuery.length > 0 && substringIndex <= -1) {
            return undefined;
          }

          const primaryMedia = char.media?.[0];

          const primaryMediaRef = primaryMedia
            ? media.find(({ id }) => primaryMedia.mediaId === id)
            : undefined;

          const rating = char.rating;

          const date = char.updated ?? char.added;

          const timeString = date ? getRelativeTimeString(new Date(date)) : "";

          const nameBeforeSubstring = name.slice(0, substringIndex);
          const nameSubstring = name.slice(
            substringIndex,
            substringIndex + substringQuery.length
          );
          const nameAfterSubstring = name.slice(
            substringIndex + substringQuery.length
          );

          return (
            <div
              data-id={characters[i].id}
              key={characters[i].id}
              className={
                "flex flex-row items-center p-2 gap-3 cursor-pointer hover:bg-highlight"
              }
              onClick={() => {
                setCharacterData(characters[i]);
                requestAnimationFrame(() => showDialog("characters"));
              }}
            >
              <img
                className={
                  "bg-grey w-auto h-[90px] aspect-[90/127] mr-4 object-cover object-center"
                }
                src={char.images?.[0]?.url ?? defaultImage}
              />
              <i className={"basis-full"}>
                {nameBeforeSubstring}
                <span className={"bg-yellow-300 text-embed"}>
                  {nameSubstring}
                </span>
                {nameAfterSubstring}
              </i>
              <i className={"basis-full"}>
                {primaryMediaRef?.title.english ?? ""}
              </i>
              <i className={"basis-full"}>
                {primaryMedia?.role
                  ? `${primaryMedia.role.substring(0, 1)}${primaryMedia.role
                      .substring(1)
                      .toLowerCase()}`
                  : ""}
              </i>
              <i className={"basis-full"}>{rating}</i>
              <i className={"basis-full"}>{timeString}</i>
            </div>
          );
        })}
      </div>

      <Dialog
        name={"characters"}
        className={
          "flex items-center justify-center w-full h-full left-0 top-0 pointer-events-none"
        }
      >
        <div
          ref={dialogRef}
          className={
            "bg-embed2 flex flex-col gap-y-6 overflow-x-hidden overflow-y-auto rounded-[10px] m-4 p-4 h-[80vh] w-[80vw] max-w-[680px] pointer-events-auto"
          }
        >
          {zeroChanModalVisible ? (
            <ZeroChanModal
              onVisibleChange={setZeroChanModalVisible}
              character={signal.name.english}
              media={primaryMediaRef?.title.english}
              callback={(imageUrl) => {
                signal.images = [{ url: imageUrl }];
                onCharacterUpdate();
                forceUpdate();
              }}
            />
          ) : (
            <>
              <div className={"flex flex-row-reverse ml-auto gap-2"}>
                <Check
                  className={"w-[24px] h-[24px] cursor-pointer"}
                  onClick={() => {
                    forceUpdate();
                    requestAnimationFrame(() => hideDialog("characters"));
                  }}
                />

                <Trash2
                  className={"w-[24px] h-[24px] cursor-pointer text-red"}
                  onClick={() => {
                    const i = characters.findIndex(
                      ({ id }) => signal.id === id
                    );

                    if (i > -1 && confirm(i18n("deleteCharacter"))) {
                      characters.splice(i, 1);
                      setCharacters([...characters]);
                      forceUpdate();
                      requestAnimationFrame(() => hideDialog("characters"));
                    }
                  }}
                />
              </div>

              <div className={"flex gap-8 flex-wrap"}>
                <ImageInput
                  name={signal.id}
                  key={`${signal.id}-image`}
                  className={
                    "w-auto h-[192px] object-cover object-center aspect-[90/127] mx-auto flex-shrink-0"
                  }
                  default={signal.images?.[0]?.url ?? ""}
                  accept={["image/png", "image/jpeg", "image/webp"]}
                  onChange={(image) => {
                    signal.images = [image];
                    onCharacterUpdate();
                    forceUpdate();
                  }}
                />
                <div className={"flex flex-col grow gap-4 h-min my-auto"}>
                  <TextInput
                    className={"w-full text-disabled"}
                    placeholder={i18n("imageUrl").toUpperCase()}
                    value={
                      signal.images?.[0]?.file?.name ?? signal.images?.[0]?.url
                    }
                    onInput={(value) => {
                      signal.images = [{ url: value }];
                      onCharacterUpdate();
                      forceUpdate();
                    }}
                    key={`${signal.id}-imageurl`}
                  />

                  <div className={"flex flex-row w-full gap-2"}>
                    <button className={"flex-row w-full grow"}>
                      <label
                        className={"grow cursor-pointer"}
                        htmlFor={signal.id}
                      >
                        {i18n("uploadFromPC")}
                      </label>
                    </button>
                    <button className={"min-w-[0]"} onClick={onZeroChan}>
                      <svg
                        viewBox="0 0 512 512"
                        className={"text-disabled w-[21px] h-[21px]"}
                      >
                        <use href="/zerochan.svg#layer1" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <TextInput
                required
                pattern=".{1,128}"
                label={i18n("name")}
                value={signal.name.english ?? ""}
                onInput={(value) => {
                  signal.name.english = value;
                  onCharacterUpdate();
                }}
                key={`${signal.id}-title`}
              />

              <div className={"flex flex-wrap gap-2"}>
                <Select
                  className={"grow"}
                  label={i18n("primaryMedia")}
                  data-warning={!signal.media?.length}
                  defaultValue={signal.media?.[0]?.mediaId ?? ""}
                  list={media.reduce((acc, media) => {
                    return media.title.english
                      ? { ...acc, [media.title.english]: media.id }
                      : acc;
                  }, {})}
                  onChange={(mediaId: string) => {
                    signal.media = mediaId
                      ? [{ mediaId, role: CharacterRole.Main }]
                      : undefined;
                    onCharacterUpdate();
                    forceUpdate();
                  }}
                />
                {signal.media?.length ? (
                  <Select
                    required
                    label={i18n("role")}
                    list={CharacterRole}
                    defaultValue={signal.media![0].role}
                    onChange={(role: CharacterRole) => {
                      signal.media![0].role = role;
                      onCharacterUpdate();
                      forceUpdate();
                    }}
                  />
                ) : undefined}
              </div>

              {!signal.media?.length ? (
                <Notice type={"warn"}>{i18n("primaryMediaNotice")}</Notice>
              ) : undefined}

              <div className={"flex flex-col gap-2"}>
                <label className={"uppercase text-disabled text-[0.8rem]"}>
                  {i18n("rating")}
                </label>
                <label className={"text-disabled text-[0.75rem]"}>
                  {i18n("ratingHint")}
                </label>
                <div className={"flex"}>
                  <div className={"flex grow"}>
                    <Star
                      className={
                        "w-[28px] h-auto cursor-pointer transition-all duration-250 fill-fable"
                      }
                      onClick={() => {
                        signal.rating = 1;
                        onCharacterUpdate();
                        forceUpdate();
                      }}
                    />
                    <Star
                      className={[
                        signal.rating >= 2 ? "fill-fable" : "fill-disabled",
                        "w-[28px] h-auto cursor-pointer transition-all duration-250",
                      ].join(" ")}
                      onClick={() => {
                        signal.rating = 2;
                        onCharacterUpdate();
                        forceUpdate();
                      }}
                    />
                    <Star
                      className={[
                        signal.rating >= 3 ? "fill-fable" : "fill-disabled",
                        "w-[28px] h-auto cursor-pointer transition-all duration-250",
                      ].join(" ")}
                      onClick={() => {
                        signal.rating = 3;
                        onCharacterUpdate();
                        forceUpdate();
                      }}
                    />
                    <Star
                      className={[
                        signal.rating >= 4 ? "fill-fable" : "fill-disabled",
                        "w-[28px] h-auto cursor-pointer transition-all duration-250",
                      ].join(" ")}
                      onClick={() => {
                        signal.rating = 4;
                        onCharacterUpdate();
                        forceUpdate();
                      }}
                    />
                    <Star
                      className={[
                        signal.rating >= 5 ? "fill-fable" : "fill-disabled",
                        "w-[28px] h-auto cursor-pointer transition-all duration-250",
                      ].join(" ")}
                      onClick={() => {
                        signal.rating = 5;
                        onCharacterUpdate();
                        forceUpdate();
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className={"flex flex-row gap-2"}>
                <TextInput
                  className={"grow"}
                  label={i18n("age")}
                  placeholder={i18n("placeholderAge")}
                  value={signal.age ?? ""}
                  onInput={(value) => {
                    signal.age = value || undefined;
                    onCharacterUpdate();
                  }}
                  key={`${signal.id}-age`}
                />

                <TextInput
                  className={"grow"}
                  label={i18n("gender")}
                  placeholder={i18n("placeholderGender")}
                  value={signal.gender ?? ""}
                  onInput={(value) => {
                    signal.gender = value || undefined;
                    onCharacterUpdate();
                  }}
                  key={`${signal.id}-gender`}
                />
              </div>

              <TextInput
                multiline
                disabled={descriptionLoading}
                pattern=".{1,2048}"
                label={i18n("description")}
                placeholder={i18n("placeholderCharDescription")}
                value={signal.description}
                className={"min-h-[20vh]"}
                onInput={(value) => {
                  signal.description = value || undefined;
                  onCharacterUpdate();
                }}
                key={`${signal.id}-description`}
              >
                {!signal.description && !descriptionLoading ? (
                  <button
                    onClick={onAutogenerate}
                    className={
                      "absolute bottom-3 left-[50%] translate-x-[-50%] bg-highlight"
                    }
                  >
                    {i18n("autoGen")}
                  </button>
                ) : undefined}
                {descriptionLoading ? (
                  <LoadingSpinner className="absolute right-6 bottom-4 inline w-8 h-8 animate-spin text-grey fill-white" />
                ) : undefined}
              </TextInput>

              <div className={"flex flex-col gap-4"}>
                <div className={"flex flex-col gap-2"}>
                  <label className={"uppercase text-disabled text-[0.8rem]"}>
                    {i18n("aliases")}
                  </label>
                  <label className={"text-disabled text-[0.75rem]"}>
                    {i18n("aliasesHint")}
                  </label>
                </div>

                <div className={"flex flex-wrap gap-2"}>
                  {signal.name.alternative?.map((alias, i) => (
                    <div
                      className={
                        "flex items-center justify-center bg-embed rounded-[100vw] px-6 py-4 gap-2"
                      }
                      key={i}
                    >
                      <i>{alias}</i>
                      <Trash2
                        className={"w-[16px] h-auto cursor-pointer text-red"}
                        onClick={() => {
                          signal.name.alternative!.splice(i, 1);
                          onCharacterUpdate();
                          forceUpdate();
                        }}
                      />
                    </div>
                  ))}

                  {(signal.name.alternative?.length ?? 0) < 5 ? (
                    <div
                      className={
                        "flex items-center justify-center bg-embed rounded-[100vw] px-6 py-4 gap-2"
                      }
                    >
                      <input
                        placeholder={"Batman"}
                        value={newAliasValue}
                        className={
                          "border-0 p-0 rounded-[100vw] bg-embed text-[0.8rem] w-[180px]"
                        }
                        onInput={(event) =>
                          setNewAliasValue(
                            (event.target as HTMLInputElement).value
                          )
                        }
                      />
                      <Plus
                        className={[
                          "w-[16px] h-auto",
                          (newAliasValue?.length || 0) <= 0
                            ? "pointer-events-none opacity-60"
                            : "cursor-pointer",
                        ].join(" ")}
                        onClick={() => {
                          if (!signal.name.alternative) {
                            signal.name.alternative = [];
                          }

                          const length = newAliasValue?.length || 0;

                          if (length >= 1 && length <= 128) {
                            signal.name.alternative.push(newAliasValue);

                            setNewAliasValue("");

                            onCharacterUpdate();

                            forceUpdate();
                          }
                        }}
                      />
                    </div>
                  ) : undefined}
                </div>
              </div>

              <div className={"flex flex-col"}>
                <label className={"uppercase text-disabled text-[0.8rem]"}>
                  {i18n("links")}
                </label>
                <Notice type={"info"}>{i18n("linksNotice")}</Notice>
                <div className={"flex flex-col gap-2"}>
                  {signal.externalLinks?.map((link, i) => (
                    <div
                      key={i}
                      className={"flex items-center flex-wrap gap-2"}
                    >
                      <TextInput
                        required
                        value={link.site}
                        placeholder={"YouTube"}
                        onInput={(site) => {
                          signal.externalLinks![i].site = site;
                          onCharacterUpdate();
                        }}
                        key={`${signal.id}-link-${i}-site`}
                      />
                      <TextInput
                        required
                        value={link.url}
                        pattern={
                          "^(https:\\/\\/)?(www\\.)?(youtube\\.com|twitch\\.tv|netflix\\.com|crunchyroll\\.com|tapas\\.io|webtoons\\.com|amazon\\.com)[\\S]*$"
                        }
                        placeholder={
                          "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                        }
                        onInput={(url) => {
                          signal.externalLinks![i].url = url;
                          onCharacterUpdate();
                        }}
                        key={`${signal.id}-link-${i}-url`}
                      />
                      <Trash2
                        className={"w-[24px] h-auto cursor-pointer text-red"}
                        onClick={() => {
                          signal.externalLinks!.splice(i, 1);
                          onCharacterUpdate();
                          forceUpdate();
                        }}
                      />
                    </div>
                  ))}
                  {(signal.externalLinks?.length ?? 0) < 5 ? (
                    <button
                      onClick={() => {
                        if (!signal.externalLinks) {
                          signal.externalLinks = [];
                        }

                        signal.externalLinks.push({
                          site: "",
                          url: "",
                        });

                        forceUpdate();
                      }}
                    >
                      <Plus />
                    </button>
                  ) : undefined}
                </div>
              </div>
            </>
          )}
        </div>
      </Dialog>
    </div>
  );
};

const LoadingSpinner = (props: { className: string }) => {
  return (
    <svg className={props.className} viewBox="0 0 100 101">
      <path
        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
        fill="currentColor"
      />
      <path
        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
        fill="currentFill"
      />
    </svg>
  );
};

export default Characters;
