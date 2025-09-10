'use client';

import React, { useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MiniMap,
  NodeChange,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { TableNode } from './table-node';
import { ERDData, Table } from '@/types/erd';

interface ERDCanvasProps {
  erdData: ERDData;
  onTableEdit: (table: Table) => void;
  onDataChange: (erdData: ERDData) => void;
}

const nodeTypes = {
  tableNode: TableNode,
};

export const ERDCanvas: React.FC<ERDCanvasProps> = ({
  erdData,
  onTableEdit,
  onDataChange,
}) => {
  // Handle table edits and propagate changes
  const handleTableEdit = useCallback((updatedTable: Table) => {
    console.log('Table edited:', updatedTable);
    
    // Update the ERD data with the modified table
    const updatedTables = erdData.tables.map(table => 
      table.id === updatedTable.id ? updatedTable : table
    );
    
    const updatedERDData = {
      ...erdData,
      tables: updatedTables
    };
    
    // Propagate changes to parent
    onDataChange(updatedERDData);
    onTableEdit(updatedTable);
  }, [erdData, onDataChange, onTableEdit]);

  // Convert ERD data to React Flow nodes and edges
  const initialNodes: Node[] = useMemo(() => {
    return erdData.tables.map((table, index) => ({
      id: table.id,
      type: 'tableNode',
      position: table.position || { x: (index % 4) * 300, y: Math.floor(index / 4) * 200 + 100 },
      data: {
        table,
        onEdit: handleTableEdit,
      },
    }));
  }, [erdData.tables, handleTableEdit]);

  const initialEdges: Edge[] = useMemo(() => {
    return erdData.relationships.map((relationship) => {
      const sourceTable = erdData.tables.find(t => t.name === relationship.fromTable);
      const targetTable = erdData.tables.find(t => t.name === relationship.toTable);

      if (!sourceTable || !targetTable) {
        return {
          id: relationship.id,
          source: relationship.fromTable,
          target: relationship.toTable,
          type: 'smoothstep',
          animated: true,
          label: relationship.label || `${relationship.type}`,
          labelStyle: { fontSize: 10, fontWeight: 500 },
          style: { stroke: '#374151', strokeWidth: 2 },
        };
      }

      // Find the specific columns for the relationship
      const sourceColumn = sourceTable.columns.find(col => 
        col.isPrimaryKey || col.name === relationship.fromColumn
      ) || sourceTable.columns.find(col => col.isPrimaryKey); // fallback to PK

      const targetColumn = targetTable.columns.find(col => 
        col.isForeignKey && (
          col.name === relationship.toColumn || 
          col.name.toLowerCase().includes(sourceTable.name.toLowerCase()) ||
          col.name.toLowerCase().includes('id')
        )
      );

      // Determine source and target handles
      let sourceHandle = `${sourceTable.id}-bottom`; // default
      let targetHandle = `${targetTable.id}-top`; // default

      if (sourceColumn && (sourceColumn.isPrimaryKey || sourceColumn.isUnique)) {
        sourceHandle = `${sourceTable.id}-${sourceColumn.name}-source`;
      }

      if (targetColumn && targetColumn.isForeignKey) {
        targetHandle = `${targetTable.id}-${targetColumn.name}-target`;
      }

      return {
        id: relationship.id,
        source: sourceTable.id,
        target: targetTable.id,
        sourceHandle,
        targetHandle,
        type: 'smoothstep',
        animated: true,
        label: relationship.label || `${relationship.type}`,
        labelStyle: { 
          fontSize: 10, 
          fontWeight: 500,
          fill: '#374151',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          padding: '2px 4px',
          borderRadius: '3px'
        },
        style: { 
          stroke: relationship.type === 'one-to-many' ? '#059669' : 
                 relationship.type === 'one-to-one' ? '#DC2626' : '#7C3AED', 
          strokeWidth: 2 
        },
      };
    });
  }, [erdData.relationships, erdData.tables]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes and edges when ERD data changes
  useEffect(() => {
    console.log('Updating nodes:', initialNodes);
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    console.log('Updating edges:', initialEdges);
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
  );

  // Update ERD data when nodes change (for dragging)
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);
    },
    [onNodesChange]
  );

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 relative">
      {/* Canvas Info Overlay */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm">
          <div className="text-xs text-gray-600 text-center">
            <span className="font-medium">{erdData.tables.length}</span> tables, <span className="font-medium">{erdData.relationships.length}</span> relationships
            <br />
            <span className="text-[10px] text-gray-400">Nodes: {nodes.length}, Edges: {edges.length}</span>
          </div>
        </div>
      </div>

      {/* Debug info when no tables */}
      {erdData.tables.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center max-w-md">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">No Tables Found</h3>
            <p className="text-xs text-yellow-700">
              Try editing the Mermaid code to add tables. Check the browser console for parsing errors.
            </p>
          </div>
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView={nodes.length > 0}
        className="bg-transparent"
        minZoom={0.1}
        maxZoom={2}
      >
        <Background 
          color="#e5e7eb" 
          gap={20} 
          size={1}
          variant={BackgroundVariant.Dots}
        />
        <Controls 
          className="!bg-white !border-gray-300 !shadow-lg"
          showZoom={true}
          showFitView={true}
          showInteractive={true}
        />
        <MiniMap
          className="!bg-white/95 !border-gray-300 !shadow-lg !rounded-lg"
          nodeColor="#3b82f6"
          maskColor="rgba(0, 0, 0, 0.1)"
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  );
};
