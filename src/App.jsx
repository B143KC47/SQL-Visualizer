import { useState } from 'react'
import './App.css'
import { DatabaseStructure, SQLEditor, Visualization } from './components'

function App() {
  const [queryResults, setQueryResults] = useState([]);
  const [selectedText, setSelectedText] = useState('');

  // 处理表名点击，将表名插入到SQL编辑器
  const handleTableClick = (tableName) => {
    console.log('选中表:', tableName);
    // 在实际应用中，这里应该将表名传递给SQL编辑器组件
  };

  // 处理查询结果，更新可视化组件
  const handleQueryResult = (results) => {
    console.log('查询结果:', results);
    setQueryResults(results);
  };

  // 处理SQL编辑器中的文本选择
  const handleSelectionChange = (text) => {
    console.log('选中的SQL文本:', text);
    setSelectedText(text);
  };

  return (
    <div className="app-container">
      <main>
        <div className="container">
          <DatabaseStructure onTableClick={handleTableClick} />
          <SQLEditor onQueryResult={handleQueryResult} onSelectionChange={handleSelectionChange} />
          <Visualization queryResults={queryResults} selectedText={selectedText} />
        </div>
      </main>
    </div>
  )
}

export default App
