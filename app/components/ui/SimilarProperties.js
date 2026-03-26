// app/components/ui/SimilarProperties.js
import Link from 'next/link';

export default function SimilarProperties({ properties, neighborhood }) {
  if (!properties || properties.length === 0) return null;

  return (
    <section className="mt-20 mb-12">
      <h3 className="text-2xl font-bold mb-8 text-[#112120]">
        Similar Properties in {neighborhood}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {properties.map((property) => (
          <Link
            key={property.id}
            href={`/property/${property.id}`}
            className="bg-white rounded-xl overflow-hidden border border-primary/5 hover:shadow-md transition-shadow cursor-pointer group"
          >
            <div className="h-48 relative">
              <img
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                src={property.image}
                alt={property.title}
              />
              <div className="absolute top-3 right-3 bg-white/90 px-2 py-1 rounded-md text-xs font-bold text-primary">
                BWP {property.price.toLocaleString()}
              </div>
            </div>
            <div className="p-4">
              <h4 className="font-bold mb-1">{property.title}</h4>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">location_on</span>
                {property.location}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}