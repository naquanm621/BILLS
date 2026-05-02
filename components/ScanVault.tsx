// components/ScanVault.tsx
"use client";

import { Camera, Loader2 } from "lucide-react";
import { useRef, useState } from "react";

interface ScanVaultProps {
  onUploadComplete?: () => void;
}

export default function ScanVault({ onUploadComplete }: ScanVaultProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("billImage", file);

    try {
      const response = await fetch("http://localhost:3001/bills", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        onUploadComplete?.();
      } else {
        alert("Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error connecting to server");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="relative w-52 h-52 flex items-center justify-center">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,.pdf"
      />
      
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="relative w-44 h-44 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 rounded-full flex flex-col items-center justify-center shadow-2xl shadow-green-500/80 border-[10px] border-black active:scale-95 transition-all hover:brightness-110 disabled:opacity-50"
      >
        {isUploading ? (
          <Loader2 size={58} className="text-black animate-spin mb-2" />
        ) : (
          <Camera size={58} className="text-black mb-2" />
        )}
        <p className="font-black text-black text-2xl tracking-widest uppercase">
          {isUploading ? "Reading..." : "Scan Bill"}
        </p>
        <p className="text-black/70 text-xs mt-1">Tap to upload photo</p>
      </button>
    </div>
  );
}