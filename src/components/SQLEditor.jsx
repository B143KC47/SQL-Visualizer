import React, { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { EditorSelection } from '@codemirror/state';

const SQLEditor = ({ onQueryResult, onSelectionChange }) => {
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM users JOIN orders ON users.id = orders.user_id;');
  
  // 模拟查询结果数据
  const mockQueryResults = [
    {
      id: 1,
      username: '张三',
      email: 'zhangsan@example.com',
      created_at: '2023-01-15',
      order_id: 101,
      amount: 199.99,
      order_date: '2023-02-20'
    },
    {
      id: 1,
      username: '张三',
      email: 'zhangsan@example.com',
      created_at: '2023-01-15',
      order_id: 102,
      amount: 299.50,
      order_date: '2023-03-10'
    },
    {
      id: 2,
      username: '李四',
      email: 'lisi@example.com',
      created_at: '2023-01-20',
      order_id: 103,
      amount: 99.99,
      order_date: '2023-02-25'
    }
  ];

  const executeQuery = () => {
    console.log('执行SQL查询:', sqlQuery);
    
    // 在实际应用中，这里应该发送查询到后端
    // 为了演示，我们使用模拟数据
    if (onQueryResult) {
      onQueryResult(mockQueryResults);
    }
    
    // 显示执行成功消息
    alert('查询已执行！在实际应用中，这里会发送查询到后端并显示结果。');
  };

  const onChange = React.useCallback((value) => {
    setSqlQuery(value);
  }, []);
  
  // 处理编辑器中的选择事件
  const handleSelectionChange = React.useCallback((viewUpdate) => {
    if (viewUpdate.selectionSet) {
      const selection = viewUpdate.state.selection.main;
      if (!selection.empty) {
        const selectedText = viewUpdate.state.sliceDoc(selection.from, selection.to);
        console.log('选中的文本:', selectedText);
        if (onSelectionChange) {
          onSelectionChange(selectedText);
        }
      }
    }
  }, [onSelectionChange]);

  return (
    <div className="main-content">
      <div className="sql-editor-container">
        <h2>查询编辑器</h2>
        <CodeMirror
          value={sqlQuery}
          height="150px"
          extensions={[sql()]}
          onChange={onChange}
          theme="dark"
          onUpdate={handleSelectionChange}
        />
        <button onClick={executeQuery} className="btn">运行查询</button>
      </div>
      
      <div className="query-result-container">
        <h2>查询结果</h2>
        <div className="query-result">
          <table id="result-table">
            <thead>
              <tr>
                <th>id</th>
                <th>username</th>
                <th>email</th>
                <th>created_at</th>
                <th>order_id</th>
                <th>amount</th>
                <th>order_date</th>
              </tr>
            </thead>
            <tbody>
              {mockQueryResults.map((row, index) => (
                <tr key={index}>
                  <td>{row.id}</td>
                  <td>{row.username}</td>
                  <td>{row.email}</td>
                  <td>{row.created_at}</td>
                  <td>{row.order_id}</td>
                  <td>{row.amount}</td>
                  <td>{row.order_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SQLEditor;