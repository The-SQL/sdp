"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Flashcard as FlashcardType } from "@/utils/types";

import {
  Badge,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Volume2,
} from "lucide-react";
import { useEffect, useState } from "react";

function FlashcardViewer({ flashcards }: { flashcards: FlashcardType[] }) {
  const [currentFlashcard, setCurrentFlashcard] = useState<FlashcardType>(
    flashcards[0]
  );
  const [currentCard, setCurrentCard] = useState<number>(0);
  const [showAnswer, setShowAnswer] = useState(false);
  useEffect(() => {
    if (!flashcards.length) return;

    setCurrentFlashcard(flashcards[currentCard]);
  }, [currentCard]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <Progress
          value={Math.round(((currentCard + 1) / flashcards.length) * 100)}
          className="flex-1"
        />
        <span className="text-sm text-gray-600">
          {currentCard + 1} of {flashcards.length} cards
        </span>
      </div>

      <div className="mx-auto flex flex-col w-full items-center">
        <div
          className="w-full max-w-md h-80 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl shadow-lg cursor-pointer transition-all hover:scale-105 hover:shadow-xl flex flex-col items-center justify-center"
          onClick={() => setShowAnswer(!showAnswer)}
        >
          {!showAnswer ? (
            <div className="text-center p-8">
              <div className="text-5xl font-bold text-gray-900 mb-4">
                {currentFlashcard.front}
              </div>
              <div className="text-gray-400 text-sm">
                Click to reveal answer
              </div>
            </div>
          ) : (
            <div className="text-center p-8">
              <div className="text-4xl font-bold text-blue-600 mb-3">
                {currentFlashcard.back}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4 mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentCard(Math.max(0, currentCard - 1))}
            disabled={currentCard === 0}
          >
            <ChevronLeft />
          </Button>
          <Button variant="outline" onClick={() => setShowAnswer(false)}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Card
          </Button>
          <Button
            onClick={() => {
              setShowAnswer(false);
              setCurrentCard((currentCard + 1) % flashcards.length);
            }}
            disabled={currentCard === flashcards.length - 1}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default FlashcardViewer;
