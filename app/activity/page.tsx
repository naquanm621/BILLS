import BottomNav from "@/components/BottomNav";

export default function ActivityPage() {
  return (
    <div className="max-w-md mx-auto bg-black min-h-screen pb-24 p-6">
      <h1 className="text-3xl font-bold mb-6">Activity</h1>
      <p className="text-zinc-400">View your payment history.</p>
      <BottomNav />
    </div>
  );
}