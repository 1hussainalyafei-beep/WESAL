import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [typedText, setTypedText] = useState('');
  const [showButton, setShowButton] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const fullText = 'حياة آمنة صحية لأبطال المستقبل';

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setTypedText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
        setShowButton(true);
      }
    }, 100);

    return () => clearInterval(timer);
  }, []);

  const handleClick = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onGetStarted();
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: '#5B4B9D' }}>
      {isAnimating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: '#5B4B9D' }}>
          <div className="animate-zoom-circle w-32 h-32 rounded-full bg-white"></div>
        </div>
      )}

      <div className="text-center px-6 relative z-10 page-transition">
        <div className="flex items-center justify-center gap-4 mb-12">
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center">
            <Heart className="w-10 h-10" style={{ color: '#FFB6D9' }} fill="#FFB6D9" />
          </div>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
          أهلاً وسهلاً بك في <span style={{ color: '#FFB6D9' }}>وصال</span>
        </h1>

        <p className="text-2xl md:text-3xl text-white mb-12 min-h-[3rem]">
          {typedText.split(' ').map((word, index) => (
            <span key={index}>
              {word === 'صحية' ? (
                <span style={{ color: '#FFB6D9' }}>{word} </span>
              ) : (
                <span>{word} </span>
              )}
            </span>
          ))}
          <span className="animate-pulse">|</span>
        </p>

        {showButton && (
          <button
            onClick={handleClick}
            disabled={isAnimating}
            className="px-12 py-4 rounded-xl text-xl font-bold text-white animate-fade-in-up"
            style={{ backgroundColor: '#FFB6D9', color: '#5B4B9D' }}
          >
            هيا بنا
          </button>
        )}
      </div>

      <style>{`
        @keyframes zoom-circle {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(100);
            opacity: 1;
          }
        }

        .animate-zoom-circle {
          animation: zoom-circle 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
