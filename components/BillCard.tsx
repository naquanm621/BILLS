import { Bill } from "@/data/bills";

export default function BillCard({ bill }: { bill: Bill }) {
  return (
    <div className="bg-zinc-900 rounded-3xl p-4 flex items-center gap-4 mb-3">
      {/* Vendor circle */}
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-bold text-white ${bill.color}`}
      >
        {bill.vendor[0]}
      </div>

      <div className="flex-1">
        <div className="flex justify-between items-baseline">
          <p className="text-lg font-semibold">{bill.vendor}</p>
          <p className="text-2xl font-bold">${bill.amount}</p>
        </div>
        <p className="text-zinc-400 text-sm">due {bill.dueDate}</p>
      </div>
    </div>
  );
}