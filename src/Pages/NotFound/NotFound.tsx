import React, { useRef, useEffect } from 'react';
import ChromeDinoGame from 'react-chrome-dino';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/Components/LandingNav';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const gameContainerRef = useRef<HTMLDivElement>(null);

  const handleBackClick = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  useEffect(() => {
    // Mute all audio on the page
    const audioContext = new AudioContext();
    audioContext.suspend();

    if (gameContainerRef.current) {
      const existingGames = gameContainerRef.current.getElementsByClassName('runner-container');
      if (existingGames.length > 1) {
        for (let i = 1; i < existingGames.length; i++) {
          existingGames[i].remove();
        }
      }
    }

    return () => {
      audioContext.suspend();
    };
  }, []);

  return (
    <div className="w-screen h-screen bg-background">
      <div className="mx-20">
        <Navbar showButtons={true}/>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-120px)]">
          <div className="w-full max-w-2xl">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-lingrad via-lingrad2 to-lingrad3 bg-clip-text text-transparent mb-4">404</h1>
            <p className="text-xl text-gray-300 mb-8">
              It looks like you're lost.
            </p>
            
            <div ref={gameContainerRef} className="w-full mb-8 bg-background-contrast rounded-lg shadow-lg shadow-shadow-box p-4 overflow-hidden h-[300px]">
              <ChromeDinoGame />
            </div>

            <button
              onClick={handleBackClick}
              className="bg-gradient-to-r from-lingrad via-lingrad2 to-lingrad3 text-white px-6 py-3 rounded-lg
                       transition-colors duration-200 font-semibold shadow-md hover:opacity-90"
            >
              Get Back on Track
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;