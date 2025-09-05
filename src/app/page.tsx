'use client';

import React, { useState, useCallback } from 'react';
import { ERDCanvas } from '@/components/diagram/erd-canvas';
import { MermaidEditor } from '@/components/editors/mermaid-editor';
import { DDLViewer } from '@/components/editors/ddl-viewer';
import { MermaidParser } from '@/lib/mermaid-parser';
import { ERDData, Table, DatabaseType } from '@/types/erd';
import { Database, Code, FileText, Plus, ChevronLeft, ChevronRight, X } from 'lucide-react';

const SAMPLE_MERMAID = `erDiagram
    User {
        int id PK
        string name
        string email
    }
    Post {
        int id PK
        string title
        int user_id FK
    }
    
    User ||--o{ Post : writes`;

export default function Home() {
  const [mermaidCode, setMermaidCode] = useState(SAMPLE_MERMAID);
  const [erdData, setERDData] = useState<ERDData>(() => 
    MermaidParser.parseERD(SAMPLE_MERMAID)
  );
  const [databaseType, setDatabaseType] = useState<DatabaseType>('mysql');
  const [mermaidSidebarOpen, setMermaidSidebarOpen] = useState(false);
  const [ddlSidebarOpen, setDDLSidebarOpen] = useState(false);

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
            <button
              onClick={() => setMermaidSidebarOpen(!mermaidSidebarOpen)}
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                mermaidSidebarOpen 
                  ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Code size={16} />
              Mermaid
            </button>
            
            <button
              onClick={() => setDDLSidebarOpen(!ddlSidebarOpen)}
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                ddlSidebarOpen 
                  ? 'bg-green-100 text-green-700 border border-green-300' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FileText size={16} />
              DDL
            </button>
            
            <div className="w-px h-6 bg-gray-300 mx-2" />
            
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus size={16} />
              New Table
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Mermaid Editor */}
        <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
          mermaidSidebarOpen ? 'w-96' : 'w-0'
        } overflow-hidden`}>
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-blue-50">
              <div className="flex items-center gap-2">
                <Code size={16} className="text-blue-600" />
                <h3 className="text-sm font-medium text-blue-800">Mermaid Code</h3>
              </div>
              <button
                onClick={() => setMermaidSidebarOpen(false)}
                className="p-1 hover:bg-blue-200 rounded transition-colors"
              >
                <X size={16} className="text-blue-600" />
              </button>
            </div>
            <div className="flex-1">
              <MermaidEditor
                value={mermaidCode}
                onChange={handleMermaidChange}
                onERDChange={handleERDChange}
              />
            </div>
          </div>
        </div>

        {/* Central Canvas Area */}
        <div className="flex-1 relative">
          <ERDCanvas
            erdData={erdData}
            onTableEdit={handleTableEdit}
            onDataChange={handleDiagramChange}
          />
          
          {/* Sidebar Toggle Buttons */}
          <div className="absolute left-4 top-4 flex flex-col gap-2">
            {!mermaidSidebarOpen && (
              <button
                onClick={() => setMermaidSidebarOpen(true)}
                className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 transition-colors text-xs"
              >
                <ChevronRight size={12} />
                <Code size={12} />
                Code
              </button>
            )}
          </div>
          
          <div className="absolute right-4 top-4 flex flex-col gap-2">
            {!ddlSidebarOpen && (
              <button
                onClick={() => setDDLSidebarOpen(true)}
                className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 transition-colors text-xs"
              >
                <FileText size={12} />
                DDL
                <ChevronLeft size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Right Sidebar - DDL Viewer */}
        <div className={`bg-white border-l border-gray-200 transition-all duration-300 ${
          ddlSidebarOpen ? 'w-96' : 'w-0'
        } overflow-hidden`}>
          <div className="h-full flex flex-col min-h-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-green-50">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-green-600" />
                <h3 className="text-sm font-medium text-green-800">DDL Script</h3>
              </div>
              <button
                onClick={() => setDDLSidebarOpen(false)}
                className="p-1 hover:bg-green-200 rounded transition-colors"
              >
                <X size={16} className="text-green-600" />
              </button>
            </div>
            <div className="flex-1 min-h-0">
              <DDLViewer
                erdData={erdData}
                databaseType={databaseType}
                onDatabaseTypeChange={setDatabaseType}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
