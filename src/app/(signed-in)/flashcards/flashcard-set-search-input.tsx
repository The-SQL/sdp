"use client";

import { Input } from "@/components/ui/input";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

function FlashcardSetSearchInput() {
  const [query, setQuery] = useState<string>("");
  const [debouncedQuery] = useDebounce(query, 300);
  const { replace } = useRouter();

  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value.trim());
  }

  useEffect(() => {
    if (!debouncedQuery) {
      params.delete("query");
    } else {
      params.set("query", debouncedQuery);
    }
    replace(`?${params.toString()}`);
  }, [debouncedQuery]);

  return (
    <Input
      placeholder="Search for flashcard set"
      className="mb-8"
      onChange={handleChange}
      value={query}
    />
  );
}

export default FlashcardSetSearchInput;
