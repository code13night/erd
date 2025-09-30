'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Table, Column } from '@/types/erd';
import { Database, Key, Link, Edit3, Check, X, Plus, Trash2 } from 'lucide-react';
import { DataTypePicker } from '@/components/common/data-type-picker';

interface TableNodeProps {
  data: {
    table: Table;
    onEdit: (table: Table) => void;
  };
}

export const TableNode: React.FC<TableNodeProps> = ({ data }) => {
  const { table, onEdit } = data;
  const [editingTableName, setEditingTableName] = useState(false);
  const [tableName, setTableName] = useState(table.name);
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [editingColumnField, setEditingColumnField] = useState<'name' | 'type' | null>(null);
  const [columnEditValues, setColumnEditValues] = useState<{[key: string]: {name: string, type: string}}>({});
  
  const tableNameInputRef = useRef<HTMLInputElement>(null);
  const columnInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingTableName && tableNameInputRef.current) {
      tableNameInputRef.current.focus();
      tableNameInputRef.current.select();
    }
  }, [editingTableName]);

  useEffect(() => {
    if (editingColumn && columnInputRef.current) {
      columnInputRef.current.focus();
      columnInputRef.current.select();
    }
  }, [editingColumn, editingColumnField]);

  const handleTableNameEdit = () => {
    setEditingTableName(true);
  };

  const handleTableNameSave = () => {
    if (tableName.trim() && tableName !== table.name) {
      const updatedTable = { ...table, name: tableName.trim() };
      onEdit(updatedTable);
    }
    setEditingTableName(false);
  };

  const handleTableNameCancel = () => {
    setTableName(table.name);
    setEditingTableName(false);
  };

  const handleTableNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTableNameSave();
    } else if (e.key === 'Escape') {
      handleTableNameCancel();
    }
  };

  const handleColumnEdit = (columnId: string, field: 'name' | 'type') => {
    const column = table.columns.find(c => c.id === columnId);
    if (column) {
      setEditingColumn(columnId);
      setEditingColumnField(field);
      // Initialize edit values with current column data
      setColumnEditValues(prev => ({
        ...prev,
        [columnId]: {
          name: column.name,
          type: column.type
        }
      }));
    }
  };

  const handleColumnSave = () => {
    console.log('Saving column:', editingColumn, editingColumnField);
    if (editingColumn && editingColumnField) {
      const editValues = columnEditValues[editingColumn];
      console.log('Edit values:', editValues);
      if (editValues) {
        const currentColumn = table.columns.find(col => col.id === editingColumn);
        if (currentColumn) {
          let newValue = editValues[editingColumnField].trim();
          // For type field, ensure we have a valid value
          if (editingColumnField === 'type' && (!newValue || newValue === '')) {
            newValue = currentColumn.type || 'string';
          }
          // For name field, allow empty string (do not fallback)
          console.log('Final new value:', newValue);
          const updatedColumns = table.columns.map(col => 
            col.id === editingColumn 
              ? { ...col, [editingColumnField]: newValue }
              : col
          );
          const updatedTable = { ...table, columns: updatedColumns };
          console.log('Updated table:', updatedTable);
          onEdit(updatedTable);
        }
      }
    }
    setEditingColumn(null);
    setEditingColumnField(null);
  };

  // Helper to commit a specific type value immediately (bypassing any stale state)
  const commitTypeNow = (columnId: string, finalType: string) => {
    const currentColumn = table.columns.find(col => col.id === columnId);
    const newValue = (finalType || currentColumn?.type || 'string').trim();
    const updatedColumns = table.columns.map(col => 
      col.id === columnId ? { ...col, type: newValue } : col
    );
    const updatedTable = { ...table, columns: updatedColumns };
    onEdit(updatedTable);
    setEditingColumn(null);
    setEditingColumnField(null);
  };

  const handleColumnCancel = () => {
    setEditingColumn(null);
    setEditingColumnField(null);
  };

  const handleColumnKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      // If editing name and value is empty, reset to previous value
      if (
        editingColumn &&
        editingColumnField === 'name' &&
        (!columnEditValues[editingColumn]?.name || columnEditValues[editingColumn]?.name.trim() === '')
      ) {
        // Reset to previous value
        setColumnEditValues(prev => ({
          ...prev,
          [editingColumn]: {
            ...prev[editingColumn],
            name: table.columns.find(col => col.id === editingColumn)?.name || ''
          }
        }));
      }
      handleColumnSave();
    } else if (e.key === 'Escape') {
      handleColumnCancel();
    }
  };

  const handleColumnChange = (columnId: string, field: 'name' | 'type', value: string) => {
    console.log('Column change:', columnId, field, value);
    setColumnEditValues(prev => ({
      ...prev,
      [columnId]: {
        ...prev[columnId],
        name: prev[columnId]?.name || '',
        type: prev[columnId]?.type || '',
        [field]: value
      }
    }));
  };

  const addNewColumn = () => {
    const newColumn: Column = {
      id: `col_${Date.now()}_${Math.random()}`,
      name: 'new_column',
      type: 'string', // Ensure default type is always set
      isPrimaryKey: false,
      isForeignKey: false,
      isNotNull: false,
      isUnique: false
    };
    const updatedTable = { 
      ...table, 
      columns: [...table.columns, newColumn] 
    };
    onEdit(updatedTable);
  };

  const deleteColumn = (columnId: string) => {
    const updatedColumns = table.columns.filter(col => col.id !== columnId);
    const updatedTable = { ...table, columns: updatedColumns };
    onEdit(updatedTable);
  };

  const toggleColumnConstraint = (columnId: string, constraint: 'isPrimaryKey' | 'isForeignKey' | 'isNotNull' | 'isUnique') => {
    const updatedColumns = table.columns.map(col => 
      col.id === columnId 
        ? { ...col, [constraint]: !col[constraint] }
        : col
    );
    const updatedTable = { ...table, columns: updatedColumns };
    onEdit(updatedTable);
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-lg hover:shadow-xl transition-shadow min-w-[280px] overflow-hidden relative">
      {/* Table header with inline editing */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3">
        <div className="flex items-center gap-2">
          <Database size={16} />
          {editingTableName ? (
            <div className="flex items-center gap-2 flex-1">
              <input
                ref={tableNameInputRef}
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                onKeyDown={handleTableNameKeyDown}
                onBlur={handleTableNameSave}
                className="bg-white text-gray-900 px-2 py-1 rounded text-sm font-semibold flex-1 min-w-0"
              />
              <button
                onClick={handleTableNameSave}
                className="p-1 hover:bg-blue-800 rounded transition-colors"
              >
                <Check size={12} />
              </button>
              <button
                onClick={handleTableNameCancel}
                className="p-1 hover:bg-blue-800 rounded transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-1 group">
              <span className="font-semibold text-sm flex-1">{table.name}</span>
              <button
                onClick={handleTableNameEdit}
                className="p-1 opacity-0 group-hover:opacity-100 hover:bg-blue-800 rounded transition-all"
              >
                <Edit3 size={12} />
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Columns with inline editing */}
      <div className="p-0">
        {table.columns.map((column, index) => (
          <div
            key={column.id}
            className={`flex items-center gap-2 py-2 px-3 text-sm hover:bg-blue-50 transition-colors relative group ${
              index < table.columns.length - 1 ? 'border-b border-gray-100' : ''
            }`}
          >
            {/* Source handle for primary keys and unique columns */}
            {(column.isPrimaryKey || column.isUnique) && (
              <Handle
                type="source"
                position={Position.Right}
                id={`${table.id}-${column.name}-source`}
                className="w-2 h-2 !bg-green-500 !border !border-white !right-1 opacity-0 hover:opacity-100 transition-opacity"
                style={{ top: '50%', transform: 'translateY(-50%)' }}
              />
            )}
            
            {/* Target handle for foreign keys */}
            {column.isForeignKey && (
              <Handle
                type="target"
                position={Position.Left}
                id={`${table.id}-${column.name}-target`}
                className="w-2 h-2 !bg-blue-500 !border !border-white !left-1 opacity-0 hover:opacity-100 transition-opacity"
                style={{ top: '50%', transform: 'translateY(-50%)' }}
              />
            )}
            
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              {column.isPrimaryKey && (
                <button
                  onClick={() => toggleColumnConstraint(column.id, 'isPrimaryKey')}
                  title="Primary Key"
                >
                  <Key size={12} className="text-yellow-500 flex-shrink-0" />
                </button>
              )}
              {column.isForeignKey && (
                <button
                  onClick={() => toggleColumnConstraint(column.id, 'isForeignKey')}
                  title="Foreign Key"
                >
                  <Link size={12} className="text-blue-500 flex-shrink-0" />
                </button>
              )}
              
              {/* Column name editing */}
              {editingColumn === column.id && editingColumnField === 'name' ? (
                <div className="flex items-center gap-1 flex-1">
                  <input
                    ref={columnInputRef}
                    value={
                      columnEditValues[column.id]?.name !== undefined
                        ? columnEditValues[column.id]?.name
                        : column.name
                    }
                    onChange={(e) => handleColumnChange(column.id, 'name', e.target.value)}
                    onKeyDown={handleColumnKeyDown}
                    onBlur={handleColumnSave}
                    className="bg-blue-100 text-gray-900 px-1 py-0.5 rounded text-xs flex-1 min-w-0"
                  />
                </div>
              ) : (
                <button
                  onClick={() => handleColumnEdit(column.id, 'name')}
                  className={`truncate text-left flex-1 hover:bg-blue-100 px-1 py-0.5 rounded transition-colors ${
                    column.isPrimaryKey ? 'font-semibold text-gray-900' : 'text-gray-700'
                  } ${!column.name || column.name.trim() === '' ? 'text-red-500 bg-red-50' : ''}`}
                  title={!column.name || column.name.trim() === '' ? 'Column name required - click to set' : 'Click to edit column name'}
                >
                  {!column.name || column.name.trim() === '' ? 'COLUMN NAME?' : column.name}
                </button>
              )}
            </div>
            
            {/* Column type editing */}
            {editingColumn === column.id && editingColumnField === 'type' ? (
              <DataTypePicker
                value={columnEditValues[column.id]?.type || column.type}
                onChange={(type) => handleColumnChange(column.id, 'type', type)}
                onSave={(finalType) => commitTypeNow(column.id, finalType)}
                onCancel={handleColumnCancel}
              />
            ) : (
              <button
                onClick={() => handleColumnEdit(column.id, 'type')}
                className={`text-xs font-mono px-2 py-1 rounded flex-shrink-0 transition-colors border ${
                  !column.type || column.type.trim() === '' 
                    ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' 
                    : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-blue-100 hover:border-blue-300'
                }`}
                title={!column.type || column.type.trim() === '' ? 'Data type required - click to set' : 'Click to edit data type'}
              >
                {!column.type || column.type.trim() === '' ? 'TYPE?' : column.type}
              </button>
            )}
            
            {/* Column actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => deleteColumn(column.id)}
                className="p-1 hover:bg-red-100 text-red-500 rounded transition-colors"
                title="Delete column"
              >
                <Trash2 size={10} />
              </button>
            </div>
          </div>
        ))}
        
        {/* Add new column button */}
        <div className="px-3 py-2 border-t border-gray-100">
          <button
            onClick={addNewColumn}
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-blue-600 transition-colors w-full"
          >
            <Plus size={12} />
            Add Column
          </button>
        </div>
      </div>
      
      {/* Default handles for general connections */}
      <Handle
        type="target"
        position={Position.Top}
        id={`${table.id}-top`}
        className="w-3 h-3 !bg-gray-400 !border-2 !border-white opacity-50"
      />
      
      <Handle
        type="source"
        position={Position.Bottom}
        id={`${table.id}-bottom`}
        className="w-3 h-3 !bg-gray-400 !border-2 !border-white opacity-50"
      />
    </div>
  );
};
