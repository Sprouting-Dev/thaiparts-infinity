interface ContactMapData {
  title?: string;
  mapIframeUrl: string;
  mapWidth: string;
  mapHeight: string;
  allowFullscreen: boolean;
  locationName?: string;
  locationDescription?: string;
}

interface ContactMapProps {
  data: ContactMapData;
}

export default function ContactMap({ data }: ContactMapProps) {
  const { 
    title = "Find Us", 
    mapIframeUrl, 
    mapWidth, 
    mapHeight, 
    allowFullscreen, 
    locationName, 
    locationDescription 
  } = data;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {title && (
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
      )}
      
      {/* Location Info */}
      {(locationName || locationDescription) && (
        <div className="mb-4">
          {locationName && (
            <h3 className="font-medium text-gray-900 mb-1">{locationName}</h3>
          )}
          {locationDescription && (
            <p className="text-gray-600 text-sm">{locationDescription}</p>
          )}
        </div>
      )}

      {/* Map iframe */}
      <div className="relative rounded-lg overflow-hidden">
        <iframe
          src={mapIframeUrl}
          width={mapWidth}
          height={mapHeight}
          style={{ border: 0 }}
          allowFullScreen={allowFullscreen}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full"
          title={locationName || "Location Map"}
        />
      </div>

      {/* Map disclaimer */}
      <p className="text-xs text-gray-500 mt-3">
        Click and drag to navigate the map. Use scroll wheel to zoom in/out.
      </p>
    </div>
  );
}