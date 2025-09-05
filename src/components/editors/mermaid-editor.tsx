'use client';

import React, { useState, useEffect } from 'react';
import { MermaidParser } from '@/lib/mermaid-parser';
import { ERDData } from '@/types/erd';

interface MermaidEditorProps {
  value: string;
  onChange: (value: string) => void;
  onERDChange: (erdData: ERDData) => void;
}

export const MermaidEditor: React.FC<MermaidEditorProps> = ({
  value,
  onChange,
  onERDChange,
}) => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const erdData = MermaidParser.parseERD(value);
      onERDChange(erdData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Parse error');
    }
  }, [value, onERDChange]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 bg-gray-100 px-4 py-2 border-b">
        <h3 className="text-sm font-medium text-gray-700">Mermaid ERD Syntax</h3>
        {error && (
          <div className="text-red-600 text-xs mt-1">
            Error: {error}
          </div>
        )}
      </div>
      
      <div className="flex-1 relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-full p-4 font-mono text-sm border-none outline-none resize-none bg-white"
          placeholder={`erDiagram
    CUSTOMER {
        string name
        string custNumber
        string sector
    }
    ORDER {
        int orderNumber
        string deliveryAddress
    }
    LINE-ITEM {
        string productCode
        int quantity
        float pricePerUnit
    }
    
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains`}
        />
      </div>
    </div>
  );
};
