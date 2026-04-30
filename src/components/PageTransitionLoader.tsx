'use client';

import { usePageTransition } from './PageTransitionContext';

export default function PageTransitionLoader() {
  const { isLoading } = usePageTransition();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-12 h-12 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-sm text-blue-600 font-medium animate-pulse">Loading...</p>
      </div>
    </div>
  );
}
