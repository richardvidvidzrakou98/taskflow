interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export default function Loading({ size = 'md', text = 'Loading' }: LoadingProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`flex items-center space-x-1 ${sizeClasses[size]}`}>
        <span className="text-gray-600">{text}</span>
        <div className="loading-dots text-purple-600">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
}

export function LoadingSpinner({ size = "md", text }: { size?: "sm" | "md" | "lg"; text?: string }) {
  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm", 
    lg: "text-base"
  };
  
  return (
    <div className={`flex items-center space-x-2 ${sizeClasses[size]}`}>
      {text && <span className="text-gray-600">{text}</span>}
      <div className="loading-dots text-purple-600">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
}