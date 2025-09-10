import { ERDData, Table, Column, Relationship } from '@/types/erd';

export class MermaidParser {
  static parseERD(mermaidCode: string): ERDData {
    console.log('Starting ERD parsing...');
    const tables: Table[] = [];
    const relationships: Relationship[] = [];
    
    const lines = mermaidCode.split('\n').map(line => line.trim()).filter(line => line);
    
    let currentTable: Table | null = null;
    let tableIndex = 0;
    let insideTable = false;
    
    for (const line of lines) {
      // Skip diagram declaration and comments
      if (line.startsWith('erDiagram') || line.startsWith('graph') || line.startsWith('%%')) {
        continue;
      }
      
      // Check for empty lines
      if (line.trim() === '') {
        continue;
      }
      
      // Parse table definition start (must be word followed by {, not relationship symbols)
      if (line.includes('{') && !line.includes('}') && !insideTable && !line.includes('||') && !line.includes('}o')) {
        const tableName = line.replace('{', '').trim();
        if (tableName && !tableName.includes('||') && !tableName.includes('%')) {
          currentTable = {
            id: `table_${tableName}_${tableIndex++}`,
            name: tableName,
            position: { x: (tableIndex % 4) * 300, y: Math.floor(tableIndex / 4) * 200 + 100 },
            columns: []
          };
          insideTable = true;
        }
        continue;
      }
      
      // Parse column definition inside table
      if (insideTable && currentTable && line !== '}' && !line.includes('||') && !line.includes('}o')) {
        const column = this.parseColumn(line);
        if (column) {
          currentTable.columns.push(column);
        }
        continue;
      }
      
      // End of table definition
      if (line === '}' && currentTable && insideTable) {
        tables.push(currentTable);
        currentTable = null;
        insideTable = false;
        continue;
      }
      
      // Parse relationships (outside of table definitions)
      if (!insideTable) {
        const relationship = this.parseRelationship(line);
        if (relationship) {
          relationships.push(relationship);
        }
      }
    }
    
    return { tables, relationships };
  }
  
  private static parseColumn(line: string): Column | null {
    const cleaned = line.trim();
    if (!cleaned || cleaned.includes('||') || cleaned.includes('}o') || cleaned.includes('%%')) return null;
    
    // Parse format: "type name [PK|FK] [other constraints]"
    const parts = cleaned.split(/\s+/);
    if (parts.length < 2) return null;
    
    const type = parts[0];
    const name = parts[1];
    const constraints = parts.slice(2).join(' ');
    
    return {
      id: `${name}_${Date.now()}_${Math.random()}`,
      name,
      type,
      isPrimaryKey: constraints.includes('PK'),
      isForeignKey: constraints.includes('FK'),
      isNotNull: constraints.includes('NOT NULL') || constraints.includes('PK'),
      isUnique: constraints.includes('UNIQUE') || constraints.includes('PK'),
      defaultValue: this.extractDefaultValue(constraints)
    };
  }
  
  private static parseRelationship(line: string): Relationship | null {
    // Enhanced relationship parsing for different formats with optional colon and label
    const oneToMany1 = line.match(/(\w+)\s*\|\|--o\{\s*(\w+)(?:\s*:\s*(.+))?/); // ||--o{
    const oneToMany2 = line.match(/(\w+)\s*\|\|--\|\{\s*(\w+)(?:\s*:\s*(.+))?/); // ||--|{
    const oneToOne = line.match(/(\w+)\s*\|\|--\|\|\s*(\w+)(?:\s*:\s*(.+))?/); // ||--||
    const manyToMany = line.match(/(\w+)\s*\}o--o\{\s*(\w+)(?:\s*:\s*(.+))?/); // }o--o{
    const oneToManyReverse = line.match(/(\w+)\s*\}o--\|\|\s*(\w+)(?:\s*:\s*(.+))?/); // }o--||
    
    let fromTable = '';
    let toTable = '';
    let type: 'one-to-one' | 'one-to-many' | 'many-to-many' = 'one-to-many';
    let label = '';
    
    if (oneToMany1 || oneToMany2) {
      const match = oneToMany1 || oneToMany2;
      if (match) {
        fromTable = match[1];
        toTable = match[2];
        label = match[3] || '';
        type = 'one-to-many';
      }
    } else if (oneToOne) {
      fromTable = oneToOne[1];
      toTable = oneToOne[2];
      label = oneToOne[3] || '';
      type = 'one-to-one';
    } else if (manyToMany) {
      fromTable = manyToMany[1];
      toTable = manyToMany[2];
      label = manyToMany[3] || '';
      type = 'many-to-many';
    } else if (oneToManyReverse) {
      fromTable = oneToManyReverse[2];
      toTable = oneToManyReverse[1];
      label = oneToManyReverse[3] || '';
      type = 'one-to-many';
    } else {
      return null;
    }
    
    if (!fromTable || !toTable) {
      return null;
    }

    // Smart column inference
    const fromColumn = 'id'; // Usually the primary key
    
    // Infer foreign key column name based on common naming patterns
    let toColumn = `${fromTable.toLowerCase()}_id`;
    
    // Alternative patterns to check
    const alternativePatterns = [
      `${fromTable}Id`,
      `${fromTable}_id`,
      `${fromTable.toLowerCase()}Id`,
      `id_${fromTable.toLowerCase()}`,
      fromTable.toLowerCase()
    ];
    
    const relationship = {
      id: `rel_${Date.now()}_${Math.random()}`,
      fromTable,
      toTable,
      fromColumn,
      toColumn,
      type,
      label: label.trim()
    };
    
    return relationship;
  }
  
  private static extractDefaultValue(constraints: string): string | undefined {
    const defaultMatch = constraints.match(/DEFAULT\s+([^,\s]+)/i);
    return defaultMatch ? defaultMatch[1] : undefined;
  }
  
  static generateMermaid(erdData: ERDData): string {
    let mermaid = 'erDiagram\n';
    
    // Add tables
    for (const table of erdData.tables) {
      mermaid += `    ${table.name} {\n`;
      for (const column of table.columns) {
        mermaid += `        ${column.type} ${column.name}`;
        if (column.isPrimaryKey) mermaid += ' PK';
        if (column.isForeignKey) mermaid += ' FK';
        if (column.isNotNull && !column.isPrimaryKey) mermaid += ' "NOT NULL"';
        if (column.isUnique && !column.isPrimaryKey) mermaid += ' "UNIQUE"';
        mermaid += '\n';
      }
      mermaid += '    }\n\n';
    }
    
    // Add relationships
    if (erdData.relationships.length > 0) {
      mermaid += '    %% Relationships\n';
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
    }
    
    return mermaid;
  }
}
