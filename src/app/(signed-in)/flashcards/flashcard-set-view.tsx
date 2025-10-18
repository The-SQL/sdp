import { Suspense } from "react";
import {
    FlashcardSetGrid,
    FlashcardSetGridSkeleton,
} from "./flashcard-set-grid";
import FlashcardSetSearchInput from "./flashcard-set-search-input";

function FlashcardSetView({
  searchParams,
}: {
  searchParams: { tab: string; query?: string };
}) {
  const suspenseKey = `${searchParams.tab}:${searchParams.query}`;
  return (
    <div>
      <FlashcardSetSearchInput />
      <Suspense fallback={<FlashcardSetGridSkeleton />} key={suspenseKey}>
        <FlashcardSetGrid searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

export default FlashcardSetView;
