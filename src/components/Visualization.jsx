import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Text, Circle, Arrow, Group, Line } from 'react-konva';

const Visualization = ({ queryResults, selectedText }) => {
  const [sqlVisualization, setSqlVisualization] = useState({
    tables: [],
    joins: [],
    conditions: []
  });
  const [animationStep, setAnimationStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationStatus, setAnimationStatus] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1500); // 默认动画速度1.5秒
  const stageRef = useRef(null);
  const animationIntervalRef = useRef(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  
  // 当选中的SQL文本变化时，更新SQL可视化
  useEffect(() => {
    if (selectedText) {
      updateSqlVisualization();
      // 重置动画状态
      setAnimationStep(0);
      setIsAnimating(false);
      setAnimationStatus('');
    } else {
      setSqlVisualization({
        tables: [],
        joins: [],
        conditions: []
      });
    }
  }, [selectedText, queryResults]);
  
  // 设置舞台尺寸
  useEffect(() => {
    const updateStageSize = () => {
      const container = document.querySelector('.canvas-container');
      if (container) {
        setStageSize({
          width: container.offsetWidth,
          height: container.offsetHeight
        });
      }
    };
    
    updateStageSize();
    window.addEventListener('resize', updateStageSize);
    
    return () => {
      window.removeEventListener('resize', updateStageSize);
    };
  }, []);
  
  // 清理动画定时器
  useEffect(() => {
    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
    };
  }, []);
  
  // 开始SQL执行动画
  const startAnimation = () => {
    if (sqlVisualization.tables.length === 0) return;
    
    // 如果动画已暂停，则继续动画
    if (isPaused) {
      setIsPaused(false);
      return;
    }
    
    // 如果动画已经在运行，则不重新开始
    if (isAnimating && !isPaused) return;
    
    setIsAnimating(true);
    setAnimationStep(0);
    setAnimationStatus('开始执行SQL查询...');
    
    // 模拟SQL执行过程的动画
    const animationSteps = [
      { step: 0, status: '解析SQL语句...' },
      { step: 1, status: '从表中选择数据...' },
      { step: 2, status: '应用JOIN条件...' },
      { step: 3, status: '应用WHERE过滤条件...' },
      { step: 4, status: '返回查询结果' }
    ];
    
    let currentStep = 0;
    animationIntervalRef.current = setInterval(() => {
      if (isPaused) return; // 如果暂停，不执行后续步骤
      
      if (currentStep < animationSteps.length) {
        setAnimationStep(animationSteps[currentStep].step);
        setAnimationStatus(animationSteps[currentStep].status);
        currentStep++;
      } else {
        clearInterval(animationIntervalRef.current);
        setIsAnimating(false);
        setAnimationStatus('查询执行完成');
      }
    }, animationSpeed);
    
    return () => clearInterval(animationIntervalRef.current);
  };
  
  // 暂停动画
  const pauseAnimation = () => {
    if (!isAnimating) return;
    setIsPaused(true);
  };
  
  // 重置动画
  const resetAnimation = () => {
    if (animationIntervalRef.current) {
      clearInterval(animationIntervalRef.current);
    }
    setAnimationStep(0);
    setIsAnimating(false);
    setIsPaused(false);
    setAnimationStatus('');
  };
  
  // 步进动画（手动前进一步）
  const stepForward = () => {
    if (animationStep >= 4) return; // 已到最后一步
    
    // 如果动画正在运行，先暂停
    if (isAnimating && !isPaused) {
      pauseAnimation();
    }
    
    const nextStep = animationStep + 1;
    setAnimationStep(nextStep);
    
    // 更新状态描述
    const statusMessages = [
      '解析SQL语句...',
      '从表中选择数据...',
      '应用JOIN条件...',
      '应用WHERE过滤条件...',
      '返回查询结果'
    ];
    
    setAnimationStatus(statusMessages[nextStep]);
    setIsAnimating(true);
    setIsPaused(true); // 步进模式下保持暂停状态
  };
  
  // 调整动画速度
  const changeSpeed = (speedMultiplier) => {
    // 速度范围：500ms（快）到 3000ms（慢）
    const newSpeed = Math.max(500, Math.min(3000, animationSpeed * speedMultiplier));
    setAnimationSpeed(newSpeed);
    
    // 如果动画正在运行，重新启动以应用新速度
    if (isAnimating && !isPaused) {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
      startAnimation();
    }
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
  
  // 渲染Canvas上的表格
  const renderTable = (tableName, x, y, width, height, isHighlighted = false) => {
    const tableColor = isHighlighted ? '#ff6b6b' : '#4a5568';
    const textColor = '#ffffff';
    
    return (
      <Group key={tableName} x={x} y={y}>
        <Rect
          width={width}
          height={height}
          fill={tableColor}
          cornerRadius={5}
          shadowColor="black"
          shadowBlur={5}
          shadowOpacity={0.3}
          shadowOffset={{ x: 2, y: 2 }}
        />
        <Text
          text={tableName}
          fill={textColor}
          fontSize={16}
          fontStyle="bold"
          width={width}
          height={30}
          align="center"
          verticalAlign="middle"
          y={10}
        />
        
        {/* 表格数据行（动画步骤1以后显示） */}
        {animationStep >= 1 && (
          <Group y={40}>
            {[...Array(3)].map((_, i) => (
              <Rect
                key={`row-${i}`}
                width={width - 20}
                height={12}
                fill="rgba(255, 255, 255, 0.1)"
                x={10}
                y={i * 18}
                cornerRadius={2}
              />
            ))}
          </Group>
        )}
      </Group>
    );
  };
  
  // 渲染连接线
  const renderJoin = (fromX, fromY, toX, toY, isHighlighted = false) => {
    const joinColor = isHighlighted ? '#ff6b6b' : '#718096';
    
    return (
      <Group>
        <Arrow
          points={[fromX, fromY, toX, toY]}
          pointerLength={10}
          pointerWidth={10}
          fill={joinColor}
          stroke={joinColor}
          strokeWidth={2}
          dash={[5, 2]}
        />
        
        {/* 数据流动效果（JOIN步骤时显示） */}
        {isHighlighted && (
          <Circle
            x={fromX + (toX - fromX) * 0.5}
            y={fromY + (toY - fromY) * 0.5}
            radius={5}
            fill="#ffffff"
            shadowColor="white"
            shadowBlur={10}
            shadowOpacity={0.8}
          />
        )}
      </Group>
    );
  };
  
  // 渲染数据流动效果
  const renderDataFlow = (fromX, fromY, toX, toY, progress) => {
    const x = fromX + (toX - fromX) * progress;
    const y = fromY + (toY - fromY) * progress;
    
    return (
      <Circle
        x={x}
        y={y}
        radius={4}
        fill="#ffffff"
        shadowColor="white"
        shadowBlur={10}
        shadowOpacity={0.8}
      />
    );
  };
  
  // 渲染过滤器效果（WHERE条件）
  const renderFilter = (x, y, width, height, isActive) => {
    return (
      <Group x={x} y={y}>
        <Rect
          width={width}
          height={height}
          fill={isActive ? 'rgba(255, 107, 107, 0.2)' : 'rgba(255, 255, 255, 0.05)'}
          stroke={isActive ? '#ff6b6b' : '#718096'}
          strokeWidth={1}
          dash={[5, 2]}
          cornerRadius={5}
        />
        <Line
          points={[0, 0, width, height]}
          stroke={isActive ? '#ff6b6b' : '#718096'}
          strokeWidth={1}
          dash={[2, 2]}
        />
        <Line
          points={[width, 0, 0, height]}
          stroke={isActive ? '#ff6b6b' : '#718096'}
          strokeWidth={1}
          dash={[2, 2]}
        />
      </Group>
    );
  };
  
  // 渲染SQL执行过程
  const renderSqlExecution = () => {
    const tables = sqlVisualization.tables;
    const joins = sqlVisualization.joins;
    const tableWidth = 150;
    const tableHeight = 100;
    const padding = 50;
    
    // 计算表格位置
    const tablePositions = {};
    tables.forEach((table, index) => {
      const x = padding + (tableWidth + padding) * (index % 3);
      const y = padding + (tableHeight + padding) * Math.floor(index / 3);
      tablePositions[table] = { x, y };
    });
    
    // 根据动画步骤确定高亮的元素
    const highlightTable = (tableName) => {
      if (animationStep === 0) return false; // 解析阶段不高亮
      if (animationStep === 1) return true; // FROM阶段高亮所有表
      return animationStep > 1; // 后续阶段保持高亮
    };
    
    const highlightJoin = () => {
      return animationStep === 2; // JOIN阶段高亮连接
    };
    
    return (
      <Stage width={stageSize.width} height={stageSize.height} ref={stageRef}>
        <Layer>
          {/* 渲染表格 */}
          {tables.map((table) => {
            const pos = tablePositions[table];
            return renderTable(table, pos.x, pos.y, tableWidth, tableHeight, highlightTable(table));
          })}
          
          {/* 渲染连接 */}
          {joins.map((join, index) => {
            const fromTable = tables[0]; // 假设第一个表是主表
            const toTable = join.table;
            
            if (tablePositions[fromTable] && tablePositions[toTable]) {
              const fromPos = tablePositions[fromTable];
              const toPos = tablePositions[toTable];
              
              return renderJoin(
                fromPos.x + tableWidth / 2,
                fromPos.y + tableHeight / 2,
                toPos.x + tableWidth / 2,
                toPos.y + tableHeight / 2,
                highlightJoin()
              );
            }
            return null;
          })}
          
          {/* 渲染条件 */}
          {animationStep === 3 && sqlVisualization.conditions.map((condition, index) => {
            const y = stageSize.height - 50 - index * 30;
            return (
              <Text
                key={`condition-${index}`}
                text={`WHERE ${condition}`}
                x={20}
                y={y}
                fill="#ff6b6b"
                fontSize={14}
                fontStyle="bold"
              />
            );
          })}
          
          {/* 渲染结果指示 */}
          {animationStep === 4 && (
            <Group>
              <Rect
                x={stageSize.width / 2 - 100}
                y={stageSize.height - 80}
                width={200}
                height={40}
                fill="#48bb78"
                cornerRadius={5}
              />
              <Text
                text="查询结果已生成"
                x={stageSize.width / 2 - 100}
                y={stageSize.height - 80}
                width={200}
                height={40}
                fill="white"
                fontSize={16}
                fontStyle="bold"
                align="center"
                verticalAlign="middle"
              />
            </Group>
          )}
        </Layer>
      </Stage>
    );
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
      
      {/* 动画控制 */}
      <div className="visualization-controls">
        <button 
          className="animation-btn" 
          onClick={startAnimation}
          disabled={sqlVisualization.tables.length === 0}
        >
          {isAnimating && !isPaused ? '动画执行中...' : isPaused ? '继续' : '执行SQL动画'}
        </button>
        
        {isAnimating && (
          <>
            <button 
              className="animation-btn" 
              onClick={pauseAnimation}
              disabled={isPaused || !isAnimating}
            >
              暂停
            </button>
            
            <button 
              className="animation-btn" 
              onClick={resetAnimation}
            >
              重置
            </button>
            
            <button 
              className="animation-btn" 
              onClick={stepForward}
              disabled={animationStep >= 4 || (!isAnimating && !isPaused)}
            >
              下一步
            </button>
            
            <div className="speed-controls">
              <button 
                className="speed-btn" 
                onClick={() => changeSpeed(0.5)}
                title="减慢速度"
              >
                慢速
              </button>
              <button 
                className="speed-btn" 
                onClick={() => changeSpeed(2)}
                title="加快速度"
              >
                快速
              </button>
            </div>
          </>
        )}
      </div>
      
      {/* 动画状态显示 */}
      {animationStatus && (
        <div className="animation-status">
          <div className="animation-step-indicator">
            <div className={`step ${animationStep === 0 ? 'active' : ''}`}>解析SQL</div>
            <div className={`step ${animationStep === 1 ? 'active' : ''}`}>选择数据</div>
            <div className={`step ${animationStep === 2 ? 'active' : ''}`}>JOIN</div>
            <div className={`step ${animationStep === 3 ? 'active' : ''}`}>WHERE</div>
            <div className={`step ${animationStep === 4 ? 'active' : ''}`}>结果</div>
          </div>
          <div className="animation-description">
            {animationStatus}
          </div>
        </div>
      )}
      
      {/* Canvas容器 */}
      <div className="canvas-container">
        {renderSqlExecution()}
      </div>
      
      {/* SQL结构信息 */}
      {renderSqlStructure()}
    </div>
)

}

export default Visualization;