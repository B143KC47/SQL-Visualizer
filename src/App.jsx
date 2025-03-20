import React, { useState, useEffect } from 'react';
import { Layout, Spin } from 'antd';
import DatabasePanel from './components/DatabasePanel';
import SQLEditor from './components/SQLEditor';
import QueryStructure from './components/QueryStructure';
import VisualizationPanel from './components/VisualizationPanel';
import { io } from 'socket.io-client';
import './App.css';

const { Header, Sider, Content } = Layout;

const App = () => {
  const [loading, setLoading] = useState(false);
  const [sqlQuery, setSqlQuery] = useState('');
  const [queryResult, setQueryResult] = useState(null);
  const [dbStructure, setDbStructure] = useState([]);
  const [queryStructure, setQueryStructure] = useState(null);
  const [socket, setSocket] = useState(null);
  
  // 初始化WebSocket连接
  useEffect(() => {
    // 实际项目中，这里应该连接到后端服务器
    // 目前使用模拟数据
    // const newSocket = io('http://localhost:5000');
    // setSocket(newSocket);
    
    // 模拟数据库结构
    const mockDbStructure = [
      {
        name: 'users',
        columns: ['id', 'name', 'email', 'created_at']
      },
      {
        name: 'orders',
        columns: ['id', 'user_id', 'product_id', 'quantity', 'order_date']
      },
      {
        name: 'products',
        columns: ['id', 'name', 'price', 'category']
      }
    ];
    setDbStructure(mockDbStructure);
    
    // 清理函数
    return () => {
      // if (newSocket) newSocket.disconnect();
    };
  }, []);
  
  // 处理SQL查询
  const handleSqlChange = (value) => {
    setSqlQuery(value);
    
    // 模拟SQL解析和查询结果
    if (value.trim()) {
      // 简单的SQL解析逻辑，实际项目中应该使用专业的SQL解析器
      const isSelect = value.toLowerCase().includes('select');
      const hasWhere = value.toLowerCase().includes('where');
      const hasJoin = value.toLowerCase().includes('join');
      
      // 模拟查询结构
      const structure = {
        type: isSelect ? 'SELECT' : '',
        tables: [],
        columns: [],
        conditions: hasWhere ? ['模拟条件'] : [],
        joins: hasJoin ? ['模拟JOIN'] : []
      };
      
      // 提取表名（非常简化的逻辑）
      dbStructure.forEach(table => {
        if (value.toLowerCase().includes(table.name.toLowerCase())) {
          structure.tables.push(table.name);
          // 提取列名（非常简化的逻辑）
          table.columns.forEach(col => {
            if (value.toLowerCase().includes(col.toLowerCase())) {
              structure.columns.push(col);
            }
          });
        }
      });
      
      setQueryStructure(structure);
      
      // 模拟查询结果
      const mockResult = {
        columns: structure.columns.length > 0 ? structure.columns : ['id', 'name', 'value'],
        rows: [
          { id: 1, name: 'Item 1', value: 100, email: 'user1@example.com', created_at: '2023-01-01' },
          { id: 2, name: 'Item 2', value: 200, email: 'user2@example.com', created_at: '2023-01-02' },
          { id: 3, name: 'Item 3', value: 150, email: 'user3@example.com', created_at: '2023-01-03' },
        ],
        highlightInfo: {
          type: isSelect ? 'SELECT' : '',
          columns: structure.columns,
          whereConditions: hasWhere ? [{ column: 'value', condition: '> 100' }] : [],
          joinInfo: hasJoin ? { tables: ['users', 'orders'], on: ['users.id', 'orders.user_id'] } : null
        }
      };
      
      setQueryResult(mockResult);
    } else {
      setQueryStructure(null);
      setQueryResult(null);
    }
  };
  
  // 处理表名拖拽到编辑器
  const handleTableDrop = (tableName) => {
    setSqlQuery(prev => `${prev} ${tableName}`);
  };
  
  return (
    <Layout style={{ height: '100vh' }}>
      <Header className="header">
        <h1 style={{ color: 'white' }}>SQL Visualizer</h1>
      </Header>
      <Layout>
        <Sider width={250} className="site-layout-background">
          <DatabasePanel dbStructure={dbStructure} onTableDrop={handleTableDrop} />
        </Sider>
        <Layout style={{ padding: '0 24px 24px' }}>
          <Content className="site-layout-background" style={{ padding: 24, margin: 0, minHeight: 280 }}>
            <div className="main-content">
              <div className="editor-section">
                <SQLEditor value={sqlQuery} onChange={handleSqlChange} />
                <QueryStructure structure={queryStructure} />
              </div>
              <div className="visualization-section">
                {loading ? (
                  <Spin size="large" />
                ) : (
                  <VisualizationPanel queryResult={queryResult} />
                )}
              </div>
            </div>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default App;