import { createContext, useContext, useState } from "react";
import { MediaType } from "~/utils/types";
import type {
  Pack,
  Character,
  Media as TMedia,
  MediaSorting,
  CharacterSorting,
  SortingOrder,
} from "~/utils/types";
import type { IImageInput } from "~/components/ImageInput";
import { sortCharacters, sortMedia } from "~/utils/sorting";

interface PackContextType {
  dirty: boolean;
  setDirty: (value: boolean) => void;
  packId: string;
  title?: string;
  setTitle: (value?: string) => void;
  privacy?: boolean;
  setPrivacy: (value?: boolean) => void;
  nsfw?: boolean;
  setNsfw: (value?: boolean) => void;
  author?: string;
  setAuthor: (value?: string) => void;
  description?: string;
  setDescription: (value?: string) => void;
  webhookUrl?: string;
  setWebhookUrl: (value?: string) => void;
  image?: IImageInput;
  setImage: (value?: IImageInput) => void;
  maintainers: string[];
  setMaintainers: (value: string[]) => void;
  conflicts: string[];
  setConflicts: (value: string[]) => void;
  characterData: Character;
  setCharacterData: (value: Character) => void;
  mediaData: TMedia;
  setMediaData: (value: TMedia) => void;
  mediaSorting: MediaSorting;
  setMediaSorting: (value: MediaSorting) => void;
  mediaSortingOrder: SortingOrder;
  setMediaSortingOrder: (value: SortingOrder) => void;
  charactersSorting: CharacterSorting;
  setCharactersSorting: (value: CharacterSorting) => void;
  charactersSortingOrder: SortingOrder;
  setCharactersSortingOrder: (value: SortingOrder) => void;
  media: TMedia[];
  setMedia: (value: TMedia[]) => void;
  characters: Character[];
  setCharacters: (value: Character[]) => void;
}

const PackContext = createContext<PackContextType | undefined>(undefined);

export function PackProvider({
  children,
  pack,
}: {
  children: React.ReactNode;
  pack: Pack;
}) {
  const [dirty, setDirty] = useState(false);
  const [title, setTitle] = useState<string | undefined>(pack.manifest.title);
  const [privacy, setPrivacy] = useState<boolean | undefined>(
    pack.manifest.private
  );
  const [nsfw, setNsfw] = useState<boolean | undefined>(pack.manifest.nsfw);
  const [author, setAuthor] = useState<string | undefined>(
    pack.manifest.author
  );
  const [description, setDescription] = useState<string | undefined>(
    pack.manifest.description
  );
  const [webhookUrl, setWebhookUrl] = useState<string | undefined>(
    pack.manifest.webhookUrl
  );
  const [image, setImage] = useState<IImageInput | undefined>(undefined);
  const [maintainers, setMaintainers] = useState(
    pack.manifest.maintainers ?? []
  );
  const [conflicts, setConflicts] = useState(pack.manifest.conflicts ?? []);
  const [characterData, setCharacterData] = useState<Character>({
    rating: 1,
    name: { english: "" },
    id: "",
  });
  const [mediaData, setMediaData] = useState<TMedia>({
    type: MediaType.Anime,
    title: { english: "" },
    id: "",
  });
  const [mediaSorting, setMediaSorting] = useState<MediaSorting>("updated");
  const [mediaSortingOrder, setMediaSortingOrder] =
    useState<SortingOrder>("desc");
  const [charactersSorting, setCharactersSorting] =
    useState<CharacterSorting>("updated");
  const [charactersSortingOrder, setCharactersSortingOrder] =
    useState<SortingOrder>("desc");
  const [media, setMedia] = useState(
    sortMedia(pack.manifest.media ?? [], mediaSorting, mediaSortingOrder)
  );
  const [characters, setCharacters] = useState(
    sortCharacters(
      pack.manifest.characters ?? [],
      media,
      charactersSorting,
      charactersSortingOrder
    )
  );

  return (
    <PackContext.Provider
      value={{
        dirty,
        setDirty,
        packId: pack.manifest.id,
        title,
        setTitle,
        privacy,
        setPrivacy,
        nsfw,
        setNsfw,
        author,
        setAuthor,
        description,
        setDescription,
        webhookUrl,
        setWebhookUrl,
        image,
        setImage,
        maintainers,
        setMaintainers,
        conflicts,
        setConflicts,
        characterData,
        setCharacterData,
        mediaData,
        setMediaData,
        mediaSorting,
        setMediaSorting,
        mediaSortingOrder,
        setMediaSortingOrder,
        charactersSorting,
        setCharactersSorting,
        charactersSortingOrder,
        setCharactersSortingOrder,
        media,
        setMedia,
        characters,
        setCharacters,
      }}
    >
      {children}
    </PackContext.Provider>
  );
}

export function usePackContext() {
  const context = useContext(PackContext);
  if (context === undefined) {
    throw new Error("usePackContext must be used within a PackProvider");
  }
  return context;
}
