/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */

import compact from "~/utils/compact";
import { Approved } from "~/components/Approved";

import { Download, User, Calendar } from "lucide-react";

import type { PackWithCount } from "~/utils/types.ts";

import { i18n } from "~/utils/i18n";

const defaultImage =
  "https://raw.githubusercontent.com/fable-community/images-proxy/main/default/default.svg";

const PackDate = ({ updatedAt }: { updatedAt: Date }) => {
  const daysAgo = Math.ceil(
    (new Date(updatedAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  if (daysAgo === 0) {
    return <p>{i18n("justNow")}</p>;
  } else if (daysAgo < -30) {
    return <p>+{new Intl.RelativeTimeFormat().format(-30, "day")}</p>;
  } else {
    return <p>{new Intl.RelativeTimeFormat().format(daysAgo, "day")}</p>;
  }
};

const PackTile = ({ pack, index }: { pack: PackWithCount; index: number }) => {
  return (
    <a
      href={`/${pack.manifest.id}`}
      className={
        "grid grid-cols-[auto_auto_1fr] w-full gap-8 p-8 hover:bg-embed2 rounded-lg cursor-pointer"
      }
    >
      <i className={"text-[4rem] w-[4rem] font-bold"}>{index + 1}</i>

      <img
        src={pack.manifest.image ?? defaultImage}
        className={
          "bg-grey w-[92px] min-w-[92px] h-[92px] object-cover object-center rounded-[14px]"
        }
      />

      <div className={"flex flex-col gap-1 justify-center"}>
        <i className={"flex flex-row items-center font-bold text-[0.95rem]"}>
          {pack.manifest.title ?? pack.manifest.id}
          {pack.manifest.approved ? <Approved /> : undefined}
        </i>

        {pack.manifest.description ? (
          <p
            className={
              "text-[0.85rem] opacity-80 line-clamp-2 overflow-hidden overflow-ellipsis"
            }
          >
            {pack.manifest.description}
          </p>
        ) : undefined}

        <div className={"flex gap-3 text-white opacity-80 mt-3 uppercase"}>
          {pack.servers ? (
            <div className={"flex gap-1"}>
              <Download className={"w-4 h-4 mt-0.5"} />
              <p>{i18n("packServers", compact(pack.servers))}</p>
            </div>
          ) : (
            <div className={"flex gap-1"}>
              <Calendar className={"w-4 h-4 mt-0.5"} />
              {PackDate({ updatedAt: pack.manifest.updatedAt })}
            </div>
          )}

          {/* <p>{`•`}</p> */}

          {/* <div className={"flex gap-1"}>
            <User className={"w-4 h-4 mt-0.5"} />
            <p>{`${pack.manifest.characters ?? 0} ${i18n("characters")}`}</p>
          </div> */}
        </div>
      </div>
    </a>
  );
};

export default PackTile;
