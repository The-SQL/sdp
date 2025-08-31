"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";

function PublishTab({
  publishCourse,
}: {
  publishCourse: (state: string) => Promise<void>;
}) {
  const [state, setState] = useState("draft");
  const [isPublishing, setIsPublishing] = useState(false);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle>Publish Your Course</CardTitle>
          <p className="text-sm text-gray-600">
            Review your course before making it available to students
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border-t pt-6">
            <h4 className="font-medium text-gray-900 mb-4">
              Publishing Options
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="publish"
                  id="draft"
                  className="text-blue-600"
                  checked={state === "draft"}
                  onChange={() => setState("draft")}
                />
                <label htmlFor="draft" className="flex-1">
                  <div className="font-medium text-gray-900">Save as Draft</div>
                  <div className="text-sm text-gray-600">
                    Continue working on your course privately
                  </div>
                </label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="publish"
                  id="unlisted"
                  className="text-blue-600"
                  checked={state === "unlisted"}
                  onChange={() => setState("unlisted")}
                />
                <label htmlFor="unlisted" className="flex-1">
                  <div className="font-medium text-gray-900">
                    Publish as Unlisted
                  </div>
                  <div className="text-sm text-gray-600">
                    Only accessible via direct link
                  </div>
                </label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="publish"
                  id="public"
                  className="text-blue-600"
                  checked={state === "public"}
                  onChange={() => setState("public")}
                />
                <label htmlFor="public" className="flex-1">
                  <div className="font-medium text-gray-900">
                    Publish Publicly
                  </div>
                  <div className="text-sm text-gray-600">
                    Make discoverable to all users
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              disabled={isPublishing}
              onClick={() => {
                setIsPublishing(true);

                publishCourse(state);
                
                setIsPublishing(false);
              }}
            >
              {isPublishing ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                "Publish Course"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PublishTab;
