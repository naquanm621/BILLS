import BottomNav from "@/components/BottomNav";

export default function ScanPage() {
  return (
    <div className="max-w-md mx-auto bg-black min-h-screen pb-24 flex flex-col items-center justify-center">
      <div className="text-center">
        <div className="w-32 h-32 mx-auto bg-zinc-900 rounded-3xl flex items-center justify-center text-6xl mb-6">
          📸
        </div>
        <h1 className="text-3xl font-bold">Scan a Bill</h1>
        <p className="text-zinc-400 mt-2">Point camera at any bill</p>
      </div>
      <BottomNav />
    </div>
  );
}