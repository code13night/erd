'use client';

import React, { useState, useEffect } from 'react';
import { DDLGenerator } from '@/lib/ddl-generator';
import { ERDData, DatabaseType } from '@/types/erd';
import { Copy, Download } from 'lucide-react';

interface DDLViewerProps {
  erdData: ERDData;
  databaseType: DatabaseType;
  onDatabaseTypeChange: (type: DatabaseType) => void;
}

const DATABASE_OPTIONS: { value: DatabaseType; label: string }[] = [
  { value: 'mysql', label: 'MySQL' },
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'sqlite', label: 'SQLite' },
  { value: 'sqlserver', label: 'SQL Server' },
  { value: 'oracle', label: 'Oracle' },
];

export const DDLViewer: React.FC<DDLViewerProps> = ({
  erdData,
  databaseType,
  onDatabaseTypeChange,
}) => {
  const [ddlCode, setDdlCode] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const generated = DDLGenerator.generateDDL(erdData, databaseType);
    setDdlCode(generated);
  }, [erdData, databaseType]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(ddlCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([ddlCode], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `schema_${databaseType}.sql`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 bg-gray-100 px-4 py-2 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">Generated DDL</h3>
          <div className="flex items-center gap-2">
            <select
              value={databaseType}
              onChange={(e) => onDatabaseTypeChange(e.target.value as DatabaseType)}
              className="text-xs px-2 py-1 border border-gray-300 rounded"
            >
              {DATABASE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Copy size={12} />
              {copied ? 'Copied!' : 'Copy'}
            </button>
            
            <button
              onClick={handleDownload}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
            >
              <Download size={12} />
              Download
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 relative">
        <pre className="w-full h-full p-4 font-mono text-sm overflow-auto bg-white border-none outline-none">
          <code className="text-gray-800">{ddlCode}</code>
        </pre>
      </div>
    </div>
  );
};
