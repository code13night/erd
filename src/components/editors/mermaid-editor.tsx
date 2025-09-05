'use client';

import React, { useState, useEffect } from 'react';
import { MermaidParser } from '@/lib/mermaid-parser';
import { ERDData } from '@/types/erd';
import { AlertCircle } from 'lucide-react';

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
      console.log('Parsing Mermaid code:', value.substring(0, 100) + '...');
      const erdData = MermaidParser.parseERD(value);
      console.log('Parsed ERD data:', erdData);
      onERDChange(erdData);
      setError(null);
    } catch (err) {
      console.error('Parse error:', err);
      setError(err instanceof Error ? err.message : 'Parse error');
    }
  }, [value, onERDChange]);

  return (
    <div className="h-full flex flex-col bg-white">
      {error && (
        <div className="flex-shrink-0 bg-red-50 border-b border-red-200 px-3 py-2">
          <div className="flex items-center gap-2 text-red-700 text-xs">
            <AlertCircle size={14} />
            <span>Syntax Error: {error}</span>
          </div>
        </div>
      )}
      
      <div className="flex-1 relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-full p-3 font-mono text-xs border-none outline-none resize-none bg-white leading-relaxed focus:ring-0 focus:border-none"
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          placeholder={`erDiagram
    CUSTOMER {
        int CustomerID PK
        string Name
    }
    SALES_ORDER {
        int SalesOrderID PK
        int CustomerID FK
    }
    
    CUSTOMER ||--o{ SALES_ORDER : places`}
        />
      </div>
      
      {/* Helper text */}
      <div className="flex-shrink-0 bg-gray-50 border-t border-gray-200 px-3 py-2">
        <div className="text-xs text-gray-500">
          <div className="font-medium mb-1">Quick syntax:</div>
          <div className="space-y-0.5 text-[10px]">
            <div><code>||--o{`{`}</code> one-to-many</div>
            <div><code>||--||</code> one-to-one</div>
            <div><code>{`}o--o{`}</code> many-to-many</div>
          </div>
        </div>
      </div>
    </div>
  );
};
