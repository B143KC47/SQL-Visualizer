import React, { useState } from 'react';
import { Table, Card, Tabs, Radio, Space, Tooltip } from 'antd';
import ReactECharts from 'echarts-for-react';
import { BarChartOutlined, LineChartOutlined, PieChartOutlined, ScatterPlotOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;

// 图表类型枚举
const ChartTypes = {
  BAR: 'bar',
  LINE: 'line',
  PIE: 'pie',
  SCATTER: 'scatter'
};

const VisualizationPanel = ({ queryResult }) => {
  const [chartType, setChartType] = useState(ChartTypes.BAR);
  if (!queryResult) {
    return (
      <div className="visualization-panel">
        <Card title="查询结果" bordered={false}>
          <p>请输入SQL查询以查看结果</p>
        </Card>
      </div>
    );
  }

  // 准备表格数据
  const columns = queryResult.columns.map(col => ({
    title: col,
    dataIndex: col,
    key: col,
    className: queryResult.highlightInfo.columns.includes(col) ? 'highlight-select' : ''
  }));

  const dataSource = queryResult.rows.map((row, index) => ({
    key: index,
    ...row
  }));

  // 准备图表选项
  const getChartOption = () => {
    // 获取数据列
    const firstColumn = queryResult.columns[0];
    const valueColumn = queryResult.columns.find(col => 
      typeof queryResult.rows[0][col] === 'number'
    ) || queryResult.columns[1];
    
    // 基础配置
    const baseOption = {
      title: {
        text: '查询结果图表',
        subtext: `${firstColumn} vs ${valueColumn}`
      },
      tooltip: {
        trigger: 'axis',
        formatter: '{b}: {c}'
      },
      toolbox: {
        feature: {
          saveAsImage: {}
        }
      },
      legend: {
        data: [valueColumn]
      }
    };
    
    // 根据图表类型返回不同配置
    switch(chartType) {
      case ChartTypes.BAR:
        return {
          ...baseOption,
          xAxis: {
            type: 'category',
            data: queryResult.rows.map(row => row[firstColumn])
          },
          yAxis: {
            type: 'value'
          },
          series: [{
            name: valueColumn,
            type: 'bar',
            data: queryResult.rows.map(row => row[valueColumn]),
            itemStyle: {
              // 根据WHERE条件高亮
              color: (params) => {
                const rowIndex = params.dataIndex;
                const rowData = queryResult.rows[rowIndex];
                if (queryResult.highlightInfo.whereConditions.length > 0) {
                  const condition = queryResult.highlightInfo.whereConditions[0];
                  if (condition.column && rowData[condition.column] > 100) {
                    return '#faad14'; // 高亮颜色
                  }
                }
                return '#1890ff'; // 默认颜色
              }
            }
          }]
        };
      
      case ChartTypes.LINE:
        return {
          ...baseOption,
          xAxis: {
            type: 'category',
            data: queryResult.rows.map(row => row[firstColumn])
          },
          yAxis: {
            type: 'value'
          },
          series: [{
            name: valueColumn,
            type: 'line',
            data: queryResult.rows.map(row => row[valueColumn]),
            smooth: true,
            markPoint: {
              data: [
                { type: 'max', name: '最大值' },
                { type: 'min', name: '最小值' }
              ]
            },
            markLine: {
              data: [
                { type: 'average', name: '平均值' }
              ]
            }
          }]
        };
      
      case ChartTypes.PIE:
        return {
          ...baseOption,
          series: [{
            name: valueColumn,
            type: 'pie',
            radius: '60%',
            center: ['50%', '50%'],
            data: queryResult.rows.map(row => ({
              name: row[firstColumn],
              value: row[valueColumn]
            })),
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }]
        };
      
      case ChartTypes.SCATTER:
        // 尝试找到第二个数值列作为Y轴
        const secondValueColumn = queryResult.columns.find(col => 
          col !== valueColumn && typeof queryResult.rows[0][col] === 'number'
        ) || valueColumn;
        
        return {
          ...baseOption,
          xAxis: {
            type: 'value',
            name: valueColumn
          },
          yAxis: {
            type: 'value',
            name: secondValueColumn
          },
          series: [{
            name: `${valueColumn} vs ${secondValueColumn}`,
            type: 'scatter',
            data: queryResult.rows.map(row => [row[valueColumn], row[secondValueColumn]]),
            symbolSize: 12,
            label: {
              show: true,
              formatter: (params) => {
                const rowIndex = params.dataIndex;
                return queryResult.rows[rowIndex][firstColumn];
              },
              position: 'right'
            }
          }]
        };
      
      default:
        return baseOption;
    }
  };

  // 根据WHERE条件高亮行
  const getRowClassName = (record, index) => {
    const classNames = [];
    
    // 处理WHERE条件高亮
    if (queryResult.highlightInfo.whereConditions.length > 0) {
      const condition = queryResult.highlightInfo.whereConditions[0];
      if (condition.column && record[condition.column] > 100) {
        classNames.push('highlight-where');
      }
    }
    
    // 处理JOIN条件高亮
    if (queryResult.highlightInfo.joinInfo) {
      const joinInfo = queryResult.highlightInfo.joinInfo;
      if (joinInfo.tables.length > 1 && joinInfo.on.length > 1) {
        // 简化的JOIN高亮逻辑
        const joinColumn = joinInfo.on[0].split('.')[1]; // 假设格式为 'table.column'
        if (record[joinColumn]) {
          classNames.push('highlight-join');
        }
      }
    }
    
    return classNames.join(' ');
  };

  return (
    <div className="visualization-panel">
      <Tabs defaultActiveKey="table">
        <TabPane tab="表格视图" key="table">
          <div className="result-table">
            <Table 
              columns={columns} 
              dataSource={dataSource} 
              pagination={false}
              size="small"
              rowClassName={getRowClassName}
            />
          </div>
        </TabPane>
        <TabPane tab="图表视图" key="chart">
          <div className="chart-controls">
            <Space style={{ marginBottom: '16px' }}>
              <span>图表类型:</span>
              <Radio.Group value={chartType} onChange={e => setChartType(e.target.value)}>
                <Tooltip title="柱状图">
                  <Radio.Button value={ChartTypes.BAR}><BarChartOutlined /></Radio.Button>
                </Tooltip>
                <Tooltip title="折线图">
                  <Radio.Button value={ChartTypes.LINE}><LineChartOutlined /></Radio.Button>
                </Tooltip>
                <Tooltip title="饼图">
                  <Radio.Button value={ChartTypes.PIE}><PieChartOutlined /></Radio.Button>
                </Tooltip>
                <Tooltip title="散点图">
                  <Radio.Button value={ChartTypes.SCATTER}><ScatterPlotOutlined /></Radio.Button>
                </Tooltip>
              </Radio.Group>
            </Space>
          </div>
          <div className="chart-container">
            <ReactECharts 
              option={getChartOption()} 
              style={{ height: '100%', minHeight: '300px' }} 
              notMerge={true} 
              lazyUpdate={true}
            />
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default VisualizationPanel;