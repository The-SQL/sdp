import {
  getFlashcardsBySetId,
  getFlashcardSetById,
} from "@/utils/db/flashcards";
import { BookDashed } from "lucide-react";
import FlashcardViewer from "../flashcard-viewer";
import CreateFlashcardDialog from "./create-flashcard-dialog";

async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const flashcardSet = await getFlashcardSetById(id);
  const flashcards = await getFlashcardsBySetId(id);

  if (!flashcardSet) {
    return (
      <div className="mt-48">
        <div className="flex flex-col items-center text-gray-500 gap-2">
          <BookDashed />
          <span>No flashcard set to display</span>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen">
      <div className="p-8">
        <div className="mb-8 flex">
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {flashcardSet.title}
            </h1>
            <p className="text-gray-600">{flashcardSet.description}</p>
          </div>
          <CreateFlashcardDialog flashcardSetId={id} />
        </div>
        <div>
          <FlashcardViewer flashcards={flashcards} />
        </div>
      </div>
    </div>
  );
}

export default Page;
