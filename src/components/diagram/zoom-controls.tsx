'use client';

import React, { useState, useEffect } from 'react';
import { useReactFlow } from '@xyflow/react';
import { Grid3X3, Grid } from 'lucide-react';

interface ZoomControlsProps {
  showGrid: boolean;
  onGridToggle: (show: boolean) => void;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({ showGrid, onGridToggle }) => {
  const { getZoom } = useReactFlow();
  const [currentZoom, setCurrentZoom] = useState(75);

  // Update zoom display when zoom changes
  useEffect(() => {
    const updateZoom = () => {
      const zoom = getZoom();
      setCurrentZoom(Math.round(zoom * 100));
    };

    // Update zoom on viewport changes
    const interval = setInterval(updateZoom, 200);
    return () => clearInterval(interval);
  }, [getZoom]);

  return (
    <>
      {/* Zoom Display - Bottom Right */}
      <div className="absolute bottom-4 right-4 z-10">
        <div className="bg-white/95 backdrop-blur-sm border border-gray-300 rounded-lg shadow-lg">
          <div className="flex items-center">
            {/* Zoom Display */}
            <div className="px-3 py-2 border-r border-gray-200">
              <div className="text-xs text-gray-600 mb-0.5">Zoom</div>
              <div className="text-sm font-bold text-blue-600">{currentZoom}%</div>
            </div>
            
            {/* Grid Toggle */}
            <button
              onClick={() => onGridToggle(!showGrid)}
              className="p-2 hover:bg-gray-100 transition-colors rounded-r-lg"
              title={showGrid ? "Hide Grid" : "Show Grid"}
            >
              {showGrid ? (
                <Grid size={16} className="text-green-600" />
              ) : (
                <Grid3X3 size={16} className="text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
