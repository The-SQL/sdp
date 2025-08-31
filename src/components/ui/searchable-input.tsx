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

  /** Called when the user selects (or creates) an item */
  onSelect: (item: TItem) => void;

  /** Optional currently selected item to show in the input */
  selected?: TItem | null;

  /** Allow creating a new item if no results match */
  isCreationAllowed?: boolean;

  /** Function to create the item, required if `isCreationAllowed` */
  createSearchType?: (name: string) => Promise<TItem>;

  /** Input placeholder */
  placeholder?: string;

  /** Transform how an item is displayed */
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
  const inputRef = useRef<HTMLInputElement>(null);

  // local input text; default to selected name, but allow editing
  const [query, setQuery] = useState(selected ? getLabel(selected) : "");
  const [debouncedQuery] = useDebounce(query, 300);

  const [results, setResults] = useState<TItem[]>([]);
  const [loading, setLoading] = useState(false);

  // keep input in sync if parent changes selected
  useEffect(() => {
    if (selected) setQuery(getLabel(selected));
  }, [selected, getLabel]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setShowPopover(false);
      return;
    }
    const run = async () => {
      setLoading(true);
      const { data, error } = await dbCall(debouncedQuery);
      setResults(!error && data ? data : []);
      setLoading(false);
      setShowPopover(true);
    };
    run();
  }, [debouncedQuery, dbCall]);

  const choose = (item: TItem) => {
    onSelect(item);
    if (clearOnSelect) {
      setQuery("");
      setShowPopover(false);
      setResults([]);
    } else {
      setQuery(getLabel(item));
      setShowPopover(false);
    }
  };

  const createAndChoose = async () => {
    if (!createSearchType) return;
    const item = await createSearchType(query.trim());
    if (item) choose(item);
  };

  return (
    <Popover
      open={showPopover}
      onOpenChange={debouncedQuery ? setShowPopover : () => {}}
    >
      <PopoverTrigger asChild>
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onFocus={() => results.length && setShowPopover(true)}
          onChange={(e) => setQuery(e.target.value)}
        />
      </PopoverTrigger>

      <PopoverContent
        className="p-0 max-w-[260px]"
        onOpenAutoFocus={(e) => e.preventDefault()}
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
