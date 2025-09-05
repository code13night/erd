'use client';

import React, { useState, useEffect } from 'react';
import { DDLGenerator } from '@/lib/ddl-generator';
import { ERDData, DatabaseType } from '@/types/erd';
import { Copy, Download, Check } from 'lucide-react';

interface DDLViewerProps {
  erdData: ERDData;
  databaseType: DatabaseType;
  onDatabaseTypeChange: (type: DatabaseType) => void;
}

const DATABASE_OPTIONS: { value: DatabaseType; label: string; color: string }[] = [
  { value: 'mysql', label: 'MySQL', color: 'bg-orange-100 text-orange-800' },
  { value: 'postgresql', label: 'PostgreSQL', color: 'bg-blue-100 text-blue-800' },
  { value: 'sqlite', label: 'SQLite', color: 'bg-gray-100 text-gray-800' },
  { value: 'sqlserver', label: 'SQL Server', color: 'bg-red-100 text-red-800' },
  { value: 'oracle', label: 'Oracle', color: 'bg-purple-100 text-purple-800' },
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

  const selectedDb = DATABASE_OPTIONS.find(db => db.value === databaseType);

  return (
    <div className="h-full flex flex-col bg-white min-h-0">
      {/* Database Selector */}
      <div className="flex-shrink-0 bg-gray-50 border-b border-gray-200 px-3 py-2">
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-600 mb-2">Target Database:</div>
          <div className="grid grid-cols-1 gap-1">
            {DATABASE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => onDatabaseTypeChange(option.value)}
                className={`text-xs px-2 py-1 rounded text-left transition-colors ${
                  databaseType === option.value
                    ? option.color + ' ring-1 ring-current'
                    : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-3 py-2">
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex-1 justify-center"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex-1 justify-center"
          >
            <Download size={12} />
            Download
          </button>
        </div>
      </div>
      
      {/* DDL Code */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto overflow-x-auto">
          <pre className="p-3 font-mono text-xs bg-white text-gray-800 leading-relaxed whitespace-pre-wrap min-h-full">
            <code>{ddlCode}</code>
          </pre>
        </div>
      </div>

      {/* Stats Footer */}
      <div className="flex-shrink-0 bg-gray-50 border-t border-gray-200 px-3 py-2">
        <div className="text-xs text-gray-500">
          <div className="flex justify-between">
            <span>{erdData.tables.length} tables</span>
            <span>{erdData.relationships.length} relations</span>
          </div>
          {selectedDb && (
            <div className="mt-1">
              <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${selectedDb.color}`}>
                {selectedDb.label}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
