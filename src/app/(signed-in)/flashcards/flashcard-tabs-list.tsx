"use client";

import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

function FlashcardTabsList() {
  const searchParams = useSearchParams();
  const { replace } = useRouter();

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (!tab) replace(`/flashcards?tab=my-sets`);
  }, [searchParams, replace]);

  return (
    <TabsList className="grid w-full grid-cols-3 max-w-md">
      <TabsTrigger
        value="my-sets"
        onClick={() => replace(`?tab=my-sets`)}
      >
        My Sets
      </TabsTrigger>
      <TabsTrigger
        value="discover"
        onClick={() => replace(`?tab=discover`)}
      >
        Discover
      </TabsTrigger>
      <TabsTrigger
        value="create"
        onClick={() => replace(`?tab=create`)}
      >
        Create
      </TabsTrigger>
    </TabsList>
  );
}

export default FlashcardTabsList;
