import React from 'react';
import styles from './QueryResultDisplay.module.css';

const QueryResultDisplay = ({ results }) => {
  if (!results || results.length === 0) {
    return (
      <div className={styles.queryResultWrapper}>
        <h2>查询结果</h2>
        <div className={styles.noResultsContainer}>
          <p className={styles.noResultsText}>没有可显示的结果或尚未执行查询。</p>
        </div>
      </div>
    );
  }

  // Dynamically get headers from the first result object
  const headers = Object.keys(results[0]);

  return (
    <div className={styles.queryResultWrapper}>
      <h2>查询结果</h2>
      <div className={styles.queryResultTableContainer}>
        <table id="result-table" className={styles.resultTable}>
          <thead>
            <tr>
              {headers.map(header => <th key={header}>{header}</th>)}
            </tr>
          </thead>
          <tbody>
            {results.map((row, index) => (
              <tr key={index}>
                {headers.map(header => <td key={header}>{String(row[header])}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QueryResultDisplay;