import React, { useEffect, useRef } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { sql } from '@codemirror/lang-sql';
import { EditorState } from '@codemirror/state';

const SQLEditor = ({ value, onChange }) => {
  const editorRef = useRef(null);
  const viewRef = useRef(null);

  useEffect(() => {
    if (editorRef.current) {
      // 初始化编辑器
      const startState = EditorState.create({
        doc: value || '',
        extensions: [
          basicSetup,
          sql(),
          EditorView.updateListener.of(update => {
            if (update.docChanged) {
              onChange(update.state.doc.toString());
            }
          })
        ]
      });

      // 创建编辑器视图
      const view = new EditorView({
        state: startState,
        parent: editorRef.current
      });

      viewRef.current = view;

      return () => {
        view.destroy();
      };
    }
  }, []);

  // 当外部value变化时更新编辑器内容
  useEffect(() => {
    if (viewRef.current && value !== viewRef.current.state.doc.toString()) {
      const currentPos = viewRef.current.state.selection.main.head;
      viewRef.current.dispatch({
        changes: { from: 0, to: viewRef.current.state.doc.length, insert: value || '' }
      });
    }
  }, [value]);

  return (
    <div className="sql-editor">
      <div ref={editorRef} style={{ height: '100%', minHeight: '200px' }} />
    </div>
  );
};

export default SQLEditor;