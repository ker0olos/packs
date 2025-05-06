"use client";

/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
import React, { useCallback, useEffect, useState } from "react";

import Notice from "~/components/Notice";

import { Trash2, Crown } from "lucide-react";

import { i18n } from "~/utils/i18n";

import { usePackContext } from "~/contexts/PackContext";

import type { User } from "~/utils/types.ts";

const Profile = ({
  id,
  user,
  removable,
  onClick,
}: {
  id: string;
  user?: User;
  removable: boolean;
  onClick?: () => void;
}) => {
  return (
    <div
      className={
        "bg-embed2 flex items-center justify-center rounded-[100vw] px-4 py-2 gap-3"
      }
    >
      <img
        className={
          "w-[24px] h-auto aspect-square bg-grey object-center object-cover rounded-full"
        }
        src={`/api/avatar/${id}`}
      />

      <div className={"flex flex-col"}>
        {user ? (
          <i>{user?.display_name ?? user?.username}</i>
        ) : (
          <div className={"w-[52px] h-[16px] bg-grey"}></div>
        )}

        {user ? (
          <i className={"opacity-60"}>
            {user?.username
              ? user?.discriminator !== "0"
                ? `${user?.username}#${user?.discriminator}`
                : `@${user?.username}`
              : ""}
          </i>
        ) : undefined}
      </div>

      {removable ? (
        <Trash2
          className={"text-red w-[18px] h-auto cursor-pointer"}
          onClick={onClick}
        />
      ) : (
        <Crown className={"text-fable w-[18px] h-auto"} />
      )}
    </div>
  );
};

const Maintainers = ({
  owner,
  visible,
}: {
  owner: string;
  visible: boolean;
}) => {
  const [data, setData] = useState<Record<string, User>>({});
  const [userId, setUserId] = useState("");

  const { maintainers, setMaintainers, setDirty } = usePackContext();

  useEffect(() => {
    Promise.all(
      [owner, ...maintainers].map(async (id) => {
        const response = await fetch(`/api/probe/${id}`);

        return response.json() as Promise<User>;
      })
    )
      .then((array) => {
        const _data = array.reduce((acc, user) => {
          return { ...acc, [user.id]: user };
        }, {});

        setData(_data);
      })
      .catch(console.error);
  }, [owner, maintainers]);

  const handleAddMaintainer = useCallback(() => {
    if (!maintainers.includes(userId)) {
      setMaintainers([...maintainers, userId]);
      setDirty(true);
    }
  }, [userId, maintainers, setDirty, setMaintainers]);

  const handleRemoveMaintainer = useCallback(
    (index: number) => {
      const newMaintainers = [...maintainers];
      newMaintainers.splice(index, 1);
      setMaintainers(newMaintainers);
      setDirty(true);
    },
    [maintainers, setDirty, setMaintainers]
  );

  return (
    <div
      className={[
        "grid w-full max-w-[980px] my-8 mx-auto gap-4",
        visible ? "" : "hidden",
      ].join(" ")}
    >
      <input
        type={"text"}
        pattern={"[0-9]{18,19}"}
        placeholder={`${i18n("userId")} (e.g. 185033133521895424)`}
        className={
          "w-full text-[0.95rem] p-2 rounded-0 border-b-2 border-embed"
        }
        onInput={(event) => setUserId((event.target as HTMLInputElement).value)}
      />

      <button
        className={"flex gap-2 py-3"}
        disabled={!/^[0-9]{18,19}$/.test(userId)}
        onClick={handleAddMaintainer}
      >
        {i18n("addNew")}
      </button>

      <i className={"h-[2px] bg-grey"} />

      <Notice type={"info"}>{i18n("maintainersNotice")}</Notice>

      <div className="flex flex-wrap mb-[15vh] gap-2">
        <Profile id={owner} user={data[owner]} removable={false} />

        {maintainers.map((id, i) => (
          <Profile
            id={id}
            key={id}
            user={data[id]}
            removable={true}
            onClick={() => handleRemoveMaintainer(i)}
          />
        ))}
      </div>
    </div>
  );
};

export default Maintainers;
