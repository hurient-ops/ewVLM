import React from 'react';

interface MapControlsOverlayProps {
  mapType: "ROADMAP" | "SKYVIEW";
  setMapType: (type: "ROADMAP" | "SKYVIEW") => void;
}

export const MapControlsOverlay: React.FC<MapControlsOverlayProps> = ({ mapType, setMapType }) => {
  return (
    <div className="absolute top-6 right-6 flex gap-2 z-30 pointer-events-auto">
      <div className="bg-[#121724]/80 backdrop-blur-md border border-[#232C3F] rounded-lg flex overflow-hidden shadow-md p-1 gap-1">
        <button 
          onClick={() => setMapType("ROADMAP")}
          className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${mapType === "ROADMAP" ? "bg-[#7c3aed] text-white" : "text-gray-400 hover:bg-[#31343f] hover:text-white"}`}
        > 
          일반 뷰 
        </button>
        <button 
          onClick={() => setMapType("SKYVIEW")}
          className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${mapType === "SKYVIEW" ? "bg-[#7c3aed] text-white" : "text-gray-400 hover:bg-[#31343f] hover:text-white"}`}
        > 
          위성 (스카이뷰) 
        </button>
      </div>
    </div>
  );
};
