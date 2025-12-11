// frontend/components/Navbar.tsx
"use client";

import { Button } from "@/components/ui/button";
import { LogOut, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("See you next time!", { icon: "wave" });
    router.push("/login");
  };

  return (
    <div className="border-b bg-white/80 dark:bg-gray-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* App Name – Beautiful Gradient */}
        <div className="flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            JobTrack AI
          </h1>
        </div>

        {/* Clean Sign Out Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}