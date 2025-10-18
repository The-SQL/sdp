"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { insertFlashcard } from "@/utils/db/flashcards";
import { Flashcard } from "@/utils/types";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreateFlashcardDialog({
  flashcardSetId,
}: {
  flashcardSetId: string;
}) {
  const [flashcard, setFlashcard] = useState<Flashcard>({
    front: "",
    back: "",
    flashcard_set_id: flashcardSetId,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleCreateFlashcard = async () => {
    setIsLoading(true);
    try {
      await insertFlashcard(flashcard);
      setIsOpen(false);
      router.refresh();
    } catch (err) {
      alert("Failed to create flashcard");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white ml-auto">
          Create Flashcard
        </Button>
      </DialogTrigger>
      <DialogContent className="space-y-6">
        <DialogHeader>
          <DialogTitle>Create Flashcard</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-gray-700">Front</Label>
            <Input
              placeholder="e.g., Spanish Travel Phrases"
              onChange={(e) =>
                setFlashcard({ ...flashcard, front: e.target.value })
              }
            />
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700">Back</Label>
          <Textarea
            placeholder="Describe what this flashcard set covers..."
            onChange={(e) =>
              setFlashcard({
                ...flashcard,
                back: e.target.value,
              })
            }
          />
        </div>
        <div className="flex gap-4">
          <Button
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isLoading}
            onClick={async () => await handleCreateFlashcard()}
          >
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Create Flashcard"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CreateFlashcardDialog;
