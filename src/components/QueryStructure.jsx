import React from 'react';
import { Card, List, Tag, Divider } from 'antd';

const QueryStructure = ({ structure }) => {
  if (!structure) {
    return (
      <div className="query-structure">
        <Card title="查询结构" bordered={false}>
          <p>请输入SQL查询以查看结构</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="query-structure">
      <Card title="查询结构" bordered={false}>
        <div>
          <strong>查询类型:</strong> <Tag color="blue">{structure.type || '未识别'}</Tag>
        </div>
        
        <Divider orientation="left" plain>表</Divider>
        <List
          size="small"
          dataSource={structure.tables}
          renderItem={item => <List.Item><Tag color="green">{item}</Tag></List.Item>}
          locale={{ emptyText: '未识别表' }}
        />
        
        <Divider orientation="left" plain>列</Divider>
        <List
          size="small"
          dataSource={structure.columns}
          renderItem={item => <List.Item><Tag color="cyan">{item}</Tag></List.Item>}
          locale={{ emptyText: '未识别列' }}
        />
        
        {structure.conditions.length > 0 && (
          <>
            <Divider orientation="left" plain>条件</Divider>
            <List
              size="small"
              dataSource={structure.conditions}
              renderItem={item => <List.Item><Tag color="orange">{item}</Tag></List.Item>}
            />
          </>
        )}
        
        {structure.joins.length > 0 && (
          <>
            <Divider orientation="left" plain>连接</Divider>
            <List
              size="small"
              dataSource={structure.joins}
              renderItem={item => <List.Item><Tag color="purple">{item}</Tag></List.Item>}
            />
          </>
        )}
      </Card>
    </div>
  );
};

export default QueryStructure;