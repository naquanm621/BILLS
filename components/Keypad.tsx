"use client";

import { ChevronLeft, Delete } from "lucide-react";

interface KeypadProps {
  amount: string;
  setAmount: (val: string) => void;
  onClose: () => void;
  onPay: () => void;
}

export default function Keypad({ amount, setAmount, onClose, onPay }: KeypadProps) {
  const handlePress = (key: string) => {
    if (key === "back") {
      setAmount(amount.slice(0, -1) || "0");
    } else if (key === ".") {
      if (!amount.includes(".")) setAmount(amount + ".");
    } else {
      if (amount === "0") setAmount(key);
      else setAmount(amount + key);
    }
  };

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "back"];

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col">
      {/* Header */}
      <div className="p-6 flex items-center justify-between">
        <button onClick={onClose} className="p-2 -ml-2">
          <ChevronLeft size={32} />
        </button>
        <div className="bg-zinc-900 px-4 py-1 rounded-full text-sm font-medium">
          Cash App Style
        </div>
        <div className="w-8" />
      </div>

      {/* Amount Display */}
      <div className="flex-1 flex flex-col items-center justify-center -mt-12">
        <div className="flex items-start">
          <span className="text-4xl font-bold mt-4 mr-1">$</span>
          <span className="text-8xl font-bold tracking-tighter">{amount}</span>
        </div>
      </div>

      {/* Keypad Grid */}
      <div className="p-6 grid grid-cols-3 gap-y-8 gap-x-12 mb-8">
        {keys.map((key) => (
          <button
            key={key}
            onClick={() => handlePress(key)}
            className="flex items-center justify-center text-3xl font-semibold h-12 active:bg-zinc-800 rounded-full transition-colors"
          >
            {key === "back" ? <Delete size={28} /> : key}
          </button>
        ))}
      </div>

      {/* Footer Buttons */}
      <div className="p-6 flex gap-4 mb-4">
        <button className="flex-1 py-4 bg-zinc-900 rounded-full font-bold text-xl active:scale-95 transition-transform">
          Request
        </button>
        <button 
          onClick={onPay}
          className="flex-1 py-4 bg-green-500 text-black rounded-full font-bold text-xl active:scale-95 transition-transform"
        >
          Pay
        </button>
      </div>
    </div>
  );
}
