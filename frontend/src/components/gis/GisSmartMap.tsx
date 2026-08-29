import React, { useState } from 'react';
import { MapContainer } from './MapContainer';
import { MapControlsOverlay } from './MapControlsOverlay';
import { PtzControlOverlay } from './PtzControlOverlay';
import { useGisStore } from '../../store/useGisStore';

export const GisSmartMap: React.FC = () => {
  const [mapType, setMapType] = useState<"ROADMAP" | "SKYVIEW">("ROADMAP");
  const { selectedMarkerId } = useGisStore();

  return (
    <main className="flex-1 relative bg-[#0b0e17] overflow-hidden">
      <div className="absolute inset-0 z-0">
        <MapContainer mapType={mapType} />
      </div>

      <div className="absolute inset-0 pointer-events-none z-10">
        <PtzControlOverlay selectedMarkerId={selectedMarkerId} />
        <MapControlsOverlay mapType={mapType} setMapType={setMapType} />
      </div>
    </main>
  );
};
