import { Button } from "@/components/ui/button";
import {
  addCollaborator,
  cancelCollaboration,
  getCourseCollaborator,
} from "@/utils/db/collaboration";
import { CollaboratorStatus } from "@/utils/types";
import { useUser } from "@clerk/nextjs";
import clsx from "clsx";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

function CollaborateButton({
  courseId,
  authorId,
  openToCollab,
}: {
  courseId: string;
  authorId: string;
  openToCollab: boolean;
}) {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [collaborationStatus, setCollaborationStatus] = useState<
    CollaboratorStatus | "none"
  >("none");

  const handleCollaborate = async () => {
    if (user) {
      try {
        setLoading(true);
        await addCollaborator(courseId, user.id, "pending");
        setCollaborationStatus("pending");
        alert("Collaboration request sent!");
      } catch (err) {
        alert("Error sending collaboration request.");
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    async function fetchCollaborationStatus() {
      if (user) {
        try {
          const data = await getCourseCollaborator(courseId, user.id);
          if (data) {
            setCollaborationStatus(data.status);
          } else {
            setCollaborationStatus("none");
          }
        } catch (err) {
          console.error("Error fetching collaboration status:", err);
        }
      }
    }
    fetchCollaborationStatus();
  }, []);

  useEffect(() => {
    setIsVisible(authorId !== user?.id && openToCollab);
  }, [authorId, user]);

  if (collaborationStatus === "active") {
    return (
      <Button
        variant={"destructive"}
        disabled={loading}
        className="w-full"
        onClick={async () => {
          if (!user) return;
          try {
            setLoading(true);
            await cancelCollaboration(courseId, user.id);
            alert("Collaboration cancelled.");
          } catch (err) {
            alert("Error cancelling collaboration.");
          } finally {
            setLoading(false);
          }
        }}
      >
        {loading ? <Loader2 className="animate-spin" /> : "Stop Collaboration"}
      </Button>
    );
  }

  if (collaborationStatus === "pending") {
    return (
      <Button variant={"secondary"} disabled={true} className="w-full">
        Waiting for Response
      </Button>
    );
  }

    if (collaborationStatus === "rejected") {
    return (
      <Button variant={"secondary"} disabled={true} className="w-full">
        Request was Rejected
      </Button>
    );
  }

  return (
    <Button
      onClick={handleCollaborate}
      disabled={loading}
      className={clsx("w-full", { flex: isVisible }, { hidden: !isVisible })}
    >
      {loading ? <Loader2 className="animate-spin" /> : "Collaborate"}
    </Button>
  );
}

export default CollaborateButton;
