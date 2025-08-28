import { LoaderCircle } from "lucide-react";

function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoaderCircle className="animate-spin" />
    </div>
  );
}

export default Loading;
