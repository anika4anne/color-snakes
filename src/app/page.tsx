import Link from "next/link";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden text-white">
      {/* Flash Warning Notice */}
      <div className="absolute top-0 right-0 left-0 z-50 animate-pulse bg-red-600 px-4 py-3 text-center font-bold text-white shadow-lg">
        ⚠️ FLASH WARNING: This game contains animated content and flashing
        lights that may affect users with photosensitivity
      </div>

      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/hex.jpg)" }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      <div className="absolute inset-0 overflow-hidden">
        <div className="animate-blob absolute -top-40 -right-40 h-80 w-80 rounded-full bg-yellow-400 opacity-30 mix-blend-multiply blur-xl filter"></div>
        <div className="animate-blob animation-delay-2000 absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-pink-400 opacity-30 mix-blend-multiply blur-xl filter"></div>
        <div className="animate-blob animation-delay-4000 absolute top-40 left-40 h-80 w-80 rounded-full bg-green-400 opacity-30 mix-blend-multiply blur-xl filter"></div>
      </div>

      <div className="relative z-10 container flex flex-col items-center justify-center gap-12 px-4 py-16 text-center">
        <div className="space-y-6">
          <h1 className="bg-gradient-to-r from-yellow-300 via-green-300 to-blue-300 bg-clip-text text-6xl font-black tracking-tight text-transparent drop-shadow-2xl md:text-8xl">
            SNAKE GAME
          </h1>
        </div>

        <div className="space-y-8">
          <Link
            href="/game"
            className="group relative inline-flex items-center justify-center rounded-full bg-purple-500 px-12 py-6 text-2xl font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-purple-400 hover:shadow-purple-500/40"
          >
            <span className="relative z-10 flex items-center gap-3">
              <span className="bg-gradient-to-r from-white via-gray-100 to-gray-200 bg-clip-text text-transparent drop-shadow-lg">
                PLAY NOW
              </span>
            </span>
          </Link>
        </div>
      </div>

      <div className="absolute top-20 left-20 animate-bounce text-6xl opacity-20">
        🐍
      </div>
      <div className="animation-delay-1000 absolute right-20 bottom-20 animate-bounce text-6xl opacity-20">
        ✨
      </div>
      <div className="absolute top-1/2 left-10 animate-pulse text-4xl opacity-30">
        🎮
      </div>
      <div className="animation-delay-2000 absolute top-1/2 right-10 animate-pulse text-4xl opacity-30">
        🎯
      </div>
    </main>
  );
}
