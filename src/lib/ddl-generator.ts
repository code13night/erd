import { ERDData, Table, DatabaseType } from '@/types/erd';

export class DDLGenerator {
  static generateDDL(erdData: ERDData, dbType: DatabaseType): string {
    let ddl = '';
    const usedConstraintNames = new Set<string>();
    
    // Add header comment
    ddl += `-- Generated DDL for ${dbType.toUpperCase()}\n`;
    ddl += `-- Generated on ${new Date().toISOString()}\n\n`;
    
    // Generate CREATE TABLE statements
    for (const table of erdData.tables) {
      ddl += this.generateCreateTable(table, dbType);
      ddl += '\n\n';
    }
    
    // Generate foreign key constraints with unique constraint names
    for (const relationship of erdData.relationships) {
      const constraint = this.generateForeignKeyConstraint(relationship, erdData, dbType, usedConstraintNames);
      if (constraint) {
        ddl += constraint + '\n\n';
      }
    }
    
    return ddl;
  }
  
  private static generateCreateTable(table: Table, dbType: DatabaseType): string {
    let sql = `CREATE TABLE ${this.quoteIdentifier(table.name, dbType)} (\n`;
    
    const columnDefinitions: string[] = [];
    const primaryKeys: string[] = [];
    
    for (const column of table.columns) {
      let columnDef = `    ${this.quoteIdentifier(column.name, dbType)} ${this.mapDataType(column.type, dbType)}`;
      
      if (column.isNotNull || column.isPrimaryKey) {
        columnDef += ' NOT NULL';
      }
      
      if (column.isUnique && !column.isPrimaryKey) {
        columnDef += ' UNIQUE';
      }
      
      if (column.defaultValue) {
        columnDef += ` DEFAULT ${this.formatDefaultValue(column.defaultValue)}`;
      }
      
      columnDefinitions.push(columnDef);
      
      if (column.isPrimaryKey) {
        primaryKeys.push(this.quoteIdentifier(column.name, dbType));
      }
    }
    
    sql += columnDefinitions.join(',\n');
    
    if (primaryKeys.length > 0) {
      sql += `,\n    PRIMARY KEY (${primaryKeys.join(', ')})`;
    }
    
    sql += '\n);';
    
    return sql;
  }
  
  private static generateForeignKeyConstraint(
    relationship: {
      fromTable: string;
      toTable: string;
      fromColumn: string;
      toColumn: string;
    },
    erdData: ERDData,
    dbType: DatabaseType,
    usedConstraintNames: Set<string>
  ): string | null {
    const referencedTable = erdData.tables.find(t => t.name === relationship.fromTable);
    const foreignKeyTable = erdData.tables.find(t => t.name === relationship.toTable);
    
    if (!referencedTable || !foreignKeyTable) return null;
    
    // Generate a descriptive and unique constraint name
    const constraintName = this.generateUniqueConstraintName(
      relationship.toTable,
      relationship.toColumn,
      relationship.fromTable,
      relationship.fromColumn,
      usedConstraintNames
    );
    
    // Add the constraint name to the used set
    usedConstraintNames.add(constraintName);
    
    // Add foreign key constraint to the table that should contain the foreign key
    return `ALTER TABLE ${this.quoteIdentifier(relationship.toTable, dbType)}
    ADD CONSTRAINT ${this.quoteIdentifier(constraintName, dbType)}
    FOREIGN KEY (${this.quoteIdentifier(relationship.toColumn, dbType)})
    REFERENCES ${this.quoteIdentifier(relationship.fromTable, dbType)} (${this.quoteIdentifier(relationship.fromColumn, dbType)});`;
  }
  
