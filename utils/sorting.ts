import type {
  CharacterSorting,
  DisaggregatedCharacter,
  DisaggregatedMedia,
  Media,
  MediaSorting,
  SortingOrder,
} from "~/utils/types.ts";

const sortByUpdateTimestamp = (
  a: DisaggregatedCharacter | DisaggregatedMedia,
  b: DisaggregatedCharacter | DisaggregatedMedia
) => {
  const dateA = a.updated ?? a.added;
  const dateB = b.updated ?? b.added;

  if (dateA && !dateB) {
    return -1;
  } else if (!dateA && dateB) {
    return 1;
  } else if (dateA && dateB) {
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  } else {
    return 0;
  }
};

const sortByName = (a: DisaggregatedCharacter, b: DisaggregatedCharacter) => {
  const nameA = a.name.english ?? "";
  const nameB = b.name.english ?? "";
  return nameA.localeCompare(nameB);
};

const sortByTitle = (a: DisaggregatedMedia, b: DisaggregatedMedia) => {
  const titleA = a.title.english ?? "";
  const titleB = b.title.english ?? "";
  return titleA.localeCompare(titleB);
};

const sortByPopularity = (a: DisaggregatedMedia, b: DisaggregatedMedia) => {
  const popularityA = a.popularity ?? 0;
  const popularityB = b.popularity ?? 0;
  return popularityB - popularityA;
};

const sortByRating = (a: DisaggregatedCharacter, b: DisaggregatedCharacter) => {
  return b.rating - a.rating;
};

const sortByMediaTitle = (
  a: DisaggregatedCharacter,
  b: DisaggregatedCharacter,
  media: Media[]
) => {
  const aPrimaryMedia = a.media?.[0];

  const aPrimaryMediaRef = aPrimaryMedia
    ? media.find(({ id }) => aPrimaryMedia.mediaId === id)
    : undefined;

  const aMediaTitle = aPrimaryMediaRef?.title.english ?? "";

  const bPrimaryMedia = b.media?.[0];

  const bPrimaryMediaRef = bPrimaryMedia
    ? media.find(({ id }) => bPrimaryMedia.mediaId === id)
    : undefined;

  const bMediaTitle = bPrimaryMediaRef?.title.english ?? "";

  return aMediaTitle.localeCompare(bMediaTitle);
};

const sortByMediaRole = (
  a: DisaggregatedCharacter,
  b: DisaggregatedCharacter
) => {
  const aPrimaryMedia = a.media?.[0];

  const aMediaRole = aPrimaryMedia?.role ?? "";

  const bPrimaryMedia = b.media?.[0];

  const bMediaRole = bPrimaryMedia?.role ?? "";

  return aMediaRole.localeCompare(bMediaRole);
};

export const sortCharacters = (
  characters: DisaggregatedCharacter[],
  media: Media[],
  sorting: CharacterSorting,
  order: SortingOrder
): DisaggregatedCharacter[] => {
  const sortedList = characters.sort((a, b) => {
    switch (sorting) {
      case "updated":
        return sortByUpdateTimestamp(a, b);
      case "name":
        return sortByName(a, b);
      case "rating":
        return sortByRating(a, b);
      case "media":
        return sortByMediaTitle(a, b, media);
      case "role":
        return sortByMediaRole(a, b);
    }
  });

  if (order === "asc") {
    return sortedList.toReversed();
  }

  return sortedList;
};

export const sortMedia = (
  media: DisaggregatedMedia[],
  sorting: MediaSorting,
  order: SortingOrder
): DisaggregatedMedia[] => {
  const sortedList = media.sort((a, b) => {
    switch (sorting) {
      case "updated":
        return sortByUpdateTimestamp(a, b);
      case "title":
        return sortByTitle(a, b);
      case "popularity":
        return sortByPopularity(a, b);
      default:
        throw new Error("Not Implemented");
    }
  });

  if (order === "asc") {
    return sortedList.toReversed();
  }

  return sortedList;
};
