import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Text, Group } from 'react-konva';

// 定义常量
const CELL_WIDTH = 120;
const CELL_HEIGHT = 40;
const HEADER_HEIGHT = 40;
const TABLE_PADDING = 20;
const COLORS = {
  headerBg: '#ff6b6b',
  headerText: '#000000',
  cellBg: 'rgba(255, 255, 255, 0.05)',
  cellBgAlt: 'rgba(255, 255, 255, 0.08)',
  cellText: '#f8f8f8',
  highlightedBg: 'rgba(255, 107, 107, 0.2)',
  border: 'rgba(255, 255, 255, 0.08)'
};

const Visualization = ({ queryResults, selectedText }) => {
  const [highlightedFields, setHighlightedFields] = useState([]);
  const [tablePosition, setTablePosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const stageRef = useRef(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  
  // 计算表格尺寸
  const calculateTableSize = () => {
    if (!queryResults || queryResults.length === 0) return { width: 0, height: 0 };
    
    const headers = Object.keys(queryResults[0]);
    const width = headers.length * CELL_WIDTH + 2 * TABLE_PADDING;
    const height = HEADER_HEIGHT + queryResults.length * CELL_HEIGHT + 2 * TABLE_PADDING;
    
    return { width, height };
  };
  
  // 更新舞台尺寸
  useEffect(() => {
    const updateSize = () => {
      const container = document.querySelector('.chart-container');
      if (container) {
        setStageSize({
          width: container.offsetWidth,
          height: container.offsetHeight
        });
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // 当查询结果变化时重置表格位置
  useEffect(() => {
    if (queryResults && queryResults.length > 0) {
      setTablePosition({ x: 50, y: 50 });
    }
  }, [queryResults]);
  
  // 当选中的SQL文本变化时，更新高亮字段
  useEffect(() => {
    if (selectedText) {
      updateHighlightedFields();
    } else {
      setHighlightedFields([]);
    }
  }, [selectedText]);
  
  // 根据选中的SQL文本更新高亮字段
  const updateHighlightedFields = () => {
    if (!selectedText) return;
    
    // 解析选中的文本，提取字段名
    const fields = [];
    
    // 处理SELECT语句中的字段
    if (selectedText.includes('*')) {
      // 如果选中了*，高亮所有字段
      if (queryResults && queryResults.length > 0) {
        const firstRow = queryResults[0];
        Object.keys(firstRow).forEach(key => fields.push(key));
      }
    } else {
      // 尝试从选中文本中提取字段名
      // 移除SQL关键字，只保留字段名
      const cleanText = selectedText.replace(/SELECT|FROM|WHERE|JOIN|ON|AND|OR|GROUP BY|ORDER BY|HAVING|LIMIT|OFFSET/gi, '');
      
      // 分割并清理字段名
      const extractedFields = cleanText.split(',').map(field => {
        // 提取字段名，处理别名情况 (field AS alias)
        const fieldParts = field.trim().split(/\s+AS\s+/i);
        return fieldParts[0].trim().replace(/[^a-zA-Z0-9_]/g, '');
      }).filter(field => field.length > 0);
      
      fields.push(...extractedFields);
    }
    
    console.log('高亮字段:', fields);
    setHighlightedFields(fields);
  };

  // 处理拖拽开始
  const handleDragStart = () => {
    setIsDragging(true);
  };
  
  // 处理拖拽结束
  const handleDragEnd = (e) => {
    setIsDragging(false);
    setTablePosition({
      x: e.target.x(),
      y: e.target.y()
    });
  };

  // 渲染表格单元格
  const renderCell = (text, x, y, width, height, isHeader = false, isHighlighted = false) => {
    const bgColor = isHeader 
      ? COLORS.headerBg 
      : isHighlighted 
        ? COLORS.highlightedBg 
        : y % 2 === 0 
          ? COLORS.cellBg 
          : COLORS.cellBgAlt;
    
    const textColor = isHeader ? COLORS.headerText : COLORS.cellText;
    
    return (
      <Group key={`${x}-${y}`}>
        <Rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={bgColor}
          stroke={COLORS.border}
          strokeWidth={1}
        />
        <Text
          x={x + 5}
          y={y + height / 2 - 8}
          text={String(text)}
          fontSize={14}
          fontFamily="Arial"
          fill={textColor}
          width={width - 10}
          ellipsis={true}
        />
      </Group>
    );
  };

  // 渲染Canvas表格
  const renderCanvasTable = () => {
    if (!queryResults || queryResults.length === 0) {
      return (
        <Text
          x={stageSize.width / 2 - 50}
          y={stageSize.height / 2}
          text="暂无数据"
          fontSize={16}
          fontFamily="Arial"
        />
      );
    }
    
    const headers = Object.keys(queryResults[0]);
    const tableSize = calculateTableSize();
    
    return (
      <Group
        x={tablePosition.x}
        y={tablePosition.y}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* 渲染表头 */}
        {headers.map((header, colIndex) => {
          const x = TABLE_PADDING + colIndex * CELL_WIDTH;
          const y = TABLE_PADDING;
          const isHighlighted = highlightedFields.includes(header);
          
          return renderCell(
            header,
            x,
            y,
            CELL_WIDTH,
            HEADER_HEIGHT,
            true,
            isHighlighted
          );
        })}
        
        {/* 渲染数据行 */}
        {queryResults.map((row, rowIndex) => {
          return headers.map((header, colIndex) => {
            const x = TABLE_PADDING + colIndex * CELL_WIDTH;
            const y = TABLE_PADDING + HEADER_HEIGHT + rowIndex * CELL_HEIGHT;
            const isHighlighted = highlightedFields.includes(header);
            
            return renderCell(
              row[header],
              x,
              y,
              CELL_WIDTH,
              CELL_HEIGHT,
              false,
              isHighlighted
            );
          });
        })}
      </Group>
    );
  };
  
  return (
    <div className="visualization">
      <h2>数据可视化</h2>
      <div className="chart-container">
        <Stage width={stageSize.width} height={stageSize.height} ref={stageRef}>
          <Layer>
            {renderCanvasTable()}
          </Layer>
        </Stage>
      </div>
      <div className="visualization-info">
        <p>✨ 提示: 拖拽表格可调整位置</p>
      </div>
    </div>
  );
};

export default Visualization;