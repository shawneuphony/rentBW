// app/components/ui/PropertyGallery.js
'use client';

import { useState } from 'react';

export default function PropertyGallery({ images }) {
  const [showAll, setShowAll] = useState(false);

  const imageList = [
    { src: images.main, alt: 'Main view' },
    { src: images.kitchen, alt: 'Kitchen' },
    { src: images.bedroom, alt: 'Bedroom' },
    { src: images.bathroom, alt: 'Bathroom' },
    { src: images.exterior, alt: 'Exterior' }
  ];

  if (showAll) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 overflow-y-auto">
        <div className="min-h-screen p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setShowAll(false)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {imageList.map((img, index) => (
                <img
                  key={index}
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-auto rounded-lg"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-3 h-[300px] md:h-[500px] mb-8 overflow-hidden rounded-xl">
      {/* Main Image */}
      <div className="md:col-span-2 md:row-span-2 relative group cursor-pointer overflow-hidden">
        <img
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          src={images.main}
          alt="Main property view"
        />
        <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors"></div>
      </div>

      {/* Kitchen */}
      <div className="hidden md:block relative group cursor-pointer overflow-hidden">
        <img
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          src={images.kitchen}
          alt="Kitchen"
        />
      </div>

      {/* Bedroom */}
      <div className="hidden md:block relative group cursor-pointer overflow-hidden">
        <img
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          src={images.bedroom}
          alt="Bedroom"
        />
      </div>

      {/* Bathroom */}
      <div className="hidden md:block relative group cursor-pointer overflow-hidden">
        <img
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          src={images.bathroom}
          alt="Bathroom"
        />
      </div>

      {/* Exterior with overlay */}
      <div className="hidden md:block relative group cursor-pointer overflow-hidden">
        <img
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          src={images.exterior}
          alt="Exterior"
        />
        <div 
          onClick={() => setShowAll(true)}
          className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold group-hover:bg-black/20 transition-colors cursor-pointer"
        >
          +{imageList.length - 4} Photos
        </div>
      </div>
    </div>
  );
}