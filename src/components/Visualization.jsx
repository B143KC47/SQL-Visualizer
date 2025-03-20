import React, { useState, useEffect } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// 注册Chart.js组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Visualization = ({ queryResults, selectedText }) => {
  const [chartType, setChartType] = useState('bar'); // 默认显示柱状图
  const [chartData, setChartData] = useState(null);
  const [sqlVisualization, setSqlVisualization] = useState({
    tables: [],
    joins: [],
    conditions: []
  });
  
  // 当选中的SQL文本变化时，更新SQL可视化
  useEffect(() => {
    if (selectedText) {
      updateSqlVisualization();
      prepareChartData();
    } else {
      setSqlVisualization({
        tables: [],
        joins: [],
        conditions: []
      });
      setChartData(null);
    }
  }, [selectedText, queryResults]);
  
  // 准备图表数据
  const prepareChartData = () => {
    if (!queryResults || queryResults.length === 0) return;
    
    // 获取数据中的数值型字段
    const firstRow = queryResults[0];
    const numericFields = Object.keys(firstRow).filter(key => {
      return typeof firstRow[key] === 'number';
    });
    
    // 如果没有数值型字段，无法创建图表
    if (numericFields.length === 0) return;
    
    // 默认使用第一个数值字段
    const dataField = numericFields[0];
    
    // 尝试找到一个非数值字段作为标签
    const labelFields = Object.keys(firstRow).filter(key => {
      return typeof firstRow[key] !== 'number';
    });
    
    const labelField = labelFields.length > 0 ? labelFields[0] : Object.keys(firstRow)[0];
    
    // 准备图表数据
    const labels = queryResults.map(row => String(row[labelField]));
    const data = queryResults.map(row => row[dataField]);
    
    const chartData = {
      labels,
      datasets: [
        {
          label: `${dataField}`,
          data,
          backgroundColor: 'rgba(255, 107, 107, 0.5)',
          borderColor: 'rgba(255, 107, 107, 1)',
          borderWidth: 1,
        },
      ],
    };
    
    setChartData(chartData);
  };
  
  // 解析SQL语句，提取表、连接和条件信息
  const updateSqlVisualization = () => {
    if (!selectedText) return;
    
    const sqlInfo = {
      tables: [],
      joins: [],
      conditions: []
    };
    
    // 提取表名
    const fromRegex = /FROM\s+([\w\s,]+)(?:\s+WHERE|\s+JOIN|\s+GROUP BY|\s+ORDER BY|\s+LIMIT|;|$)/i;
    const fromMatch = selectedText.match(fromRegex);
    
    if (fromMatch && fromMatch[1]) {
      const tablesStr = fromMatch[1].trim();
      sqlInfo.tables = tablesStr.split(',').map(t => t.trim());
    }
    
    // 提取JOIN
    const joinRegex = /JOIN\s+(\w+)\s+ON\s+([\w\.\s=]+)/gi;
    let joinMatch;
    
    while ((joinMatch = joinRegex.exec(selectedText)) !== null) {
      if (joinMatch[1] && joinMatch[2]) {
        sqlInfo.joins.push({
          table: joinMatch[1].trim(),
          condition: joinMatch[2].trim()
        });
        
        // 添加JOIN的表到表列表
        if (!sqlInfo.tables.includes(joinMatch[1].trim())) {
          sqlInfo.tables.push(joinMatch[1].trim());
        }
      }
    }
    
    // 提取WHERE条件
    const whereRegex = /WHERE\s+([^;]+?)(?:\s+GROUP BY|\s+ORDER BY|\s+LIMIT|;|$)/i;
    const whereMatch = selectedText.match(whereRegex);
    
    if (whereMatch && whereMatch[1]) {
      const conditionsStr = whereMatch[1].trim();
      // 简单分割条件（这里只处理AND连接的简单条件）
      sqlInfo.conditions = conditionsStr.split(/\s+AND\s+/i).map(c => c.trim());
    }
    
    // 提取ORDER BY
    const orderByRegex = /ORDER\s+BY\s+([^;]+?)(?:\s+LIMIT|;|$)/i;
    const orderByMatch = selectedText.match(orderByRegex);
    
    if (orderByMatch && orderByMatch[1]) {
      const orderByStr = orderByMatch[1].trim();
      sqlInfo.orderBy = orderByStr;
    }
    
    console.log('SQL可视化信息:', sqlInfo);
    setSqlVisualization(sqlInfo);
  };
  
  // 渲染SQL可视化图表
  const renderChart = () => {
    if (!chartData) return null;
    
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: '查询结果可视化',
        },
      },
    };
    
    switch (chartType) {
      case 'bar':
        return <Bar data={chartData} options={options} />;
      case 'line':
        return <Line data={chartData} options={options} />;
      case 'pie':
        return <Pie data={chartData} options={options} />;
      default:
        return null;
    }
  };
  
  // 渲染SQL结构可视化
  const renderSqlStructure = () => {
    if (sqlVisualization.tables.length === 0) return null;
    
    return (
      <div className="sql-structure">
        <h3>SQL结构</h3>
        <div className="sql-structure-content">
          <div className="sql-tables">
            <h4>表</h4>
            <ul>
              {sqlVisualization.tables.map((table, index) => (
                <li key={index}>{table}</li>
              ))}
            </ul>
          </div>
          
          {sqlVisualization.joins.length > 0 && (
            <div className="sql-joins">
              <h4>连接</h4>
              <ul>
                {sqlVisualization.joins.map((join, index) => (
                  <li key={index}>{join.table} ON {join.condition}</li>
                ))}
              </ul>
            </div>
          )}
          
          {sqlVisualization.conditions.length > 0 && (
            <div className="sql-conditions">
              <h4>条件</h4>
              <ul>
                {sqlVisualization.conditions.map((condition, index) => (
                  <li key={index}>{condition}</li>
                ))}
              </ul>
            </div>
          )}

          {sqlVisualization.orderBy && (
            <div className="sql-order-by">
              <h4>排序</h4>
              <p>{sqlVisualization.orderBy}</p>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="visualization">
      <h2>SQL可视化</h2>
      
      {/* 可视化类型选择 */}
      <div className="visualization-controls">
        <select 
          value={chartType} 
          onChange={(e) => setChartType(e.target.value)}
          className="chart-type-select"
        >
          <option value="bar">柱状图</option>
          <option value="line">折线图</option>
          <option value="pie">饼图</option>
        </select>
      </div>
      
      {/* SQL结构可视化 */}
      {renderSqlStructure()}
      
      {/* 数据可视化区域 */}
      <div className="chart-container">
        {renderChart()}
      </div>
      
      <div className="visualization-info">
        <p>✨ 提示: 选择不同图表类型可以以不同方式可视化数据</p>
      </div>
    </div>
  );
};

export default Visualization;