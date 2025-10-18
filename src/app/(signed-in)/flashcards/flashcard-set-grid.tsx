import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getAllFlashcardSets,
  getFlashcardSetsByAuthor,
} from "@/utils/db/flashcards";
import { auth } from "@clerk/nextjs/server";
import { BookDashed } from "lucide-react";
import Link from "next/link";

async function FlashcardSetGrid({
  searchParams,
}: {
  searchParams: { tab: string; query?: string };
}) {
  const { userId } = await auth();

  let sets;

  if (searchParams.tab === "my-sets") {
    sets = await getFlashcardSetsByAuthor(userId!, searchParams.query || "");
  } else {
    sets = await getAllFlashcardSets(userId!, searchParams.query || "");
  }

  if (!sets.length) {
    return (
      <div className="mt-48">
        <div className="flex flex-col items-center text-gray-500 gap-2">
          <BookDashed />
          <span>No flashcard sets to display</span>
        </div>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sets.map((set) => (
        <Link href={`/flashcards/${set.id}`} key={set.id}>
          <Card className="border border-gray-200 hover:shadow-lg transition-transform hover:scale-105 p-0">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-lg text-gray-900">
                  {set.title}
                </h3>
                <Badge>{set.language_name}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{set.description}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

function FlashcardSetGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(8)].map((_, i) => (
        <Card
          key={i}
          className="border border-gray-200 hover:shadow-md transition-shadow p-0"
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-3">
              <Skeleton className="h-5 w-40" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-12" />
              </div>

              <div className="flex gap-2">
                <Skeleton className="h-8 flex-1 rounded-md" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export { FlashcardSetGrid, FlashcardSetGridSkeleton };
