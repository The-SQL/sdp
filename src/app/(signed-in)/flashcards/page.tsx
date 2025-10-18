import { Tabs, TabsContent } from "@/components/ui/tabs";
import CreateFlashcardTab from "./create-flashcard-tab";
import FlashcardSetView from "./flashcard-set-view";
import FlashcardTabsList from "./flashcard-tabs-list";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ tab: string; query?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-white">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Flashcards</h1>
          <p className="text-gray-600">
            Master vocabulary with spaced repetition learning
          </p>
        </div>

        <Tabs defaultValue="my-sets" className="space-y-6">
          <FlashcardTabsList />

          <TabsContent value="my-sets" className="space-y-6">
            <FlashcardSetView searchParams={{ ...params }} />
          </TabsContent>

          <TabsContent value="discover" className="space-y-6">
            <FlashcardSetView searchParams={{ ...params }} />
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <CreateFlashcardTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
