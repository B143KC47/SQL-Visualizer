import { useState } from 'react'
import './App.css'
import { DatabaseStructure, SQLEditor, Visualization } from './components'

// 使用更完整的SQL查询进行测试，包含多种字句
const INITIAL_SQL_QUERY = 'SELECT users.id, users.username, orders.order_id, orders.amount FROM users JOIN orders ON users.id = orders.user_id WHERE users.id = 1 GROUP BY users.username, users.id, orders.order_id, orders.amount HAVING COUNT(orders.id) > 0 ORDER BY users.created_at DESC;';

function App() {
  const [queryResults, setQueryResults] = useState([]);
  // App组件控制selectedText的初始值和当前值
  const [selectedText, setSelectedText] = useState(INITIAL_SQL_QUERY);

  const handleTableClick = (tableName) => {
    console.log('选中表:', tableName);
    // 示例：可以考虑更新查询，例如:
    // const newQuery = `SELECT * FROM ${tableName};`;
    // setSelectedText(newQuery); // 这会触发SQLEditor和Visualization的更新
  };

  const handleQueryResult = (results) => {
    console.log('查询结果:', results);
    setQueryResults(results);
  };

  // 当SQLEditor中的选择发生变化或内容被程序化更改时，更新App的selectedText
  const handleSelectionChange = (text) => {
    console.log('App接收到选中的SQL文本:', text);
    setSelectedText(text);
  };

  return (
    <div className="app-container">
      <main>
        <div className="container">
          <DatabaseStructure onTableClick={handleTableClick} />
          <SQLEditor
            initialSql={INITIAL_SQL_QUERY} // 将初始SQL传递给SQLEditor
            onQueryResult={handleQueryResult}
            onSelectionChange={handleSelectionChange} // 当编辑器选择或内容改变时，通知App
          />
          <Visualization queryResults={queryResults} selectedText={selectedText} />
        </div>
      </main>
    </div>
  )
}

export default App
