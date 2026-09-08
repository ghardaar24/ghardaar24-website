import { Loader2 } from "lucide-react";

// Sits inside AdminLayout's content area during route transitions.
export default function AdminLoading() {
  return (
    <div className="flex items-center justify-center py-24 text-gray-400">
      <Loader2 className="w-8 h-8 animate-spin" />
    </div>
  );
}
