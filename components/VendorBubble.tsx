// components/VendorBubble.tsx
"use client";

interface VendorBubbleProps {
  vendor: string;
  amount: number;
  dueDate: string;
  color: string;
  isHighlighted?: boolean;
  index: number;
}

export default function VendorBubble({ 
  vendor, 
  amount, 
  dueDate, 
  color, 
  isHighlighted = false,
  index
}: VendorBubbleProps) {
  // Circular positioning for 4 bubbles (360 / 4 = 90 degrees)
  const angle = (index * 90) * (Math.PI / 180); 
  const radius = 135; 
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;

  // Stagger the animation so they don't move in perfect sync
  const animationDelay = `${index * 0.5}s`;

  return (
    <div
      className={`absolute w-24 h-24 rounded-3xl flex flex-col items-center justify-center transition-all duration-500 cursor-pointer z-10 
        backdrop-blur-xl bg-white/10 border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.8)]
        hover:scale-110 hover:bg-white/20 hover:border-white/40 animate-float
        ${isHighlighted ? 'scale-110 ring-2 ring-green-400 border-transparent shadow-green-500/20' : ''}`}
      style={{ 
        left: `calc(50% + ${x}px - 3rem)`,
        top: `calc(50% + ${y}px - 3rem)`,
        animationDelay: animationDelay
      }}
    >
      {/* Icon with glowing background */}
      <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-[0_0_20px_rgba(255,255,255,0.2)] mb-1`}>
        {vendor[0]}
      </div>
      
      <div className="flex flex-col items-center">
        <span className="text-[10px] font-bold text-white/90 uppercase tracking-tighter leading-none">{vendor}</span>
        <span className="text-sm font-black text-green-400 tracking-tighter mt-0.5">${amount}</span>
      </div>

      {/* Glass shine effect overlay */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
    </div>
  );
}