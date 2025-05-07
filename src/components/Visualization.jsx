import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Text, Circle, Arrow, Group, Line } from 'react-konva';

const Visualization = ({ queryResults, selectedText }) => {
  const [sqlVisualization, setSqlVisualization] = useState({
    tables: [],
    joins: [],
    conditions: [],
    selectColumns: [],
    whereCells: [],
    orderBy: null,
    groupByColumns: [],
    havingConditions: []
  });
  const [animationStep, setAnimationStep] = useState(-1); // -1: 初始/无SQL, 0+: 动画步骤
  const [isAnimating, setIsAnimating] = useState(false); // 动画是否正在进行
  const [animationStatus, setAnimationStatus] = useState('请运行一个SQL查询以查看可视化。'); // 初始提示信息
  const [animationSpeed, setAnimationSpeed] = useState(1500); // 动画自动播放的速度
  const stageRef = useRef(null);
  const animationIntervalRef = useRef(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const konvaWrapperRef = useRef(null);

  useEffect(() => {
    if (selectedText) {
      updateSqlVisualization(); // 解析SQL并可能触发动画
    } else {
      // 清理状态，显示初始提示
      setSqlVisualization({
        tables: [],
        joins: [],
        conditions: [],
        selectColumns: [],
        whereCells: [],
        orderBy: null,
        groupByColumns: [],
        havingConditions: []
      });
      setAnimationStep(-1);
      setAnimationStatus('请运行一个SQL查询以查看可视化。');
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
      setIsAnimating(false);
    }
  }, [selectedText]); // 依赖于 selectedText

  useEffect(() => {
    const updateStageSize = () => {
      const container = konvaWrapperRef.current;
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

  useEffect(() => {
    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
    };
  }, []);

  const startAnimation = () => {
    if (sqlVisualization.tables.length === 0) {
      setAnimationStatus('无法解析SQL或SQL为空，无法开始动画。');
      setIsAnimating(false);
      setAnimationStep(-1); // 确保回到初始无动画状态
      return;
    }

    if (animationIntervalRef.current) { // 如果已有动画在跑，先清除
      clearInterval(animationIntervalRef.current);
    }

    setIsAnimating(true);
    setAnimationStep(0); // 从第一步开始

    const baseAnimationSteps = [
      { step: 0, status: '解析SQL结构...' },
      { step: 1, status: 'SELECT: 选择列...' },
      { step: 2, status: 'FROM: 定位表...' },
      { step: 3, status: 'JOIN: 应用连接条件...' },
      { step: 4, status: 'WHERE: 应用过滤条件...' },
      { step: 5, status: 'GROUP BY: 执行分组...' },
      { step: 6, status: 'HAVING: 过滤分组...' },
      { step: 7, status: 'ORDER BY: 执行排序...' },
      { step: 8, status: '返回查询结果' }
    ];

    // 根据当前SQL结构确定实际存在的步骤
    const actualSteps = baseAnimationSteps.filter(s => {
        if (s.step === 3 && sqlVisualization.joins.length === 0) return false;
        if (s.step === 4 && sqlVisualization.conditions.length === 0) return false;
        if (s.step === 5 && sqlVisualization.groupByColumns.length === 0) return false;
        if (s.step === 6 && sqlVisualization.havingConditions.length === 0) return false;
        if (s.step === 7 && !sqlVisualization.orderBy) return false;
        // 步骤 0, 1, 2, 8 总是存在（如果表存在）
        return true;
    });
    
    if (actualSteps.length === 0) {
        setIsAnimating(false);
        setAnimationStatus('没有可执行的动画步骤。');
        setAnimationStep(-1);
        return;
    }
    
    setAnimationStatus(actualSteps[0].status); // 设置第一个实际步骤的状态

    let currentActualStepIndex = 0;
    animationIntervalRef.current = setInterval(() => {
      if (currentActualStepIndex < actualSteps.length) {
        const currentStepInfo = actualSteps[currentActualStepIndex];
        setAnimationStep(currentStepInfo.step);
        setAnimationStatus(currentStepInfo.status);
        currentActualStepIndex++;
      } else {
        clearInterval(animationIntervalRef.current);
        setIsAnimating(false);
        const lastStepInfo = actualSteps[actualSteps.length - 1];
        if (lastStepInfo.step === 8) {
            setAnimationStatus('查询执行完成');
        } else {
            setAnimationStatus(lastStepInfo.status + ' (完成)');
        }
        // 动画结束，但保持在最后一步的视觉状态
        setAnimationStep(lastStepInfo.step);
      }
    }, animationSpeed);
  };

  const updateSqlVisualization = () => {
    if (!selectedText) {
      // 此情况已在useEffect中处理，但作为防御性编程保留
      setSqlVisualization({ tables: [], joins: [], conditions: [], selectColumns: [], whereCells: [], orderBy: null, groupByColumns: [], havingConditions: [] });
      setAnimationStep(-1);
      setIsAnimating(false);
      setAnimationStatus('SQL文本为空。');
      if (animationIntervalRef.current) clearInterval(animationIntervalRef.current);
      return;
    }

    const sqlInfo = { /* 初始化为空结构 */ };

    // 使用正则表达式解析 selectedText
    // 例如:
    const selectRegex = /SELECT\s+(.+?)\s+FROM/i;
    const selectMatch = selectedText.match(selectRegex);
    if (selectMatch && selectMatch[1]) {
      // ... 解析 SELECT 列 ...
      // sqlInfo.selectColumns = ...
    }

    const fromRegex = /FROM\s+([\w\s,]+)(?:\s+WHERE|\s+JOIN|...)/i;
    const fromMatch = selectedText.match(fromRegex);
    if (fromMatch && fromMatch[1]) {
      // ... 解析 FROM 表 ...
      // sqlInfo.tables = ...
    }

    // 类似地解析 JOIN, WHERE, GROUP BY, HAVING, ORDER BY
    // ...

    // 对于 WHERE 子句中的条件，进一步解析出列和值用于高亮
    // if (whereMatch && whereMatch[1]) {
    //   sqlInfo.conditions = ...
    //   sqlInfo.whereCells = [];
    //   sqlInfo.conditions.forEach(condition => {
    //     const cellValueMatch = condition.match(/([\w\.]+)\s*=\s*['"]?([^'"\s;]+)['"]?/i);
    //     if (cellValueMatch && cellValueMatch[2]) {
    //       sqlInfo.whereCells.push({
    //         column: cellValueMatch[1].trim(),
    //         value: cellValueMatch[2].trim()
    //       });
    //     }
    //   });
    // }

    setSqlVisualization(sqlInfo); // 更新存储解析结果的状态

    if (sqlInfo.tables && sqlInfo.tables.length > 0) {
      startAnimation(); // 如果成功解析出表，则开始动画
    } else {
      // 未能解析出有效信息，重置动画状态
      setAnimationStatus('未能从SQL中解析出有效信息进行可视化。');
      setAnimationStep(-1);
      setIsAnimating(false);
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
    }
  };
  
  const renderTable = (tableName, x, y, width, height, isHighlighted = false) => {
    const tableColor = isHighlighted ? '#e53e3e' : '#007bff';
    const textColor = '#ffffff';

    const hasSelectedColumns = sqlVisualization.selectColumns.some(col => {
      if (col === '*') return true;
      if (col.includes('.')) {
        const [tablePrefix] = col.split('.');
        return tablePrefix === tableName;
      }
      return true;
    });

    const hasWhereCells = sqlVisualization.whereCells.some(cell => {
      if (cell.column.includes('.')) {
        const [tablePrefix] = cell.column.split('.');
        return tablePrefix === tableName;
      }
      return true;
    });

    const hasGroupByColumns = sqlVisualization.groupByColumns.some(col => {
       if (col.includes('.')) {
        const [tablePrefix] = col.split('.');
        return tablePrefix === tableName;
      }
      return true;
    });

    const hasOrderByColumns = !!sqlVisualization.orderBy;

    return (
      <Group key={tableName} x={x} y={y}>
        <Rect // 表的主体
          width={width}
          height={height}
          fill={tableColor}
          cornerRadius={0}
          shadowColor="black"
          shadowBlur={5}
          shadowOpacity={0.3}
          shadowOffset={{ x: 2, y: 2 }}
          stroke={(animationStep === 2 && isHighlighted) ? '#ff0000' : '#cccccc'}
          strokeWidth={(animationStep === 2 && isHighlighted) ? 3 : 1}
        />
        <Text // 表名
          text={tableName}
          fill={textColor}
          fontSize={16}
          fontStyle="bold"
          width={width}
          padding={5}
          height={30}
          align="center"
          verticalAlign="middle"
          y={0}
        />

        {animationStep >= 1 && ( // 控制抽象行/列部分的显示
          <Group y={35}> {/* 容器，用于放置抽象的行/列指示器 */}
            {[...Array(4)].map((_, i) => { // 创建4个抽象的矩形条
              let rowColor = "rgba(255, 255, 255, 0.05)";
              let rowStroke = 'transparent';
              let rowStrokeWidth = 0;

              if (i === 0 && hasSelectedColumns && animationStep >= 1) {
                 rowColor = animationStep === 1 ? "rgba(56, 161, 105, 0.7)" : "rgba(56, 161, 105, 0.4)";
                 rowStroke = animationStep === 1 ? '#38A169' : 'transparent';
                 rowStrokeWidth = animationStep === 1 ? 2 : 0;
              }
              if (i === 1 && hasWhereCells && animationStep >= 4) {
                 rowColor = animationStep === 4 ? "rgba(221, 107, 32, 0.7)" : "rgba(221, 107, 32, 0.4)";
                 rowStroke = animationStep === 4 ? '#DD6B20' : 'transparent';
                 rowStrokeWidth = animationStep === 4 ? 2 : 0;
              }
              if (i === 2 && hasGroupByColumns && animationStep >= 5) {
                 rowColor = animationStep === 5 ? "rgba(128, 90, 213, 0.7)" : "rgba(128, 90, 213, 0.4)";
                 rowStroke = animationStep === 5 ? '#805AD5' : 'transparent';
                 rowStrokeWidth = animationStep === 5 ? 2 : 0;
              }
              if (i === 3 && hasOrderByColumns && animationStep >= 7) {
                 rowColor = animationStep === 7 ? "rgba(49, 151, 149, 0.7)" : "rgba(49, 151, 149, 0.4)";
                 rowStroke = animationStep === 7 ? '#319795' : 'transparent';
                 rowStrokeWidth = animationStep === 7 ? 2 : 0;
              }

              return (
                <Rect // 单个抽象的行/列部分
                  key={`row-${i}`}
                  width={width - 10}
                  height={10}
                  fill={rowColor}
                  stroke={rowStroke}
                  strokeWidth={rowStrokeWidth}
                  x={5}
                  y={i * 12}
                  cornerRadius={0}
                />
              );
            })}
          </Group>
        )}
      </Group>
    );
  };
  
  const renderJoin = (fromX, fromY, toX, toY, isHighlighted = false) => {
    const joinColor = isHighlighted ? '#e53e3e' : '#718096';
    return (
      <Group>
        <Arrow
          points={[fromX, fromY, toX, toY]}
          pointerLength={10}
          pointerWidth={10}
          fill={joinColor}
          stroke={joinColor}
          strokeWidth={isHighlighted ? 3 : 2}
          dash={isHighlighted ? [] : [5, 2]}
        />
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
  
  const renderSqlExecution = () => {
    const tables = sqlVisualization.tables;
    const joins = sqlVisualization.joins;
    const tableWidth = 140;
    const tableHeight = 100;
    const padding = 20;

    if (tables.length === 0 && stageSize.width > 0 && stageSize.height > 0 && !isAnimating && animationStep === -1) {
      // 仅当完全空闲且无数据时显示Konva内的提示
      return (
        <Stage width={stageSize.width} height={stageSize.height} ref={stageRef}>
          <Layer>
            <Text
              text={animationStatus} // 使用 animationStatus 作为提示
              x={padding}
              y={padding}
              fontSize={16}
              fill="grey"
              width={stageSize.width - 2 * padding}
              wrap="word"
            />
          </Layer>
        </Stage>
      );
    }
    
    // 如果有表或正在动画，则渲染实际内容
    if (tables.length === 0 && !isAnimating) return null; // 如果没表了，且不在动画中，不渲染执行区域

    const tablePositions = {};
    tables.forEach((table, index) => {
      const x = padding + (tableWidth + padding) * (index % Math.max(1, Math.floor(stageSize.width / (tableWidth + padding))));
      const y = padding + (tableHeight + padding) * Math.floor(index / Math.max(1, Math.floor(stageSize.width / (tableWidth + padding))));
      tablePositions[table] = { x, y };
    });

    const highlightTable = (tableName) => animationStep === 2;
    const highlightJoin = () => animationStep === 3;

    return (
      <Stage width={stageSize.width} height={stageSize.height} ref={stageRef}>
        <Layer>
          {tables.map((table) => {
            const pos = tablePositions[table];
            if (!pos) return null;
            return renderTable(table, pos.x, pos.y, tableWidth, tableHeight, highlightTable(table));
          })}

          {joins.map((join, index) => {
            const fromTableName = sqlVisualization.tables[0]; // 简化处理
            const toTableName = join.table;
            const fromPos = tablePositions[fromTableName];
            const toPos = tablePositions[toTableName];
            if (fromPos && toPos) {
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

          {animationStep === 4 && sqlVisualization.conditions.length > 0 && (
             <Text text={`WHERE ${sqlVisualization.conditions.join(' AND ')}`} x={20} y={stageSize.height - 60} fill="#DD6B20" fontSize={14} fontStyle="bold"/>
          )}
          {animationStep === 5 && sqlVisualization.groupByColumns.length > 0 && (
             <Text text={`GROUP BY ${sqlVisualization.groupByColumns.join(', ')}`} x={20} y={stageSize.height - 60} fill="#805AD5" fontSize={14} fontStyle="bold"/>
          )}
          {animationStep === 6 && sqlVisualization.havingConditions.length > 0 && (
             <Text text={`HAVING ${sqlVisualization.havingConditions.join(' AND ')}`} x={20} y={stageSize.height - 40} fill="#D53F8C" fontSize={14} fontStyle="bold"/>
          )}
          {animationStep === 7 && sqlVisualization.orderBy && (
             <Text text={`ORDER BY ${sqlVisualization.orderBy}`} x={20} y={stageSize.height - 20} fill="#319795" fontSize={14} fontStyle="bold"/>
          )}
          {animationStep === 8 && (
            <Group>
              <Rect x={stageSize.width / 2 - 100} y={stageSize.height - 80} width={200} height={40} fill="#38A169" cornerRadius={0} shadowColor="black" shadowBlur={5} shadowOpacity={0.3} shadowOffset={{ x: 2, y: 2 }}/>
              <Text text="查询结果已生成" x={stageSize.width / 2 - 100} y={stageSize.height - 80} width={200} height={40} fill="white" fontSize={16} fontStyle="bold" align="center" verticalAlign="middle"/>
            </Group>
          )}
        </Layer>
      </Stage>
    );
  };
  
  const renderSqlStructure = () => {
    // 仅当有表且不在初始的-1状态时显示结构
    if (sqlVisualization.tables.length === 0 || animationStep === -1) return null;
    
    return (
      <div className="sql-structure">
        <h3>SQL结构</h3>
        <div className="sql-structure-content">
          {sqlVisualization.selectColumns.length > 0 && (
            <div className="sql-select-columns">
              <h4>SELECT <span className="highlight-select">列</span></h4>
              <ul>{sqlVisualization.selectColumns.map((c, i) => <li key={i} className="highlight-select-item">{c}</li>)}</ul>
            </div>
          )}
          <div className="sql-tables">
            <h4>表</h4>
            <ul>{sqlVisualization.tables.map((t, i) => <li key={i}>{t}</li>)}</ul>
          </div>
          {sqlVisualization.joins.length > 0 && (
            <div className="sql-joins">
              <h4>连接</h4>
              <ul>{sqlVisualization.joins.map((j, i) => <li key={i}>{j.table} ON {j.condition}</li>)}</ul>
            </div>
          )}
          {sqlVisualization.conditions.length > 0 && (
            <div className="sql-conditions">
              <h4>条件</h4>
              <ul>{sqlVisualization.conditions.map((c, i) => <li key={i}>{c}</li>)}</ul>
            </div>
          )}
          {sqlVisualization.whereCells.length > 0 && (
            <div className="sql-where-cells">
              <h4>WHERE <span className="highlight-where">单元格</span></h4>
              <ul>{sqlVisualization.whereCells.map((cell, i) => <li key={i} className="highlight-where-item">{cell.column} = <span className="cell-value">{cell.value}</span></li>)}</ul>
            </div>
          )}
          {sqlVisualization.groupByColumns.length > 0 && (
            <div className="sql-group-by">
              <h4>GROUP BY</h4>
              <ul>{sqlVisualization.groupByColumns.map((c, i) => <li key={i}>{c}</li>)}</ul>
            </div>
          )}
          {sqlVisualization.havingConditions.length > 0 && (
            <div className="sql-having">
              <h4>HAVING</h4>
              <ul>{sqlVisualization.havingConditions.map((c, i) => <li key={i}>{c}</li>)}</ul>
            </div>
          )}
          {sqlVisualization.orderBy && (
            <div className="sql-order-by">
              <h4>ORDER BY</h4>
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
      
      <div className="visualization-controls">
        {/* 动画控制按钮已移除, 只保留图例 */}
        <div className="color-legend">
          <div className="legend-title">SQL元素颜色说明：</div>
          <div className="legend-item">
            <span className="legend-color select-color"></span>
            <span className="legend-text">SELECT列</span>
          </div>
          <div className="legend-item">
            <span className="legend-color where-color"></span>
            <span className="legend-text">WHERE单元格</span>
          </div>
          <div className="legend-item">
            <span className="legend-color table-color"></span>
            <span className="legend-text">表</span>
          </div>
        </div>
      </div>
      
      {/* 动画状态和步骤指示器 */}
      {(animationStatus || isAnimating || animationStep !== -1) && ( // 仅当有状态或在动画中或已开始时显示
        <div className="animation-status">
          <div className="animation-step-indicator">
            <div className={`step ${animationStep === 0 ? 'active' : ''}`}>解析SQL</div>
            <div className={`step ${animationStep === 1 ? 'active' : ''}`}>SELECT</div>
            <div className={`step ${animationStep === 2 ? 'active' : ''}`}>FROM</div>
            {sqlVisualization.joins.length > 0 && <div className={`step ${animationStep === 3 ? 'active' : ''}`}>JOIN</div>}
            {sqlVisualization.conditions.length > 0 && <div className={`step ${animationStep === 4 ? 'active' : ''}`}>WHERE</div>}
            {sqlVisualization.groupByColumns.length > 0 && <div className={`step ${animationStep === 5 ? 'active' : ''}`}>GROUP BY</div>}
            {sqlVisualization.havingConditions.length > 0 && <div className={`step ${animationStep === 6 ? 'active' : ''}`}>HAVING</div>}
            {sqlVisualization.orderBy && <div className={`step ${animationStep === 7 ? 'active' : ''}`}>ORDER BY</div>}
            <div className={`step ${animationStep === 8 ? 'active' : ''}`}>结果</div>
          </div>
          <div className="animation-description">
            {animationStatus}
          </div>
        </div>
      )}
      
      <div className="konva-stage-wrapper" ref={konvaWrapperRef}>
        {stageSize.width > 0 && stageSize.height > 0 && renderSqlExecution()}
      </div>
      
      {renderSqlStructure()}
    </div>
  );
}

export default Visualization;