import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function GlassCard({ children, className = "", hover = false }: GlassCardProps) {
  return (
    <div
      className={`glass p-6 ${hover ? "hover:bg-white/20 transition-all hover:-translate-y-1 hover:shadow-lg cursor-pointer" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
