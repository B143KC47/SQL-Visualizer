import React, { useState, useEffect, useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import styles from './SQLEditor.module.css'; // Import the CSS module

const SQLEditor = ({ initialSql, onQueryResult, onSelectionChange }) => {
  const [sqlQuery, setSqlQuery] = useState(initialSql || 'SELECT * FROM users;');

  useEffect(() => {
    if (initialSql) {
      setSqlQuery(initialSql);
      if (onSelectionChange) {
        onSelectionChange(initialSql);
      }
    }
  }, [initialSql, onSelectionChange]);

  const executeQuery = () => {
    console.log('执行SQL查询:', sqlQuery);
    const consistentMockResults = [
        { id: 1, username: '张三', email: 'zhangsan@example.com', created_at: '2023-01-15' },
        { id: 2, username: '李四', email: 'lisi@example.com', created_at: '2023-01-20' },
        { id: 3, username: '王五', email: 'wangwu@example.com', created_at: '2023-01-25' },
    ];
    if (onQueryResult) {
      onQueryResult(consistentMockResults);
    }
    if (onSelectionChange) {
        onSelectionChange(sqlQuery);
    }
  };

  const onChange = useCallback((value) => {
    setSqlQuery(value);
    if (onSelectionChange) {
      onSelectionChange(value);
    }
  }, [onSelectionChange]);
  
  const handleEditorUpdate = useCallback((viewUpdate) => {
    if (viewUpdate.selectionSet) {
      const selection = viewUpdate.state.selection.main;
      if (!selection.empty) {
        const selectedTextValue = viewUpdate.state.sliceDoc(selection.from, selection.to);
        if (onSelectionChange) {
          onSelectionChange(selectedTextValue);
        }
      }
    }
  }, [onSelectionChange]);

  return (
    <div className="main-content"> 
      <div className={styles.sqlEditorContainer}> 
        <h2>查询编辑器</h2>
        <div className={styles.editorWrapper}>
          <CodeMirror
            value={sqlQuery}
            className={styles.codeEditor}
            extensions={[sql()]}
            onChange={onChange}
            theme="dark"
            onUpdate={handleEditorUpdate}
          />
        </div>
        <button onClick={executeQuery} className={styles.runQueryButton}>运行查询</button>
      </div>
    </div>
  );
};

export default SQLEditor;