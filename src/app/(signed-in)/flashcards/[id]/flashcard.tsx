" use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flashcard as FlashcardType } from "@/utils/types";
import { Progress } from "@radix-ui/react-progress";
import { Badge, RotateCcw, Volume2 } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";

function Flashcard({
  currentFlashcard,
  currentCard,
  setCurrentCard,
}: {
  currentFlashcard: FlashcardType;
  currentCard: number;
  setCurrentCard: Dispatch<SetStateAction<number>>;
}) {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <Card className="min-h-[500px] border border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Spanish Basics - Greetings</CardTitle>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-800">Beginner</Badge>
            <Button variant="outline" size="sm">
              <Volume2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Progress value={32} className="flex-1" />
          <span className="text-sm text-gray-600">8 of 25 cards</span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center">
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
            ← Previous
          </Button>
          <Button variant="outline" onClick={() => setShowAnswer(false)}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Card
          </Button>
          <Button
            onClick={() => {
              setShowAnswer(false);
              setCurrentCard(currentCard + 1);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Skip →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default Flashcard;
