'use client';

import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Table } from '@/types/erd';
import { Database, Key, Link } from 'lucide-react';

interface TableNodeProps {
  data: {
    table: Table;
    onEdit: (table: Table) => void;
  };
}

export const TableNode: React.FC<TableNodeProps> = ({ data }) => {
  const { table } = data;

  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-lg hover:shadow-xl transition-shadow min-w-[220px] overflow-hidden">
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-blue-500 !border-2 !border-white"
      />
      
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3">
        <div className="flex items-center gap-2">
          <Database size={16} />
          <span className="font-semibold text-sm">{table.name}</span>
        </div>
      </div>
      
      <div className="p-0">
        {table.columns.map((column, index) => (
          <div
            key={column.id}
            className={`flex items-center gap-2 py-2 px-3 text-sm hover:bg-blue-50 transition-colors ${
              index < table.columns.length - 1 ? 'border-b border-gray-100' : ''
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              {column.isPrimaryKey && (
                <Key size={12} className="text-yellow-500 flex-shrink-0" />
              )}
              {column.isForeignKey && (
                <Link size={12} className="text-blue-500 flex-shrink-0" />
              )}
              <span className={`truncate ${column.isPrimaryKey ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                {column.name}
              </span>
            </div>
            <span className="text-gray-500 text-xs font-mono bg-gray-50 px-2 py-0.5 rounded flex-shrink-0">
              {column.type}
            </span>
          </div>
        ))}
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-blue-500 !border-2 !border-white"
      />
    </div>
  );
};
