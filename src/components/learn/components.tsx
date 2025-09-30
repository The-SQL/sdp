
// app/course/[id]/learn/page.tsx
"use client";

import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Video,
  Mic,
} from "lucide-react";


// Exercise Components
interface MCQOption {
  id: string;
  text: string;
}

interface MCQQuestion {
  question: string;
  options: MCQOption[];
  correctAnswer: string[];
}

interface FillBlankQuestion {
  question: string;
  correctAnswer: string[];
}

function MCQExercise({ question }: { question: MCQQuestion }) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  const isCorrect = selectedOption && question.correctAnswer.includes(selectedOption);

  return (
    <Card className="border border-gray-200">
      <CardContent className="p-4 sm:p-6">
        <h3 className="font-semibold mb-4 text-sm sm:text-base">{question.question}</h3>
        <div className="space-y-2 mb-4">
          {question.options.map((option: MCQOption) => (
            <button
              key={option.id}
              className={`w-full p-3 text-left border rounded-lg transition-colors text-sm sm:text-base ${
                selectedOption === option.id
                  ? isSubmitted
                    ? isCorrect
                      ? "border-green-500 bg-green-50"
                      : "border-red-500 bg-red-50"
                    : "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => !isSubmitted && setSelectedOption(option.id)}
              disabled={isSubmitted}
            >
              {option.text}
            </button>
          ))}
        </div>
        {isSubmitted && (
          <div className={`flex items-center gap-2 mb-4 ${isCorrect ? "text-green-600" : "text-red-600"} text-sm sm:text-base`}>
            {isCorrect ? (
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            ) : (
              <XCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
            <span>{isCorrect ? "Correct!" : `Incorrect. The correct answer is: ${question.options.find((opt: MCQOption) => opt.id === question.correctAnswer[0])?.text}`}</span>
          </div>
        )}
        {!isSubmitted && (
          <Button 
            onClick={handleSubmit}
            disabled={!selectedOption}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base"
          >
            Check Answer
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

  function FillBlankExercise({ question }: { question: FillBlankQuestion }) {
  const [answer, setAnswer] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  // Fix: Add null/undefined check and trim before comparison
  const isCorrect = question.correctAnswer.some((ans: string) => 
    ans && answer.trim().toLowerCase() === ans.trim().toLowerCase()
  );

  return (
    <Card className="border border-gray-200">
      <CardContent className="p-4 sm:p-6">
        <h3 className="font-semibold mb-4 text-sm sm:text-base">{question.question}</h3>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="flex-1 p-3 border border-gray-300 rounded-lg text-sm sm:text-base"
            placeholder="Type your answer..."
            disabled={isSubmitted}
          />
          <Button 
            onClick={handleSubmit}
            disabled={!answer.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base"
          >
            Check
          </Button>
        </div>
        {isSubmitted && (
          <div className={`flex items-center gap-2 text-sm sm:text-base ${isCorrect ? "text-green-600" : "text-red-600"}`}>
            {isCorrect ? (
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            ) : (
              <XCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
            <span>{isCorrect ? "Correct!" : `Incorrect. The correct answer is: ${question.correctAnswer[0] || ''}`}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Media Player Components
 const VideoPlayer = ({ src, title, onEnded }: { src: string; title: string; onEnded?: () => void }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="space-y-4">
      <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
        {src ? (
          <video
            src={src}
            controls
            className="w-full h-full"
            data-testid="video-lesson"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={onEnded}
          />
        ) : (
          <div className="text-center text-white">
            <Video className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 opacity-50" />
            <p className="text-sm sm:text-base">Video content not available</p>
          </div>
        )}
      </div>
    </div>
  );
};

  const AudioPlayer = ({ src, title, onEnded }: { src: string; title: string; onEnded?: () => void }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div 
        className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 sm:p-8 flex items-center justify-center min-h-[300px] sm:min-h-[400px] cursor-pointer"
        onClick={togglePlay}
      >
        {src ? (
          <div className="text-center w-full">
            <div className={`w-24 h-24 sm:w-32 sm:h-32 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 transition-all duration-200 ${
              isPlaying ? 'scale-110' : 'scale-100'
            }`}>
              {isPlaying ? (
                <Pause className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
              ) : (
                <Play className="h-8 w-8 sm:h-12 sm:w-12 text-white ml-2" />
              )}
            </div>
            <p className="text-lg sm:text-2xl font-bold text-gray-900 mb-2">{title}</p>
            <p className="text-gray-600 text-sm sm:text-base">
              {isPlaying ? 'Now Playing...' : 'Click to play'}
            </p>
            <audio
              ref={audioRef}
              src={src}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={onEnded}
              className="hidden"
            />
          </div>
        ) : (
          <div className="text-center">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Mic className="h-8 w-8 sm:h-12 sm:w-12 text-gray-500" />
            </div>
            <p className="text-base sm:text-xl text-gray-500">Audio content not available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export { MCQExercise, FillBlankExercise, VideoPlayer, AudioPlayer };