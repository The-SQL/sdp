import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { PostgrestError } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";
import { useDebounce } from "use-debounce";

type SearchableInputProps<TItem extends { id: string; name: string }> = {
  dbCall: (
    query: string
  ) => Promise<{ data: TItem[]; error: PostgrestError | null }>;
  onSelect: (item: TItem) => void;
  selected?: TItem | null;
  isCreationAllowed?: boolean;
  createSearchType?: (name: string) => Promise<TItem>;
  placeholder?: string;
  getLabel?: (item: TItem) => string;
  clearOnSelect?: boolean;
};

function SearchableInput<TItem extends { id: string; name: string }>({
  dbCall,
  onSelect,
  selected = null,
  isCreationAllowed = false,
  createSearchType,
  placeholder = "Search…",
  getLabel = (i) => i.name,
  clearOnSelect = false,
}: SearchableInputProps<TItem>) {
  const [showPopover, setShowPopover] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState(selected ? getLabel(selected) : "");
  const [debouncedQuery] = useDebounce(query, 300);

  const [results, setResults] = useState<TItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Keep input in sync if parent changes selected
  useEffect(() => {
    if (selected) {
      setQuery(getLabel(selected));
      setResults([]);
      setShowPopover(false);
    }
  }, [selected, getLabel]);

  // Fetch results when typing
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const q = debouncedQuery.trim();
      if (!q) {
        setResults([]);
        setShowPopover(false);
        return;
      }

      setLoading(true);
      const { data, error } = await dbCall(q);
      if (cancelled) return;

      const list = !error && data ? data : [];
      setResults(list);
      setLoading(false);

      // Only open if the input is still focused and there are results
      setShowPopover(isFocused && list.length > 0);
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, dbCall, isFocused]);

  // Close when query cleared
  useEffect(() => {
    if (!debouncedQuery) {
      setShowPopover(false);
      setResults([]);
    }
  }, [debouncedQuery]);

  const choose = (item: TItem) => {
    onSelect(item);
    if (clearOnSelect) {
      setQuery("");
      setResults([]);
    } else {
      setQuery(getLabel(item));
    }
    setShowPopover(false);
  };

  const createAndChoose = async () => {
    if (!createSearchType) return;
    const item = await createSearchType(query.trim());
    if (item) choose(item);
  };

  return (
    <Popover
      open={showPopover}
      onOpenChange={(open) => {
        // Only allow opening if focused AND results exist
        if (open && isFocused && results.length > 0) setShowPopover(true);
        else setShowPopover(false);
      }}
    >
      <PopoverTrigger asChild>
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            if (results.length > 0) setShowPopover(true);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            // Delay closing slightly so clicks inside the content can register
            setTimeout(() => setShowPopover(false), 0);
          }}
          onKeyDown={(e) => {
            if (results.length > 0 && isFocused) setShowPopover(true);
            if (e.key === "Escape") setShowPopover(false);
          }}
        />
      </PopoverTrigger>

      <PopoverContent
        className="p-0 max-w-[260px]"
        // Prevent the input's blur from immediately closing the popover before click
        onPointerDownCapture={(e) => e.preventDefault()}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <span className="text-sidebar-foreground/70 ring-sidebar-ring flex h-8 items-center rounded-md px-2 text-xs font-medium">
          Results
        </span>

        {loading && !results.length && (
          <div className="p-2 text-sm text-gray-500">Loading...</div>
        )}

        {!loading && !results.length && (
          <div className="p-2 text-sm text-gray-500">
            No results found.
            {isCreationAllowed && !!createSearchType && query.trim() && (
              <Button
                variant="outline"
                className="mt-2 w-full"
                onClick={createAndChoose}
              >
                {`Create "${query.trim()}"`}
              </Button>
            )}
          </div>
        )}

        {!!results.length &&
          results.map((item) => (
            <div
              key={item.id}
              className="p-2 cursor-pointer hover:bg-muted text-sm font-medium"
              onClick={() => choose(item)}
            >
              {getLabel(item)}
            </div>
          ))}
      </PopoverContent>
    </Popover>
  );
}

export default SearchableInput;
