import React, { useState } from 'react';
import styles from './DatabaseStructure.module.css';

const DatabaseStructure = ({ schema, onTableClick }) => { // Accept schema as a prop
  const [isTableListVisible, setIsTableListVisible] = useState(true);
  const [expandedTables, setExpandedTables] = useState({});

  // Use the passed schema prop instead of the hardcoded one
  const dbStructure = schema;

  const toggleTableList = () => {
    setIsTableListVisible(!isTableListVisible);
  };

  const toggleColumnList = (tableIndex) => {
    setExpandedTables({
      ...expandedTables,
      [tableIndex]: !expandedTables[tableIndex]
    });
  };

  const handleTableClick = (tableCode) => {
    if (onTableClick) {
      onTableClick(tableCode);
    }
  };

  // Handle cases where schema might be loading or not yet defined
  if (!dbStructure || !dbStructure.name) {
    return (
      <div className="sidebar">
        <h2>数据结构</h2>
        <div className={styles.dbStructure}>
          <p className={styles.emptyMessage}>请先导入数据库结构文件。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sidebar"> 
      <h2>数据结构</h2> 
      <div className={styles.dbStructure}> 
        <div className={styles.dbItem}> 
          <div className={styles.dbName} onClick={toggleTableList}> 
            {dbStructure.name}
          </div>
          {isTableListVisible && dbStructure.tables && dbStructure.tables.length > 0 && (
            <ul className={styles.tableList}> 
              {dbStructure.tables.map((table, index) => (
                <li className={styles.tableItem} key={table.code || index}> {/* Use table.code for key if available */}
                  <div
                    className={styles.tableName}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleColumnList(index);
                      handleTableClick(table.code);
                    }}
                  >
                    {table.name} ({table.code})
                  </div>
                  {expandedTables[index] && table.columns && table.columns.length > 0 && (
                    <ul className={styles.columnList}> 
                      {table.columns.map((column, colIndex) => (
                        <li key={column.name || colIndex}> {/* Use column.name for key if available */}
                          {column.name} ({column.type}
                          {column.isPrimary && ', PK'}
                          {column.isForeign && ', FK'})
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
          {isTableListVisible && (!dbStructure.tables || dbStructure.tables.length === 0) && (
            <p className={styles.emptyMessage}>此数据库中没有表。</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatabaseStructure;