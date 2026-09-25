"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a1a12] text-white px-5 text-center">
      <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
      <p className="text-white/60 mb-8">Please try again.</p>
      <button onClick={reset} className="px-6 py-3 rounded-xl bg-[#00FF41] text-black font-bold">
        Try again
      </button>
    </div>
  );
}
