'use client';

interface LoadingProps {
  text?: string;
}

export default function Loading({ text = 'Loading' }: LoadingProps) {
  return (
    <div className="fixed inset-0 bg-gray-50 bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        <div className="flex justify-center items-center space-x-2 mb-6">
          <div className="w-4 h-4 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-4 h-4 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-4 h-4 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        <p 
          className="text-gray-700 text-xl font-semibold"
          style={{ fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif' }}
        >
          {text}...
        </p>
      </div>
    </div>
  );
}