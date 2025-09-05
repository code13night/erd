import { ERDData, Table, Column, Relationship } from '@/types/erd';

export class MermaidParser {
  static parseERD(mermaidCode: string): ERDData {
    const tables: Table[] = [];
    const relationships: Relationship[] = [];
    
    const lines = mermaidCode.split('\n').map(line => line.trim()).filter(line => line);
    
    let currentTable: Table | null = null;
    let tableIndex = 0;
    
    for (const line of lines) {
      // Skip diagram declaration
      if (line.startsWith('erDiagram') || line.startsWith('graph')) {
        continue;
      }
      
      // Parse table definition
      if (line.includes('{') && !line.includes('}')) {
        const tableName = line.replace('{', '').trim();
        currentTable = {
          id: `table_${tableIndex++}`,
          name: tableName,
          position: { x: tableIndex * 250, y: 100 },
          columns: []
        };
        continue;
      }
      
      // Parse column definition
      if (currentTable && line !== '}' && !line.includes('||') && !line.includes('}o')) {
        const column = this.parseColumn(line);
        if (column) {
          currentTable.columns.push(column);
        }
        continue;
      }
      
      // End of table definition
      if (line === '}' && currentTable) {
        tables.push(currentTable);
        currentTable = null;
        continue;
      }
      
      // Parse relationships
      const relationship = this.parseRelationship(line);
      if (relationship) {
        relationships.push(relationship);
      }
    }
    
    return { tables, relationships };
  }
  
  private static parseColumn(line: string): Column | null {
    const cleaned = line.trim();
    if (!cleaned) return null;
    
    const parts = cleaned.split(/\s+/);
    if (parts.length < 2) return null;
    
    const type = parts[0];
    const name = parts[1];
    
    return {
      id: `${name}_${Date.now()}`,
      name,
      type,
      isPrimaryKey: cleaned.includes('PK'),
      isForeignKey: cleaned.includes('FK'),
      isNotNull: cleaned.includes('NOT NULL'),
      isUnique: cleaned.includes('UNIQUE'),
      defaultValue: this.extractDefaultValue(cleaned)
    };
  }
  
  private static parseRelationship(line: string): Relationship | null {
    // Simple relationship parsing - can be enhanced
    const oneToMany = line.match(/(\w+)\s*\|\|--o\{\s*(\w+)/);
    const oneToOne = line.match(/(\w+)\s*\|\|--\|\|\s*(\w+)/);
    const manyToMany = line.match(/(\w+)\s*\}o--o\{\s*(\w+)/);
    
    if (oneToMany) {
      return {
        id: `rel_${Date.now()}`,
        fromTable: oneToMany[1],
        toTable: oneToMany[2],
        fromColumn: 'id',
        toColumn: `${oneToMany[1]}_id`,
        type: 'one-to-many'
      };
    }
    
    if (oneToOne) {
      return {
        id: `rel_${Date.now()}`,
        fromTable: oneToOne[1],
        toTable: oneToOne[2],
        fromColumn: 'id',
        toColumn: `${oneToOne[1]}_id`,
        type: 'one-to-one'
      };
    }
    
    if (manyToMany) {
      return {
        id: `rel_${Date.now()}`,
        fromTable: manyToMany[1],
        toTable: manyToMany[2],
        fromColumn: 'id',
        toColumn: 'id',
        type: 'many-to-many'
      };
    }
    
    return null;
  }
  
  private static extractDefaultValue(line: string): string | undefined {
    const defaultMatch = line.match(/DEFAULT\s+([^,\s]+)/i);
    return defaultMatch ? defaultMatch[1] : undefined;
  }
  
  static generateMermaid(erdData: ERDData): string {
    let mermaid = 'erDiagram\n\n';
    
    // Add tables
    for (const table of erdData.tables) {
      mermaid += `    ${table.name} {\n`;
      for (const column of table.columns) {
        mermaid += `        ${column.type} ${column.name}`;
        if (column.isPrimaryKey) mermaid += ' PK';
        if (column.isForeignKey) mermaid += ' FK';
        if (column.isNotNull) mermaid += ' "NOT NULL"';
        if (column.isUnique) mermaid += ' "UNIQUE"';
        mermaid += '\n';
      }
      mermaid += '    }\n\n';
    }
    
    // Add relationships
    for (const rel of erdData.relationships) {
      let relationSymbol = '';
      switch (rel.type) {
        case 'one-to-one':
          relationSymbol = '||--||';
          break;
        case 'one-to-many':
          relationSymbol = '||--o{';
          break;
        case 'many-to-many':
          relationSymbol = '}o--o{';
          break;
      }
      mermaid += `    ${rel.fromTable} ${relationSymbol} ${rel.toTable} : "${rel.fromColumn} to ${rel.toColumn}"\n`;
    }
    
    return mermaid;
  }
}
