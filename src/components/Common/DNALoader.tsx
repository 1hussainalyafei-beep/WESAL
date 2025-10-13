export function DNALoader({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center page-transition" style={{ backgroundColor: '#F5F5F5' }}>
      <div className="card text-center max-w-md p-8">
        <div className="flex justify-center mb-6">
          <div className="dna-loader"></div>
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: '#5B4B9D' }}>
          {message}
        </h2>
        <p style={{ color: '#9E9E9E' }}>
          الذكاء الاصطناعي يعمل على تحليل بياناتك...
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#5B4B9D', animationDelay: '0s' }}></div>
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#FFB6D9', animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#A8C7E7', animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
}
