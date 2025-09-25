import { Button } from "@/components/ui/button";
import { addCollaborator } from "@/utils/db/client";
import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { useState } from "react";

function CollaborateButton({ courseId }: { courseId: string }) {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  const handleCollaborate = async () => {
    if (user) {
      try {
        setLoading(true);
        await addCollaborator(courseId, user.id, "pending");
        alert("Collaboration request sent!");
      } catch (err) {
        alert("Error sending collaboration request.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Button onClick={handleCollaborate} disabled={loading}>
      {loading ? <Loader2 className="animate-spin" /> : "Collaborate"}
    </Button>
  );
}

export default CollaborateButton;
