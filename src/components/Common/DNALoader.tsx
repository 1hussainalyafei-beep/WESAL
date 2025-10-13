export function DNALoader({ message }: { message: string }) {
  return (
    <div className="relative w-24 h-24 mx-auto">
      <div className="absolute inset-0 animate-spin-slow">
        <div className="absolute top-0 left-0 w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-bounce"></div>
        <div className="absolute top-0 right-0 w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 animate-bounce" style={{ animationDelay: '0.3s' }}></div>
      </div>

      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
        <path
          d="M20,20 Q50,40 80,20"
          stroke="url(#gradient1)"
          strokeWidth="2"
          fill="none"
          className="animate-pulse"
        />
        <path
          d="M20,50 Q50,30 80,50"
          stroke="url(#gradient2)"
          strokeWidth="2"
          fill="none"
          className="animate-pulse"
          style={{ animationDelay: '0.3s' }}
        />
        <path
          d="M20,80 Q50,60 80,80"
          stroke="url(#gradient3)"
          strokeWidth="2"
          fill="none"
          className="animate-pulse"
          style={{ animationDelay: '0.6s' }}
        />
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#667eea" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#764ba2" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f093fb" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#f5576c" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4facfe" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#00f2fe" stopOpacity="0.8" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
