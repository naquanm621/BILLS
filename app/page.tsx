"use client";

import BillCard from "@/components/BillCard";
import BottomNav from "@/components/BottomNav";
import QuickPayVault from "@/components/ScanVault";
import TapToPay from "@/components/TapToPay";
import { Bill } from "@/data/bills";
import { Plus, Minus, RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";

export default function Home() {
  const [billsList, setBillsList] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const totalDue = billsList.reduce((sum, bill) => sum + (bill.amount || 0), 0);

  const fetchBills = async () => {
    try {
      const res = await fetch('http://localhost:3001/bills');
      const data = await res.json();
      // Map API response to Bill format
      const mapped = data.bills?.map((b: any) => ({
        id: b.id.toString(),
        vendor: b.vendor || 'Unknown',
        amount: b.amount || 0,
        dueDate: b.due_date || 'N/A',
        color: getVendorColor(b.vendor),
      })) || [];
      setBillsList(mapped);
    } catch (err) {
      console.error('Failed to fetch bills:', err);
    } finally {
      setLoading(false);
    }
  };

  const getVendorColor = (vendor?: string) => {
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-teal-500', 'bg-indigo-500'];
    if (!vendor) return colors[0];
    return colors[vendor.charCodeAt(0) % colors.length];
  };

  useEffect(() => {
    fetchBills();
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchBills, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleUploadComplete = () => {
    fetchBills();
  };

  const handlePayBill = (bill: Bill) => {
    setSelectedBill(bill);
    setShowPayment(true);
  };

  const handlePaymentComplete = (receipt: any) => {
    // Refresh bills after payment
    fetchBills();
    // Could also show a success toast here
  };

  return (
    <div className="max-w-md mx-auto bg-black min-h-screen pb-24">
      {/* Header */}
      <div className="pt-8 pb-6 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
            $
          </div>
          <h1 className="text-3xl font-bold tracking-tighter">BiLLS</h1>
        </div>
      </div>

      {/* Balance */}
      <div className="px-6">
        <p className="text-zinc-400 text-sm uppercase tracking-widest">Total Balance Due</p>
        <p className="text-6xl font-bold text-white mt-1">${totalDue.toFixed(2)}</p>
      </div>

      {/* Quick Pay Vault Section - Cash App Style */}
      <div className="relative mt-10 px-4">
        <div className="flex items-center justify-between">
          {/* Left - Amount Label */}
          <div className="flex flex-col items-start">
            <span className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Amount</span>
            <span className="text-green-400 text-2xl font-bold">${totalDue.toFixed(0)}</span>
          </div>

          {/* Center - Big Vault Circle */}
          <div className="flex-1 flex justify-center -mx-4">
            <QuickPayVault 
              onUploadComplete={handleUploadComplete} 
              amount={totalDue > 0 ? Math.round(totalDue) : 0}
            />
          </div>

          {/* Right - Action Buttons */}
          <div className="flex flex-col gap-3">
            <button className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center hover:bg-green-400 active:scale-95 transition-all">
              <Plus size={24} className="text-black" />
            </button>
            <button 
              onClick={fetchBills}
              className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center hover:bg-zinc-700 active:scale-95 transition-all"
            >
              <RotateCcw size={20} className="text-white" />
            </button>
            <button className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center hover:bg-zinc-700 active:scale-95 transition-all">
              <Minus size={24} className="text-white" />
            </button>
          </div>
        </div>

        {/* Caption */}
        <p className="text-center text-zinc-500 text-xs mt-4 px-8">
          Tap vault to scan bill • Tap vendor below to pay
        </p>
      </div>

      {/* Upcoming Bills */}
      <div className="px-6 mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Upcoming Bills</h2>
          <span className="text-green-400 text-sm font-medium">See all →</span>
        </div>

        {loading ? (
          <p className="text-zinc-500 text-center py-8">Loading bills...</p>
        ) : billsList.length === 0 ? (
          <p className="text-zinc-500 text-center py-8">No bills yet. Tap the vault to scan!</p>
        ) : (
          billsList.map((bill) => (
            <BillCard key={bill.id} bill={bill} onPay={handlePayBill} />
          ))
        )}
      </div>

      <BottomNav />

      {/* Tap to Pay Modal */}
      {selectedBill && (
        <TapToPay
          bill={selectedBill}
          isOpen={showPayment}
          onClose={() => {
            setShowPayment(false);
            setSelectedBill(null);
          }}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
}