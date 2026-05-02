"use client";

import { Bill } from "@/data/bills";
import { useState } from "react";

interface BillCardProps {
  bill: Bill;
  onPay?: (bill: Bill) => void;
}

export default function BillCard({ bill, onPay }: BillCardProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = () => {
    onPay?.(bill);
    // Show tap feedback
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 200);
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full bg-zinc-900 rounded-3xl p-4 flex items-center gap-4 mb-3 transition-all active:scale-95 hover:bg-zinc-800 ${
        isPressed ? "bg-green-900/30 ring-2 ring-green-500/50" : ""
      }`}
    >
      {/* Vendor circle */}
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-bold text-white ${bill.color}`}
      >
        {bill.vendor[0]}
      </div>

      <div className="flex-1 text-left">
        <div className="flex justify-between items-baseline">
          <p className="text-lg font-semibold">{bill.vendor}</p>
          <p className="text-2xl font-bold">${bill.amount}</p>
        </div>
        <p className="text-zinc-400 text-sm">due {bill.dueDate}</p>
      </div>
    </button>
  );
}