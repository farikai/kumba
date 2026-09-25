import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a1a12] text-white px-5 text-center">
      <h1 className="text-6xl font-bold text-[#00FF41] mb-4">404</h1>
      <p className="text-white/60 mb-8">This page could not be found.</p>
      <div className="flex gap-3">
        <Link href="/" className="px-6 py-3 rounded-xl bg-[#00FF41] text-black font-bold">
          Home
        </Link>
        <Link href="/app" className="px-6 py-3 rounded-xl border border-white/20 font-semibold">
          Open App
        </Link>
      </div>
    </div>
  );
}
