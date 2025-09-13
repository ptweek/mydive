export const UserNavigation = () => (
  <nav className="hidden items-center gap-3 md:flex">
    <a
      href="/dashboard"
      className="group relative flex items-center gap-2 overflow-hidden rounded-lg border border-white/20 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:from-blue-500/30 hover:to-indigo-500/30 hover:shadow-xl hover:shadow-blue-500/25"
    >
      <div className="absolute inset-0 translate-x-full bg-gradient-to-r from-white/0 to-white/10 transition-transform duration-500 group-hover:translate-x-0"></div>
      <svg
        className="relative z-10 h-4 w-4 transition-transform group-hover:scale-110"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      <span className="relative z-10">Dashboard</span>
    </a>

    <a
      href="/booking-calendar"
      className="group relative flex items-center gap-2 overflow-hidden rounded-lg border border-white/20 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:from-blue-500/30 hover:to-indigo-500/30 hover:shadow-xl hover:shadow-blue-500/25"
    >
      <div className="absolute inset-0 translate-x-full bg-gradient-to-r from-white/0 to-white/10 transition-transform duration-500 group-hover:translate-x-0"></div>
      <svg
        className="relative z-10 h-4 w-4 transition-transform group-hover:rotate-12"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
      </svg>
      <span className="relative z-10">Booking Calendar</span>
    </a>

    <a
      href="/manage-bookings"
      className="group relative flex items-center gap-2 overflow-hidden rounded-lg border border-white/20 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:from-blue-500/30 hover:to-indigo-500/30 hover:shadow-xl hover:shadow-blue-500/25"
    >
      <div className="absolute inset-0 translate-x-full bg-gradient-to-r from-white/0 to-white/10 transition-transform duration-500 group-hover:translate-x-0"></div>
      <svg
        className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-1"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
      </svg>
      <span className="relative z-10">Manage Bookings</span>
    </a>
  </nav>
);
