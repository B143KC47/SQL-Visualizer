import React, { useState } from 'react';

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
    <div className="sidebar">
      <h2>数据结构</h2>
      <div className="db-structure">
        <div className="db-item">
          <div className="db-name" onClick={toggleTableList}>
            {dbStructure.name}
          </div>
          {isTableListVisible && (
            <ul className="table-list">
              {dbStructure.tables.map((table, index) => (
                <li className="table-item" key={index}>
                  <div 
                    className="table-name" 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleColumnList(index);
                      handleTableClick(table.code);
                    }}
                  >
                    {table.name} ({table.code})
                  </div>
                  {expandedTables[index] && (
                    <ul className="column-list">
                      {table.columns.map((column, colIndex) => (
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