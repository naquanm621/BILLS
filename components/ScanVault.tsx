"use client";

import { DollarSign, Loader2 } from "lucide-react";
import { useRef, useState } from "react";

interface QuickPayVaultProps {
  onUploadComplete?: () => void;
  amount?: number;
}

export default function QuickPayVault({ onUploadComplete, amount = 0 }: QuickPayVaultProps) {
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
    <div className="relative flex items-center justify-center">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,.pdf"
      />
      
      {/* Outer glow ring */}
      <div className="absolute w-64 h-64 rounded-full bg-green-500/20 blur-xl" />
      
      {/* Main vault button */}
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="relative w-56 h-56 bg-gradient-to-br from-green-400 via-emerald-500 to-green-600 rounded-full flex flex-col items-center justify-center shadow-2xl shadow-green-500/60 border-4 border-green-300/30 active:scale-95 transition-all hover:brightness-110 disabled:opacity-50"
      >
        {isUploading ? (
          <Loader2 size={48} className="text-black animate-spin mb-2" />
        ) : (
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-3">
            <DollarSign size={36} className="text-green-400" />
          </div>
        )}
        
        {/* Amount display */}
        {!isUploading && amount > 0 && (
          <p className="text-4xl font-bold text-black mb-1">${amount}</p>
        )}
        
        {/* Label */}
        <p className="font-black text-green-900 text-lg tracking-widest uppercase">
          {isUploading ? "Scanning..." : "Scan Bill"}
        </p>
        
        <p className="text-green-800/70 text-xs mt-1 font-medium">
          Tap to upload
        </p>
      </button>
    </div>
  );
}