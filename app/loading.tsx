import Image from 'next/image'

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-b from-[#f2f9f5] via-[#fbfdfc] to-[#eaf6ef]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col items-center relative z-10 px-6 text-center">
        {/* Logo */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 mb-5 drop-shadow-[0_12px_24px_rgba(0,155,85,0.18)] animate-pulse">
          <Image
            src="/icon.svg"
            alt="AgriRent Logo"
            fill
            priority
            className="object-contain"
          />
        </div>

        {/* Brand Name */}
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-950 mb-1.5">
          Agri<span className="text-[#009b55]">Rent</span>
        </h1>

        {/* Tagline */}
        <p className="text-xs sm:text-sm text-gray-500 font-medium tracking-wide">
          India's Smart Equipment Rental Marketplace
        </p>

        {/* Animated Loading Bar */}
        <div className="w-36 h-1 bg-emerald-100 rounded-full overflow-hidden mt-6 relative">
          <div className="w-1/2 h-full bg-[#009b55] rounded-full animate-[shimmer_1.2s_infinite_linear] bg-gradient-to-r from-transparent via-[#009b55] to-transparent" />
        </div>
      </div>
    </div>
  )
}
