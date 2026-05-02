// app/page.tsx
"use client";

import { useState, useEffect } from "react";
import VendorBubble from "@/components/VendorBubble";
import ScanVault from "@/components/ScanVault";
import BillCard from "@/components/BillCard";
import BottomNav from "@/components/BottomNav";
import Keypad from "@/components/Keypad";

export interface Bill {
  id: number;
  vendor: string | null;
  amount: number | null;
  due_date: string | null;
  status: string;
}

export default function BiLLSHome() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [highlighted, setHighlighted] = useState<number | null>(null);
  const [payingBill, setPayingBill] = useState<Bill | null>(null);
  const [payAmount, setPayAmount] = useState("0");

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const res = await fetch("http://localhost:3001/bills");
      const data = await res.json();
      if (data.success) {
        setBills(data.bills);
      }
    } catch (err) {
      console.error("Failed to fetch bills:", err);
    }
  };

  const handlePay = async () => {
    if (!payingBill) return;
    
    try {
      const response = await fetch(`http://localhost:3001/bills/${payingBill.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "paid" }),
      });

      if (response.ok) {
        setPayingBill(null);
        fetchBills(); // Refresh the list
      } else {
        alert("Payment failed");
      }
    } catch (error) {
      console.error("Payment error:", error);
    }
  };

  // Filter out paid bills and only show the 4 most recent
  const activeBills = bills.filter(b => b.status !== 'paid').slice(0, 4);
  const totalDue = bills.filter(b => b.status !== 'paid').reduce((sum, bill) => sum + (bill.amount || 0), 0);

  const openPayment = (bill: Bill) => {
    setPayingBill(bill);
    setPayAmount((bill.amount || 0).toString());
  };

  return (
    <div className="min-h-screen bg-black text-white pb-24 relative overflow-hidden">
      {payingBill && (
        <Keypad 
          amount={payAmount} 
          setAmount={setPayAmount} 
          onClose={() => setPayingBill(null)} 
          onPay={handlePay}
        />
      )}

      {/* Header */}
      <div className="pt-8 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-green-500 rounded-2xl flex items-center justify-center text-black font-bold text-2xl">$</div>
          <h1 className="text-3xl font-bold tracking-tighter">BiLLS</h1>
        </div>
      </div>

      {/* Balance */}
      <div className="px-6 text-center mt-6">
        <p className="text-zinc-400 text-sm uppercase tracking-widest">TOTAL DUE THIS MONTH</p>
        <p className="text-7xl font-bold mt-1 tracking-tighter">${totalDue.toFixed(2)}</p>
        <p className="text-green-400 mt-1">{bills.filter(b => b.status !== 'paid').length} active bills</p>
      </div>

      {/* Scan Vault + Floating Vendor Bubbles */}
      <div className="relative h-[420px] flex items-center justify-center mt-6">
        <ScanVault onUploadComplete={fetchBills} />

        {/* Floating Vendor Bubbles */}
        {activeBills.map((bill, index) => (
          <div key={bill.id} onClick={() => openPayment(bill)}>
            <VendorBubble
              vendor={bill.status === 'processing' ? "Scanning..." : (bill.vendor || "Unknown")}
              amount={bill.amount || 0}
              dueDate={bill.due_date || "TBD"}
              color={index % 2 === 0 ? "bg-red-500" : "bg-blue-500"}
              isHighlighted={highlighted === bill.id}
              onMouseEnter={() => setHighlighted(bill.id)}
              onMouseLeave={() => setHighlighted(null)}
              index={index}
            />
          </div>
        ))}
      </div>

      {/* Upcoming Bills List */}
      <div className="px-6 mt-4">
        <div className="flex justify-between mb-4">
          <h2 className="text-2xl font-semibold">Upcoming Bills</h2>
          <span className="text-green-400 text-sm">See all →</span>
        </div>
        <div className="space-y-3">
          {activeBills.map((bill) => (
            <div key={bill.id} onClick={() => openPayment(bill)}>
              <BillCard bill={{
                id: bill.id,
                vendor: bill.vendor || "Processing...",
                amount: bill.amount || 0,
                dueDate: bill.due_date || "N/A",
                color: bill.id % 2 === 0 ? "bg-red-500" : "bg-blue-500"
              }} />
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
