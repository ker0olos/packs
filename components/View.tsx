/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import { Approved } from "~/components/Approved";

import { Clipboard } from "lucide-react";

import { i18n } from "~/utils/i18n";

import type { Alias, Pack } from "~/utils/types.ts";

const defaultImage =
  "https://raw.githubusercontent.com/fable-community/images-proxy/main/default/default.svg";

const getAlias = (alias: Alias) =>
  alias.english ?? alias.romaji ?? alias.native;

const View = ({ pack }: { pack: Pack }) => {
  return (
    <div className="flex flex-col">
      <Header pack={pack} />

      <div className={"flex flex-col gap-8 mx-4 my-8"}>
        <p className={"uppercase font-bold text-base opacity-60"}>
          {`${i18n("media")} (${pack.manifest.media?.length ?? 0})`}
        </p>
        <Collection collection={pack.manifest.media} />
      </div>

      <div className={"flex flex-col gap-8 mx-4 my-8"}>
        <p className={"uppercase font-bold text-base opacity-60"}>
          {`${i18n("characters")} (${pack.manifest.characters?.length ?? 0})`}
        </p>
        <Collection collection={pack.manifest.characters} />
      </div>
    </div>
  );
};

const Header = ({ pack }: { pack: Pack }) => {
  return (
    <div className={"flex flex-row gap-8"}>
      <img
        src={pack.manifest.image ?? defaultImage}
        className={
          "bg-grey w-[128px] min-w-[128px] h-[128px] object-cover object-center rounded-[14px]"
        }
      />

      <div className={"flex flex-col grow gap-4 justify-center"}>
        {/* TODO not currently available */
        /* <div className={'flex gap-3 text-white opacity-80 uppercase'}>
          <IconDownload className={'w-4 h-4'} />
          {i18n('packServers', pack.servers ?? 0)}
        </div> */}

        <i
          className={
            "flex flex-row items-center font-bold text-[0.95rem] select-text"
          }
        >
          {pack.manifest.title ?? pack.manifest.id}
        </i>

        {pack.manifest.description ? (
          <p
            className={
              "text-[0.85rem] select-text opacity-80 line-clamp-4 overflow-hidden overflow-ellipsis"
            }
          >
            {pack.manifest.description}
          </p>
        ) : undefined}

        <div
          className={"bg-highlight flex items-center p-4 rounded-xl"}
          data-clipboard={`/packs install id: ${pack.manifest.id}`}
        >
          <i className={"italic grow select-all"}>
            {`/packs install id: ${pack.manifest.id}`}
          </i>
          <Clipboard className="w-[18px] h-[18px] cursor-pointer" />
        </div>

        {pack.manifest.author ? (
          <div className="flex items-center">
            {i18n("by-author", pack.manifest.author)}
            {pack.approved ? <Approved /> : undefined}
          </div>
        ) : undefined}
      </div>
    </div>
  );
};

const Collection = ({
  collection,
}: {
  collection: Pack["manifest"]["characters"] | Pack["manifest"]["media"];
}) => {
  if (!collection?.length) {
    return (
      <p className={"uppercase font-bold text-base opacity-60 text-center"}>
        {i18n("empty")}
      </p>
    );
  }

  const slice = collection.slice(0, 8);
  const diff = collection.length - slice.length;

  return (
    <div className={"flex flex-wrap gap-4"}>
      {slice.map((item, i) => (
        <img
          key={i}
          title={getAlias("name" in item ? item.name : item.title)}
          src={item.images?.[0]?.url ?? defaultImage}
          className={
            "w-auto h-[192px] object-cover object-center aspect-[90/127] bg-grey"
          }
        />
      ))}

      {diff > 0 ? (
        <div
          className={
            "flex justify-center items-center w-auto h-[192px] object-cover object-center aspect-[90/127] border-grey border-2"
          }
        >
          <p
            className={"uppercase font-bold text-4xl text-grey"}
          >{`+${diff}`}</p>
        </div>
      ) : undefined}
    </div>
  );
};

export default View;