  private static generateUniqueConstraintName(
    foreignKeyTable: string,
    foreignKeyColumn: string,
    referencedTable: string,
    referencedColumn: string,
    usedConstraintNames: Set<string>
  ): string {
    // Clean table and column names for constraint naming (remove special characters)
    const cleanFkTable = foreignKeyTable.replace(/[^a-zA-Z0-9_]/g, '');
    const cleanFkColumn = foreignKeyColumn.replace(/[^a-zA-Z0-9_]/g, '');
    const cleanRefTable = referencedTable.replace(/[^a-zA-Z0-9_]/g, '');
    const cleanRefColumn = referencedColumn.replace(/[^a-zA-Z0-9_]/g, '');
    
    // Try different naming patterns until we find a unique one
    const namingPatterns = [
      // Pattern 1: FK_[table]_[column]_[referenced_table]_[referenced_column]
      `FK_${cleanFkTable}_${cleanFkColumn}_${cleanRefTable}_${cleanRefColumn}`,
      // Pattern 2: FK_[table]_[column]_[referenced_table]
      `FK_${cleanFkTable}_${cleanFkColumn}_${cleanRefTable}`,
      // Pattern 3: FK_[table]_[referenced_table]_[column]
      `FK_${cleanFkTable}_${cleanRefTable}_${cleanFkColumn}`,
      // Pattern 4: FK_[table]_[referenced_table]
      `FK_${cleanFkTable}_${cleanRefTable}`,
    ];
    
    // Try each pattern
    for (const pattern of namingPatterns) {
      // Truncate if too long (most databases have constraint name limits around 64 chars)
      const truncatedName = pattern.length > 63 ? pattern.substring(0, 63) : pattern;
      
      if (!usedConstraintNames.has(truncatedName)) {
        return truncatedName;
      }
    }
    
    // If all patterns are taken, add a numeric suffix
    const baseName = namingPatterns[3]; // Use the shortest pattern as base
    const truncatedBase = baseName.length > 60 ? baseName.substring(0, 60) : baseName;
    
    let counter = 1;
    let uniqueName: string;
    
    do {
      uniqueName = `${truncatedBase}_${counter}`;
      counter++;
    } while (usedConstraintNames.has(uniqueName) && counter < 1000);
    
    return uniqueName;
  }
  
  private static mapDataType(type: string, dbType: DatabaseType): string {
    const typeMap: Record<DatabaseType, Record<string, string>> = {
      mysql: {
        'string': 'VARCHAR(255)',
        'text': 'TEXT',
        'int': 'INT',
        'integer': 'INT',
        'bigint': 'BIGINT',
        'decimal': 'DECIMAL(10,2)',
        'float': 'FLOAT',
        'double': 'DOUBLE',
        'boolean': 'BOOLEAN',
        'date': 'DATE',
        'datetime': 'DATETIME',
        'timestamp': 'TIMESTAMP',
        'time': 'TIME'
      },
      postgresql: {
        'string': 'VARCHAR(255)',
        'text': 'TEXT',
        'int': 'INTEGER',
        'integer': 'INTEGER',
        'bigint': 'BIGINT',
        'decimal': 'DECIMAL(10,2)',
        'float': 'REAL',
        'double': 'DOUBLE PRECISION',
        'boolean': 'BOOLEAN',
        'date': 'DATE',
        'datetime': 'TIMESTAMP',
        'timestamp': 'TIMESTAMP',
        'time': 'TIME'
      },
      sqlite: {
        'string': 'TEXT',
        'text': 'TEXT',
        'int': 'INTEGER',
        'integer': 'INTEGER',
        'bigint': 'INTEGER',
        'decimal': 'REAL',
        'float': 'REAL',
        'double': 'REAL',
        'boolean': 'INTEGER',
        'date': 'TEXT',
        'datetime': 'TEXT',
        'timestamp': 'TEXT',
        'time': 'TEXT'
      },
      sqlserver: {
        'string': 'NVARCHAR(255)',
        'text': 'NTEXT',
        'int': 'INT',
        'integer': 'INT',
        'bigint': 'BIGINT',
        'decimal': 'DECIMAL(10,2)',
        'float': 'FLOAT',
        'double': 'FLOAT',
        'boolean': 'BIT',
        'date': 'DATE',
        'datetime': 'DATETIME2',
        'timestamp': 'DATETIME2',
        'time': 'TIME'
      },
      oracle: {
        'string': 'VARCHAR2(255)',
        'text': 'CLOB',
        'int': 'NUMBER(10)',
        'integer': 'NUMBER(10)',
        'bigint': 'NUMBER(19)',
        'decimal': 'NUMBER(10,2)',
        'float': 'BINARY_FLOAT',
        'double': 'BINARY_DOUBLE',
        'boolean': 'NUMBER(1)',
        'date': 'DATE',
        'datetime': 'TIMESTAMP',
        'timestamp': 'TIMESTAMP',
        'time': 'TIMESTAMP'
      }
    };
    
    return typeMap[dbType][type.toLowerCase()] || type.toUpperCase();
  }
  
  private static quoteIdentifier(identifier: string, dbType: DatabaseType): string {
    switch (dbType) {
      case 'mysql':
        return `\`${identifier}\``;
      case 'postgresql':
      case 'sqlite':
        return `"${identifier}"`;
      case 'sqlserver':
        return `[${identifier}]`;
      case 'oracle':
        return `"${identifier.toUpperCase()}"`;
      default:
        return identifier;
    }
  }
  
  private static formatDefaultValue(value: string): string {
    // If it's a string literal, wrap in quotes
    if (isNaN(Number(value)) && !['TRUE', 'FALSE', 'NULL'].includes(value.toUpperCase())) {
      return `'${value}'`;
    }
    return value;
  }
}
