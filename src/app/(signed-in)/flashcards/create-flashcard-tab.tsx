"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import SearchableInput from "@/components/ui/searchable-input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { insertFlashcardSet } from "@/utils/db/flashcards";
import { createLanguage } from "@/utils/db/languages";
import { createClient } from "@/utils/supabase/client";
import { FlashcardSet, Language } from "@/utils/types";
import { useUser } from "@clerk/nextjs";
import { PostgrestError } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";

import { useState } from "react";

function CreateFlashcardTab() {
  const { user } = useUser();
  const [flashcardSet, setFlashcardSet] = useState<FlashcardSet>({
    title: "",
    language_id: "",
    language_name: "",
    description: "",
    visibility: "private",
  });
  const [isLoading, setIsLoading] = useState(false);
  async function handleCreateSet() {
    if (!user) return;

    const flashcardToCreate = {
      ...flashcardSet,
      author_id: user.id,
    };

    console.log("Creating flashcard set:", flashcardToCreate);

    try {
      setIsLoading(true);
      await insertFlashcardSet(flashcardToCreate);
    } catch (err) {
      console.error("Error creating flashcard set:", err);
    } finally {
      setIsLoading(false);
    }
  }

  const searchLanguages = async (
    query: string
  ): Promise<{ data: Language[]; error: PostgrestError | null }> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("languages")
      .select("id, name")
      .ilike("name", `%${query}%`);
    return { data: data ?? [], error };
  };

  return (
    <Card className="max-w-2xl mx-auto border border-gray-200">
      <CardHeader>
        <CardTitle>Create New Flashcard Set</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Set Title
            </label>
            <Input
              placeholder="e.g., Spanish Travel Phrases"
              onChange={(e) =>
                setFlashcardSet({ ...flashcardSet, title: e.target.value })
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Language
            </label>
            <SearchableInput<Language>
              dbCall={searchLanguages}
              selected={
                flashcardSet.language_id && flashcardSet.language_name
                  ? {
                      id: flashcardSet.language_id,
                      name: flashcardSet.language_name,
                    }
                  : null
              }
              onSelect={(lang) => {
                setFlashcardSet((p) => ({
                  ...p,
                  language_id: lang.id,
                  language_name: lang.name,
                }));
              }}
              isCreationAllowed
              createSearchType={createLanguage}
              placeholder="Enter language..."
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Visibility
            </label>
            <Select
              onValueChange={(value) =>
                setFlashcardSet({
                  ...flashcardSet,
                  visibility: value as "private" | "public",
                })
              }
              value={flashcardSet.visibility}
            >
              <SelectTrigger>
                <SelectValue placeholder="Who can see this?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private (Only me)</SelectItem>
                <SelectItem value="public">Public (Everyone)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">
            Description
          </label>
          <Textarea
            placeholder="Describe what this flashcard set covers..."
            onChange={(e) =>
              setFlashcardSet({ ...flashcardSet, description: e.target.value })
            }
          />
        </div>
        <div className="flex gap-4">
          <Button
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isLoading}
            onClick={async () => await handleCreateSet()}
          >
            {isLoading ? <Loader2 className="animate-spin" /> : "Create Set"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default CreateFlashcardTab;
