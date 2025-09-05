'use client';

import React, { useCallback, useMemo } from 'react';
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
  // Convert ERD data to React Flow nodes and edges
  const initialNodes: Node[] = useMemo(() => {
    return erdData.tables.map((table) => ({
      id: table.id,
      type: 'tableNode',
      position: table.position,
      data: {
        table,
        onEdit: onTableEdit,
      },
    }));
  }, [erdData.tables, onTableEdit]);

  const initialEdges: Edge[] = useMemo(() => {
    return erdData.relationships.map((relationship) => ({
      id: relationship.id,
      source: relationship.fromTable,
      target: relationship.toTable,
      type: 'smoothstep',
      animated: true,
      label: `${relationship.fromColumn} → ${relationship.toColumn}`,
      labelStyle: { fontSize: 12, fontWeight: 500 },
      style: { stroke: '#374151', strokeWidth: 2 },
    }));
  }, [erdData.relationships]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
  );

  // Update ERD data when nodes change
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);
      
      // Update table positions in ERD data
      const updatedTables = erdData.tables.map((table) => {
        const node = nodes.find((n) => n.id === table.id);
        if (node) {
          return {
            ...table,
            position: node.position,
          };
        }
        return table;
      });

      onDataChange({
        ...erdData,
        tables: updatedTables,
      });
    },
    [onNodesChange, erdData, nodes, onDataChange]
  );

  return (
    <div className="w-full h-full bg-gray-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-gray-50"
      >
        <Background color="#aaa" gap={16} />
        <Controls />
        <MiniMap
          className="!bg-white !border-gray-300"
          nodeColor="#3b82f6"
          maskColor="rgba(0, 0, 0, 0.1)"
        />
      </ReactFlow>
    </div>
  );
};
