// components/LoadingScreen.jsx
import { useEffect, useState } from 'react';

const LoadingScreen = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => onLoadingComplete(), 500);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [onLoadingComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-900 via-black to-blue-900">
      <div className="text-center">
        {/* Animated Logo/Icon */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div className="absolute inset-0 border-4 border-purple-500 rounded-full animate-ping opacity-75"></div>
          <div className="absolute inset-0 border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full animate-pulse"></div>
          <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-2xl">
            {progress}%
          </div>
        </div>

        {/* Loading Text with animation */}
        <div className="space-y-2">
          <div className="h-8 overflow-hidden">
            <div className="animate-slide-up">
              <p className="text-white text-xl font-semibold">
                {progress < 30 && "Loading amazing content..."}
                {progress >= 30 && progress < 60 && "Almost there..."}
                {progress >= 60 && progress < 90 && "Getting things ready..."}
                {progress >= 90 && "Ready to go! 🚀"}
              </p>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-64 h-1 bg-gray-700 rounded-full overflow-hidden mx-auto">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;