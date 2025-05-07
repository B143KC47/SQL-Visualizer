import React, { useState } from 'react';
import styles from './DatabaseStructure.module.css'; // Import CSS module

const DatabaseStructure = ({ onTableClick }) => {
  const [isTableListVisible, setIsTableListVisible] = useState(true);
  const [expandedTables, setExpandedTables] = useState({});

  // 模拟数据库结构数据
  const dbStructure = {
    name: '示例数据库',
    tables: [
      {
        name: '用户表',
        code: 'users',
        columns: [
          { name: 'id', type: 'INT', isPrimary: true },
          { name: 'username', type: 'VARCHAR' },
          { name: 'email', type: 'VARCHAR' },
          { name: 'created_at', type: 'DATETIME' }
        ]
      },
      {
        name: '订单表',
        code: 'orders',
        columns: [
          { name: 'id', type: 'INT', isPrimary: true },
          { name: 'user_id', type: 'INT', isForeign: true },
          { name: 'amount', type: 'DECIMAL' },
          { name: 'order_date', type: 'DATETIME' }
        ]
      }
    ]
  };

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

  return (
    <div className="sidebar"> {/* Keep 'sidebar' for App.css grid layout */}
      <h2>数据结构</h2> {/* Global h2 style from App.css */}
      <div className={styles.dbStructure}> {/* Use styles.dbStructure */}
        <div className={styles.dbItem}> {/* Use styles.dbItem */}
          <div className={styles.dbName} onClick={toggleTableList}> {/* Use styles.dbName */}
            {dbStructure.name}
          </div>
          {isTableListVisible && (
            <ul className={styles.tableList}> {/* Use styles.tableList */}
              {dbStructure.tables.map((table, index) => (
                <li className={styles.tableItem} key={index}> {/* Use styles.tableItem */}
                  <div
                    className={styles.tableName} // Use styles.tableName
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleColumnList(index);
                      handleTableClick(table.code);
                    }}
                  >
                    {table.name} ({table.code})
                  </div>
                  {expandedTables[index] && (
                    <ul className={styles.columnList}> {/* Use styles.columnList */}
                      {table.columns.map((column, colIndex) => (
                        // li elements under columnList are styled by .columnList li in the CSS module
                        <li key={colIndex}>
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
        </div>
      </div>
    </div>
  );
};

export default DatabaseStructure;