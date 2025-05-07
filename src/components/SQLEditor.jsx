import React, { useState, useEffect, useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';

const SQLEditor = ({ initialSql, onQueryResult, onSelectionChange }) => {
  const [sqlQuery, setSqlQuery] = useState(initialSql || 'SELECT * FROM users;');

  // 当 initialSql prop 改变时，更新编辑器的内容，并通知父组件
  useEffect(() => {
    if (initialSql) {
      setSqlQuery(initialSql);
      if (onSelectionChange) {
        // 确保 Visualization 组件在初始加载时能获取到 SQL
        onSelectionChange(initialSql);
      }
    }
  }, [initialSql, onSelectionChange]); // 依赖于 initialSql 和 onSelectionChange

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
    if (onQueryResult) {
      onQueryResult(mockQueryResults);
    }
    // 确保当“运行查询”被点击时，Visualization组件总是能获取到编辑器当前的SQL内容。
    if (onSelectionChange) {
        onSelectionChange(sqlQuery);
    }
    alert('查询已执行！在实际应用中，这里会发送查询到后端并显示结果。');
  };

  const onChange = useCallback((value) => {
    setSqlQuery(value);
    // 实时将编辑器内容同步给父组件，以便Visualization可以实时更新
    // 如果不希望实时更新，可以只在失去焦点或特定操作时调用
    if (onSelectionChange) {
      onSelectionChange(value);
    }
  }, [onSelectionChange]);
  
  // handleSelectionChange 现在主要用于显式选择文本的场景
  // 编辑器内容的整体更改由 onChange 处理
  const handleEditorUpdate = useCallback((viewUpdate) => {
    if (viewUpdate.selectionSet) {
      const selection = viewUpdate.state.selection.main;
      if (!selection.empty) {
        const selectedTextValue = viewUpdate.state.sliceDoc(selection.from, selection.to);
        // console.log('SQLEditor 显式选中的文本:', selectedTextValue);
        // 如果用户显式选择了一段文本，我们优先使用这段文本
        if (onSelectionChange) {
          onSelectionChange(selectedTextValue);
        }
      }
      // 如果选择为空，onChange 已经处理了整个编辑器内容的传递
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
          onChange={onChange} // 编辑器内容变化时更新 sqlQuery 状态并通知父组件
          theme="dark"
          onUpdate={handleEditorUpdate} // 编辑器选择或状态更新时触发
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