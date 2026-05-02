"use client";

import BottomNav from "@/components/BottomNav";
import ScanVault from "@/components/ScanVault";

export default function ScanPage() {
  const handleUploadComplete = () => {
    // Optionally refresh bills or show success message
    window.location.href = "/";
  };

  return (
    <div className="max-w-md mx-auto bg-black min-h-screen pb-24 flex flex-col items-center justify-center">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Scan a Bill</h1>
        <p className="text-zinc-400 mt-2">Tap to upload a bill photo</p>
      </div>

      <ScanVault onUploadComplete={handleUploadComplete} />

      <BottomNav />
    </div>
  );
}