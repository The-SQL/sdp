import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Review } from "@/utils/types";
import clsx from "clsx";
import { Loader2, Star } from "lucide-react";
import { useState } from "react";
import { insertReview } from "@/utils/db/reviews";
import { useUser } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";

function CourseRatingDialog() {
  const [review, setReview] = useState<Review>({
    user_id: "",
    course_id: "",
    rating: 1,
    comment: "",
  });
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUser();
  const router = useRouter();
  const params = useParams();

  const handleStarClick = (rating: number) => {
    if (review) {
      setReview({ ...review, rating });
    }
  };

  const handleSubmit = async () => {
    // Implement the logic to submit the review to the database
    console.log("Submitting review:", review);

    try {
      if (!user) return;

      setIsSubmitting(true);
      const reviewToInsert = {
        ...review,
        user_id: user.id,
        course_id: params.id as string,
      };
      await insertReview(reviewToInsert);
      setOpen(false);
      router.refresh();
    } catch (err) {
      console.error("Failed to submit review:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Write a Review</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
        </DialogHeader>
        <Textarea
          placeholder="Write your review here..."
          onChange={(e) =>
            setReview({ ...review, comment: e.target.value.trim() })
          }
        />
        <div className="grid grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              fill="currentColor"
              key={index}
              className={clsx(
                "cursor-pointer",
                review.rating >= index + 1 ? "text-yellow-400" : "text-gray-300"
              )}
              onClick={() => handleStarClick(index + 1)}
            />
          ))}
        </div>
        <Button
          type="submit"
          className="mt-4"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin" />
          ) : (
            "Submit Review"
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export default CourseRatingDialog;
