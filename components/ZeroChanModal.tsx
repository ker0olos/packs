/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";

import { ChipsInput } from "~/components/ChipsInput";

import { ArrowLeft } from "lucide-react";

import { i18n } from "~/utils/i18n";

import { useDebounce } from "~/utils/useDebounce";

import type { Data, Image } from "~/app/api/zerochan/route";

export const ZeroChanModal = ({
  character,
  media,
  onVisibleChange,
  callback,
}: {
  media?: string;
  character?: string;
  onVisibleChange: (visible: boolean) => void;
  callback: (imageUrl: string) => void;
}) => {
  const [error, setError] = useState("");
  const [images, setImages] = useState<Image[]>([]);

  const [queries, setQueries] = useState<string[]>([]);
  const [debouncedQueries, , setDebouncedQueries] = useDebounce<string[]>([], 300);

  // Initialize queries based on character and media
  useEffect(() => {
    const initialQueries = [];
    if (character) {
      initialQueries.push(character.replaceAll(":", ""));
    }
    if (media && character) {
      initialQueries.push(`${character.replaceAll(":", "")} (${media.replaceAll(":", "")})`);
    }
    if (initialQueries.length > 0) {
      setQueries(initialQueries);
    }
  }, [media, character]);

  // Debounce queries changes
  useEffect(() => {
    setDebouncedQueries(queries);
  }, [queries, setDebouncedQueries]);

  // Fetch images for multiple queries
  useEffect(() => {
    if (debouncedQueries.length === 0) {
      setImages([]);
      return;
    }

    setImages([]);
    setError("");

    // Create promises for all queries
    const searchPromises = debouncedQueries.map(async (query) => {
      try {
        const response = await fetch("/api/zerochan", {
          method: "POST",
          body: JSON.stringify({ query } satisfies Data),
        });

        if (response.status !== 200) {
          throw new Error(response.statusText);
        }

        const data: { images: Image[] } = await response.json();
        return data.images ?? [];
      } catch (error) {
        console.error(`Error fetching images for query "${query}":`, error);
        return [];
      }
    });

    // Execute all searches in parallel
    Promise.all(searchPromises)
      .then((resultsArray) => {
        // Combine all results
        const allImages = resultsArray.flat();
        
        // Remove duplicates based on image ID
        const uniqueImages = allImages.filter((image, index, array) => 
          array.findIndex(img => img.id === image.id) === index
        );

        setImages(uniqueImages);
      })
      .catch((error) => {
        console.error("Error in parallel search:", error);
        setError("Failed to search images");
      });
  }, [debouncedQueries]);

  return (
    <>
      <div
        className={"w-full cursor-pointer"}
        onClick={() => onVisibleChange(false)}
      >
        <ArrowLeft className={"w-[24px] h-[24px]"} />
      </div>

      <ChipsInput
        className="max-h-[48px]"
        placeholder={i18n("search")}
        onChange={setQueries}
        value={queries}
      />

      <div className={"flex flex-wrap grow justify-center gap-4"}>
        {error ? <span>{error}</span> : undefined}

        {!error && images.length <= 0 ? (
          <span>{i18n("loading")}</span>
        ) : undefined}

        {images.map((image) => (
          <img
            key={image.id}
            className={
              "w-auto h-[192px] object-cover object-center aspect-[90/127] cursor-pointer hover:scale-95 hover:border-[3px] border-white border-solid"
            }
            src={image.thumbnail}
            onClick={() => {
              callback(image.thumbnail);
              onVisibleChange(false);
            }}
          />
        ))}
      </div>
    </>
  );
};
