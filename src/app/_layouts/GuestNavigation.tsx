import Link from "next/link";

export const GuestNavigation = () => (
  <nav className="hidden items-center gap-3 md:flex">
    <Link
      href="/"
      className="group relative flex items-center gap-2 overflow-hidden rounded-lg border border-white/20 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:from-blue-500/30 hover:to-indigo-500/30 hover:shadow-xl hover:shadow-blue-500/25"
    >
      <div className="absolute inset-0 translate-x-full bg-gradient-to-r from-white/0 to-white/10 transition-transform duration-500 group-hover:translate-x-0"></div>
      <svg
        className="relative z-10 h-4 w-4 transition-transform group-hover:scale-110"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
      </svg>
      <span className="relative z-10">Home</span>
    </Link>
    <a
      href="/info"
      className="group relative flex items-center gap-2 overflow-hidden rounded-lg border border-white/20 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:from-blue-500/30 hover:to-indigo-500/30 hover:shadow-xl hover:shadow-blue-500/25"
    >
      <div className="absolute inset-0 translate-x-full bg-gradient-to-r from-white/0 to-white/10 transition-transform duration-500 group-hover:translate-x-0"></div>
      <svg
        className="relative z-10 h-4 w-4 transition-transform group-hover:scale-110"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
      <span className="relative z-10">Info</span>
    </a>

    <a
      href="/faq"
      className="group relative flex items-center gap-2 overflow-hidden rounded-lg border border-white/20 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:from-blue-500/30 hover:to-indigo-500/30 hover:shadow-xl hover:shadow-blue-500/25"
    >
      <div className="absolute inset-0 translate-x-full bg-gradient-to-r from-white/0 to-white/10 transition-transform duration-500 group-hover:translate-x-0"></div>
      <svg
        className="relative z-10 h-4 w-4 transition-transform group-hover:rotate-12"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z" />
      </svg>
      <span className="relative z-10">FAQ</span>
    </a>
  </nav>
);
