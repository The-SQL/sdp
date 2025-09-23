"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Course } from "@/utils/types";
import { Dispatch, SetStateAction } from "react";

function CollaborationTab({
  courseData,
  setCourseData,
}: {
  courseData: Course;
  setCourseData: Dispatch<SetStateAction<Course>>;
}) {
    
  return (
    <div className="grid grid-cols-1 gap-8">
      <div className="space-y-6 w-full max-w-2xl mx-auto">
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle>Collaboration Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Accept Collaboration Requests
                </label>
                <p className="text-xs text-gray-500">
                  Allow others to request to contribute to your course
                </p>
              </div>
              <Switch
                checked={courseData.open_to_collab}
                onCheckedChange={(checked) =>
                  setCourseData((prev) => ({
                    ...prev,
                    open_to_collab: checked,
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>
        {/* 
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle>Invite Collaborators</CardTitle>
            <p className="text-sm text-gray-600">
              Collaborators can add and modify content
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <form
              className="flex gap-2"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!inviteEmail) return;
                setIsInviteSending(true);
                await fetch("/api/send-email", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    data: {
                      to: inviteEmail,
                      senderName: displayName,
                      courseTitle: courseData.title,
                      courseUrl: `${window.location.origin}/courses/${courseData.id}`,
                    },
                  }),
                });
                setIsInviteSending(false);
                setInviteEmail("");
              }}
            >
              <Input
                placeholder="Enter username or email"
                type="email"
                className="flex-1"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={!inviteEmail || isInviteSending}
                type="submit"
              >
                {isInviteSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Invite
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card> */}
      </div>

      <div className="space-y-6">
        {/* <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle>Current Collaborators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <span className="bg-gradient-to-br from-blue-500 to-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-white">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900">{displayName}</p>
                    <p className="text-sm text-gray-600">Course Creator</p>
                  </div>
                </div>
                <Badge className="bg-blue-100 text-blue-800">Owner</Badge>
              </div>
            </div>
          </CardContent>
        </Card> */}
        {/* <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle>Collaboration Requests</CardTitle>
            <p className="text-sm text-gray-600">
              {pendingRequests.length} pending requests
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {request.user}
                      </h4>
                      <p className="text-sm text-gray-600">{request.message}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {request.date}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Accept
                    </Button>
                    <Button variant="outline" size="sm">
                      Message
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 bg-transparent"
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
              {pendingRequests.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No collaboration requests yet</p>
                  <p className="text-sm">
                    Share your course to attract contributors
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
}

export default CollaborationTab;
