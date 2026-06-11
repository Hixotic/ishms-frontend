import React from 'react';

// ─── FULL PAGE LOADER ────────────────────────────────────────

export const FullPageLoader = ({ message = 'Loading...' }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
    <div className="flex flex-col items-center gap-4">
      {/* Animated Spinner */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-blue-600 animate-spin" />
      </div>
      {/* Loading Text */}
      <p className="text-slate-600 font-semibold text-sm">{message}</p>
    </div>
  </div>
);

// ─── INLINE SPINNER ────────────────────────────────────────

export const InlineSpinner = ({ size = 'md', color = 'blue' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
  };

  const colorClasses = {
    blue: 'border-blue-200 border-t-blue-600 border-r-blue-600',
    slate: 'border-slate-200 border-t-slate-600 border-r-slate-600',
    red: 'border-red-200 border-t-red-600 border-r-red-600',
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full border-transparent animate-spin ${colorClasses[color]}`} />
  );
};

// ─── BUTTON LOADER ────────────────────────────────────────

export const ButtonLoader = ({ isLoading, children, onClick, className = '', disabled = false }) => (
  <button
    onClick={onClick}
    disabled={isLoading || disabled}
    className={`inline-flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  >
    {isLoading ? (
      <>
        <InlineSpinner size="sm" color="blue" />
        <span>Loading...</span>
      </>
    ) : (
      children
    )}
  </button>
);

// ─── SKELETON LOADER - CARD ────────────────────────────────────────

export const SkeletonCard = () => (
  <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
    {/* Header */}
    <div className="flex items-start justify-between gap-2 mb-3">
      <div className="flex-1">
        <div className="h-5 bg-slate-200 rounded-md w-3/4 mb-2 animate-pulse" />
        <div className="h-3 bg-slate-100 rounded-md w-1/2 animate-pulse" />
      </div>
      <div className="h-6 w-16 bg-slate-200 rounded-full animate-pulse" />
    </div>

    {/* Vitals Grid */}
    <div className="grid gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-5 bg-slate-50 p-2 rounded-md mb-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="space-y-1">
          <div className="h-3 bg-slate-200 rounded-md w-1/2 animate-pulse" />
          <div className="h-4 bg-slate-200 rounded-md w-3/4 animate-pulse" />
        </div>
      ))}
    </div>

    {/* Buttons */}
    <div className="flex gap-2">
      <div className="flex-1 h-8 bg-slate-200 rounded-md animate-pulse" />
      <div className="flex-1 h-8 bg-slate-200 rounded-md animate-pulse" />
    </div>
  </div>
);

// ─── SKELETON LOADER - ALERT ────────────────────────────────────────

export const SkeletonAlert = () => (
  <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
    <div className="flex items-start gap-2">
      <div className="w-4 h-4 bg-slate-200 rounded-full flex-shrink-0 mt-0.5 animate-pulse" />
      <div className="flex-1 min-w-0">
        <div className="h-4 bg-slate-200 rounded-md w-3/4 mb-2 animate-pulse" />
        <div className="h-3 bg-slate-100 rounded-md w-full mb-1 animate-pulse" />
        <div className="h-3 bg-slate-100 rounded-md w-2/3 animate-pulse" />
      </div>
      <div className="w-4 h-4 bg-slate-200 rounded-md flex-shrink-0 animate-pulse" />
    </div>
  </div>
);

// ─── SKELETON LOADER - STAT CARD ────────────────────────────────────────

export const SkeletonStatCard = () => (
  <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
    <div className="flex items-start gap-2">
      <div className="w-10 h-10 bg-slate-200 rounded-md flex-shrink-0 animate-pulse" />
      <div className="flex-1">
        <div className="h-6 bg-slate-200 rounded-md w-1/2 mb-2 animate-pulse" />
        <div className="h-3 bg-slate-100 rounded-md w-3/4 animate-pulse" />
      </div>
    </div>
  </div>
);

// ─── SKELETON LOADER - TABLE ROW ────────────────────────────────────────

export const SkeletonTableRow = ({ columns = 4 }) => (
  <tr>
    {[...Array(columns)].map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-4 bg-slate-200 rounded-md animate-pulse" />
      </td>
    ))}
  </tr>
);

