import BillCard from "@/components/BillCard";
import BottomNav from "@/components/BottomNav";
import { bills } from "@/data/bills";
import { Plus } from "lucide-react";

export default function Home() {
  const totalDue = bills.reduce((sum, bill) => sum + bill.amount, 0);

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

      {/* Quick Scan Button */}
      <div className="px-6 mt-8 flex justify-center">
        <button className="bg-green-500 hover:bg-green-600 w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl shadow-green-500/50 active:scale-95 transition-all">
          <Plus size={40} className="text-black" />
        </button>
      </div>

      {/* Upcoming Bills */}
      <div className="px-6 mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Upcoming Bills</h2>
          <span className="text-green-400 text-sm font-medium">See all →</span>
        </div>

        {bills.map((bill) => (
          <BillCard key={bill.id} bill={bill} />
        ))}
      </div>

      <BottomNav />
    </div>
  );
}