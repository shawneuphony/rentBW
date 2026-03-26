// app/components/ui/SimpleHousingAnimation.js
'use client';

import { useState, useEffect } from 'react';

export default function SimpleHousingAnimation() {
  const [windowLights, setWindowLights] = useState([true, false, true, false]);
  const [doorPosition, setDoorPosition] = useState(0);
  const [smokeParticles, setSmokeParticles] = useState([]);

  // Animate window lights (random flicker)
  useEffect(() => {
    const interval = setInterval(() => {
      setWindowLights(prev => 
        prev.map(() => Math.random() > 0.3)
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Animate door (opens on hover)
  const handleMouseEnter = () => {
    setDoorPosition(10);
  };

  const handleMouseLeave = () => {
    setDoorPosition(0);
  };

  // Create smoke particles
  useEffect(() => {
    const particles = [];
    for (let i = 0; i < 20; i++) {
      particles.push({
        id: i,
        x: 120 + Math.random() * 10,
        y: 80 - i * 5,
        size: 5 + i * 0.5,
        opacity: 0.8 - i * 0.04,
        speed: 0.2 + Math.random() * 0.3
      });
    }
    setSmokeParticles(particles);

    // Animate smoke
    const animate = setInterval(() => {
      setSmokeParticles(prev => 
        prev.map(p => ({
          ...p,
          y: p.y - p.speed,
          opacity: p.opacity - 0.005,
          x: p.x + (Math.random() - 0.5) * 0.5
        })).filter(p => p.opacity > 0)
      );

      // Add new smoke particles
      setSmokeParticles(prev => {
        if (prev.length < 20) {
          return [...prev, {
            id: Date.now(),
            x: 120 + Math.random() * 10,
            y: 85,
            size: 5,
            opacity: 0.8,
            speed: 0.2 + Math.random() * 0.3
          }];
        }
        return prev;
      });
    }, 100);

    return () => clearInterval(animate);
  }, []);

  return (
    <div className="relative w-full h-[400px] overflow-hidden rounded-2xl bg-gradient-to-b from-sky-100 to-sky-200">
      {/* Sky with clouds */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-20 h-8 bg-white rounded-full opacity-70 animate-float" />
        <div className="absolute top-20 right-20 w-32 h-12 bg-white rounded-full opacity-60 animate-float-delayed" />
        <div className="absolute top-40 left-40 w-24 h-10 bg-white rounded-full opacity-50 animate-float-slow" />
      </div>

      {/* Sun */}
      <div className="absolute top-8 right-8 w-16 h-16 bg-yellow-300 rounded-full shadow-lg animate-pulse" />
      
      {/* Hills */}
      <div className="absolute bottom-0 left-0 w-full h-32">
        <div className="absolute -bottom-10 left-0 w-64 h-32 bg-green-300 rounded-t-full" />
        <div className="absolute -bottom-10 left-40 w-80 h-40 bg-green-400 rounded-t-full" />
        <div className="absolute -bottom-10 right-0 w-72 h-36 bg-green-500 rounded-t-full" />
      </div>

      {/* Main House */}
      <div 
        className="absolute bottom-20 left-1/2 transform -translate-x-1/2 cursor-pointer group"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* House Body */}
        <div className="relative w-64 h-48 bg-amber-100 border-4 border-amber-800 rounded-lg shadow-2xl">
          {/* Roof */}
          <div className="absolute -top-16 left-0 w-0 h-0 border-l-[130px] border-r-[130px] border-b-[80px] border-l-transparent border-r-transparent border-b-amber-700" />
          
          {/* Chimney */}
          <div className="absolute -top-12 right-8 w-8 h-20 bg-amber-800 rounded-t-lg">
            {/* Smoke */}
            {smokeParticles.map(p => (
              <div
                key={p.id}
                className="absolute bg-gray-300 rounded-full"
                style={{
                  left: `${p.x}px`,
                  top: `${p.y}px`,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  opacity: p.opacity,
                  transform: 'translateX(-50%)'
                }}
              />
            ))}
          </div>

          {/* Windows */}
          <div className="absolute top-8 left-8">
            <div className={`w-12 h-16 bg-${windowLights[0] ? 'yellow' : 'blue'}-300 border-4 border-amber-800 rounded`}>
              <div className="w-full h-1/2 border-b-4 border-amber-800" />
            </div>
          </div>
          
          <div className="absolute top-8 right-8">
            <div className={`w-12 h-16 bg-${windowLights[1] ? 'yellow' : 'blue'}-300 border-4 border-amber-800 rounded`}>
              <div className="w-full h-1/2 border-b-4 border-amber-800" />
            </div>
          </div>

          {/* Door */}
          <div 
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-32 bg-amber-900 border-4 border-amber-800 rounded-t-lg transition-transform duration-300"
            style={{ transform: `translateX(-50%) translateY(${doorPosition}px)` }}
          >
            <div className="absolute top-1/2 left-2 w-3 h-3 bg-yellow-300 rounded-full" />
          </div>

          {/* Garden Lights */}
          <div className="absolute -left-6 bottom-8 w-4 h-4 bg-yellow-300 rounded-full animate-pulse" />
          <div className="absolute -right-6 bottom-12 w-4 h-4 bg-yellow-300 rounded-full animate-pulse delay-300" />
        </div>

        {/* Pathway */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-32 h-4 bg-amber-700 rounded-full" />
      </div>

      {/* Trees */}
      <div className="absolute bottom-20 left-20">
        <div className="w-8 h-32 bg-amber-800 rounded-full" />
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-green-600 rounded-full" />
      </div>

      <div className="absolute bottom-20 right-20">
        <div className="w-8 h-32 bg-amber-800 rounded-full" />
        <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-green-700 rounded-full" />
      </div>

      {/* Floating For Sale Sign */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="bg-primary text-white px-6 py-3 rounded-full shadow-lg font-bold flex items-center gap-2">
          <span className="text-2xl">🏠</span>
          <span>Find Your Dream Home</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 7s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        
        .delay-300 {
          animation-delay: 300ms;
        }
      `}</style>
    </div>
  );
}