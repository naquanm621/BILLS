import BottomNav from "@/components/BottomNav";

export default function WalletPage() {
  return (
    <div className="max-w-md mx-auto bg-black min-h-screen pb-24 p-6">
      <h1 className="text-3xl font-bold mb-6">Wallet</h1>
      <p className="text-zinc-400">Connected accounts & payment methods.</p>
      <BottomNav />
    </div>
  );
}