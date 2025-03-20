import React from 'react';
import { Tree, Card } from 'antd';
import { DatabaseOutlined, TableOutlined } from '@ant-design/icons';

const { TreeNode } = Tree;

const DatabasePanel = ({ dbStructure, onTableDrop }) => {
  // 处理拖拽开始事件
  const onDragStart = (e, tableName) => {
    e.dataTransfer.setData('tableName', tableName);
  };

  return (
    <div className="db-panel">
      <Card title="数据库结构" bordered={false} style={{ height: '100%' }}>
        {dbStructure.map((table) => (
          <div 
            key={table.name} 
            className="db-table"
            draggable
            onDragStart={(e) => onDragStart(e, table.name)}
          >
            <div className="db-table-title">
              <TableOutlined /> {table.name}
            </div>
            {table.columns.map((column) => (
              <div key={`${table.name}-${column}`} className="db-column">
                {column}
              </div>
            ))}
          </div>
        ))}
      </Card>
    </div>
  );
};

export default DatabasePanel;