// ─── SKELETON LOADER - GRID ────────────────────────────────────────

export const SkeletonGrid = ({ count = 6, columns = 3 }) => (
  <div className={`grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns}`}>
    {[...Array(count)].map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

// ─── SKELETON LOADER - LIST ────────────────────────────────────────

export const SkeletonList = ({ count = 5 }) => (
  <div className="space-y-2">
    {[...Array(count)].map((_, i) => (
      <SkeletonAlert key={i} />
    ))}
  </div>
);

// ─── PULSE ANIMATION WRAPPER ────────────────────────────────────────

export const PulseWrapper = ({ children, isLoading = false }) => (
  <div className={isLoading ? 'opacity-50 pointer-events-none' : ''}>
    {children}
  </div>
);

// ─── LOADING OVERLAY ────────────────────────────────────────

export const LoadingOverlay = ({ isLoading = false, message = 'Loading...' }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 shadow-lg flex flex-col items-center gap-3">
        <InlineSpinner size="lg" color="blue" />
        <p className="text-slate-600 font-semibold text-sm">{message}</p>
      </div>
    </div>
  );
};

// ─── SHIMMER EFFECT ────────────────────────────────────────

export const ShimmerLoader = ({ width = 'w-full', height = 'h-4', count = 3 }) => (
  <div className="space-y-2">
    {[...Array(count)].map((_, i) => (
      <div key={i} className={`${width} ${height} bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-md animate-pulse`} />
    ))}
  </div>
);

// ─── DOTS LOADER ────────────────────────────────────────

export const DotsLoader = ({ message = 'Loading' }) => (
  <div className="flex flex-col items-center gap-3">
    <div className="flex gap-1">
      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
    </div>
    <p className="text-slate-600 font-medium text-sm">{message}</p>
  </div>
);

// ─── PROGRESS BAR ────────────────────────────────────────

export const ProgressBar = ({ progress = 0, animated = true }) => (
  <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
    <div
      className={`h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ${animated ? 'animate-pulse' : ''}`}
      style={{ width: `${Math.min(progress, 100)}%` }}
    />
  </div>
);

// ─── CIRCULAR PROGRESS ────────────────────────────────────────

export const CircularProgress = ({ progress = 0, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  };

  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={`${sizeClasses[size]} relative`}>
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="4" />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#2563eb"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-slate-900">{progress}%</span>
      </div>
    </div>
  );
};


export const WaveLoader = ({ message = 'Loading' }) => (
  <div className="flex flex-col items-center gap-3">
    <div className="flex gap-1 items-end h-8">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="w-1 bg-blue-600 rounded-full"
          style={{
            height: `${20 + i * 10}px`,
            animation: `wave 0.8s ease-in-out infinite`,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
    <p className="text-slate-600 font-medium text-sm">{message}</p>
    <style>{`
      @keyframes wave {
        0%, 100% { transform: scaleY(0.5); }
        50% { transform: scaleY(1); }
      }
    `}</style>
  </div>
);

// ─── SKELETON PATIENT DASHBOARD ────────────────────────────────────────

export const SkeletonDashboard = () => (
  <div className="min-h-screen bg-slate-50 px-3 md:px-6 lg:px-8 py-4 md:py-6">
    <div className="mx-auto w-full max-w-7xl">
      {/* Stats Cards */}
      <div className="grid gap-2 md:gap-3 grid-cols-2 md:grid-cols-4 mb-5 md:mb-6">
        {[...Array(4)].map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>

      {/* Patient Cards */}
      <div className="mb-6 md:mb-8">
        <div className="h-6 bg-slate-200 rounded-md w-1/4 mb-3 animate-pulse" />
        <SkeletonGrid count={6} columns={3} />
      </div>

      {/* Alerts and Handover */}
      <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="h-5 bg-slate-200 rounded-md w-1/3 mb-3 animate-pulse" />
          <SkeletonList count={3} />
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="h-5 bg-slate-200 rounded-md w-1/3 mb-3 animate-pulse" />
          <SkeletonList count={3} />
        </div>
      </div>
    </div>
  </div>
);
