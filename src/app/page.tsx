'use client';

import React, { useState, useCallback } from 'react';
import { ERDCanvas } from '@/components/diagram/erd-canvas';
import { MermaidEditor } from '@/components/editors/mermaid-editor';
import { DDLViewer } from '@/components/editors/ddl-viewer';
import { MermaidParser } from '@/lib/mermaid-parser';
import { ERDData, Table, DatabaseType } from '@/types/erd';
import { Database, Code, FileText, Plus } from 'lucide-react';

const SAMPLE_MERMAID = `erDiagram
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
    ORDER ||--|{ LINE-ITEM : contains`;

export default function Home() {
  const [mermaidCode, setMermaidCode] = useState(SAMPLE_MERMAID);
  const [erdData, setERDData] = useState<ERDData>(() => 
    MermaidParser.parseERD(SAMPLE_MERMAID)
  );
  const [databaseType, setDatabaseType] = useState<DatabaseType>('mysql');
  const [activeTab, setActiveTab] = useState<'diagram' | 'mermaid' | 'ddl'>('diagram');

  const handleMermaidChange = useCallback((code: string) => {
    setMermaidCode(code);
  }, []);

  const handleERDChange = useCallback((newERDData: ERDData) => {
    setERDData(newERDData);
  }, []);

  const handleDiagramChange = useCallback((newERDData: ERDData) => {
    setERDData(newERDData);
    const newMermaidCode = MermaidParser.generateMermaid(newERDData);
    setMermaidCode(newMermaidCode);
  }, []);

  const handleTableEdit = useCallback((table: Table) => {
    // TODO: Implement table editing modal
    console.log('Edit table:', table);
  }, []);

  const tabs = [
    { id: 'diagram', label: 'Live Diagram', icon: Database },
    { id: 'mermaid', label: 'Mermaid Code', icon: Code },
    { id: 'ddl', label: 'DDL Script', icon: FileText },
  ] as const;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">ERD Studio</h1>
              <p className="text-sm text-gray-500">Interactive Database Design Tool</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus size={16} />
              New Table
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'diagram' && (
          <ERDCanvas
            erdData={erdData}
            onTableEdit={handleTableEdit}
            onDataChange={handleDiagramChange}
          />
        )}
        
        {activeTab === 'mermaid' && (
          <MermaidEditor
            value={mermaidCode}
            onChange={handleMermaidChange}
            onERDChange={handleERDChange}
          />
        )}
        
        {activeTab === 'ddl' && (
          <DDLViewer
            erdData={erdData}
            databaseType={databaseType}
            onDatabaseTypeChange={setDatabaseType}
          />
        )}
      </div>
    </div>
  );
}
