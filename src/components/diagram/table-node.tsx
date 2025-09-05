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
    <div className="bg-white border-2 border-gray-300 rounded-lg shadow-lg min-w-[200px]">
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-blue-500"
      />
      
      <div className="bg-blue-600 text-white px-3 py-2 rounded-t-lg flex items-center gap-2">
        <Database size={16} />
        <span className="font-semibold">{table.name}</span>
      </div>
      
      <div className="p-2">
        {table.columns.map((column) => (
          <div
            key={column.id}
            className="flex items-center gap-2 py-1 px-2 text-sm hover:bg-gray-50 rounded"
          >
            {column.isPrimaryKey && <Key size={12} className="text-yellow-500" />}
            {column.isForeignKey && <Link size={12} className="text-blue-500" />}
            <span className={column.isPrimaryKey ? 'font-semibold' : ''}>
              {column.name}
            </span>
            <span className="text-gray-500 text-xs ml-auto">
              {column.type}
            </span>
          </div>
        ))}
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-blue-500"
      />
    </div>
  );
};
