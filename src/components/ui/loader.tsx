"use client";

export default function Loader() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/30 backdrop-blur-sm">
      <div className="flex gap-3">
        <span className="block w-4 h-4 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></span>
        <span className="block w-4 h-4 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></span>
        <span className="block w-4 h-4 rounded-full bg-primary animate-bounce"></span>
      </div>
    </div>
  )
}
