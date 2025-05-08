import { useState, useCallback } from 'react'
import './App.css'
import { DatabaseStructure, SQLEditor, Visualization } from './components'
import QueryResultDisplay from './components/QueryResultDisplay';

const INITIAL_SQL_QUERY = 'SELECT id, username FROM users;';

const DEFAULT_SCHEMA = {
  name: "未加载数据库",
  tables: []
};

function App() {
  const [queryResults, setQueryResults] = useState([]);
  const [selectedText, setSelectedText] = useState(INITIAL_SQL_QUERY);
  const [databaseSchema, setDatabaseSchema] = useState(DEFAULT_SCHEMA);
  const [fileName, setFileName] = useState('');

  const handleTableClick = useCallback((tableName) => {
    console.log('选中表:', tableName);
    const newQuery = `SELECT * FROM ${tableName};`;
    setSelectedText(newQuery);
  }, []);

  const handleQueryResult = (results) => {
    console.log('App received query results:', results);
    setQueryResults(results);
  };

  const handleSelectionChange = useCallback((text) => {
    console.log('App接收到选中的SQL文本:', text);
    setSelectedText(text);
  }, []);

  const handleSchemaImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSchema = JSON.parse(e.target.result);
          if (importedSchema && importedSchema.name && Array.isArray(importedSchema.tables)) {
            setDatabaseSchema(importedSchema);
            setSelectedText(`-- 已加载数据库: '${importedSchema.name}'
-- 请选择一个表或编写查询`);
            setQueryResults([]);
          } else {
            alert('导入的JSON文件格式不正确。请确保包含 "name" 和 "tables" 数组。');
          }
        } catch (error) {
          console.error("导入JSON失败:", error);
          alert('导入JSON失败: ' + error.message);
        }
      };
      reader.onerror = (error) => {
        console.error("读取文件失败:", error);
        alert('读取文件失败: ' + error.message);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 style={{ margin: 0, fontSize: '1.2rem', marginRight: '1.5rem', flexShrink: 0 }}>SQL 可视化工具</h1>
        <input 
          type="file" 
          id="fileInput" 
          accept=".json" 
          onChange={handleSchemaImport} 
          style={{ display: 'none' }} 
        />
        <label htmlFor="fileInput" className="file-input-label">
          导入数据结构
        </label>
        <span className="file-input-text">
          {fileName ? `已加载: ${fileName}` : '选择一个 JSON 格式的数据库结构文件进行导入'}
        </span>
      </header>
      <main>
        <div className="container">
          <DatabaseStructure schema={databaseSchema} onTableClick={handleTableClick} />
          <SQLEditor
            initialSql={INITIAL_SQL_QUERY}
            onQueryResult={handleQueryResult}
            onSelectionChange={handleSelectionChange}
          />
          <div className="query-result-display-wrapper">
            <QueryResultDisplay results={queryResults} />
          </div>
          <Visualization queryResults={queryResults} selectedText={selectedText} />
        </div>
      </main>
    </div>
  )
}

export default App
