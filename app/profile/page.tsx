import BottomNav from "@/components/BottomNav";

export default function ProfilePage() {
  return (
    <div className="max-w-md mx-auto bg-black min-h-screen pb-24 p-6">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      <p className="text-zinc-400">Manage your account settings.</p>
      <BottomNav />
    </div>
  );
}