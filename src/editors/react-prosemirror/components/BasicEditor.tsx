import { useMemo, useCallback, useState } from 'react';
import { ProseMirror, ProseMirrorDoc, reactKeys, useEditorState } from '@handlewithcare/react-prosemirror';
import { EditorState } from 'prosemirror-state';
import { history } from 'prosemirror-history';
import { gapCursor } from 'prosemirror-gapcursor';
import { DOMSerializer } from 'prosemirror-model';
import { basicSchema } from '../utils/schema';
import { buildKeymap, buildBaseKeymap } from '../utils/keymap';
import { Toolbar } from './Toolbar';
import './Editor.css';

interface BasicEditorProps {
  initialContent?: string;
  onChange?: (html: string) => void;
}

// Inner component that has access to editor context
function BasicEditorContent({ variant }: { variant: 'basic' | 'extended' }) {
  const state = useEditorState();
  
  return (
    <>
      <Toolbar state={state} variant={variant} />
      <ProseMirrorDoc 
        className="prosemirror-editor" 
        data-placeholder="Start typing..."
      />
    </>
  );
}

export function BasicEditor({ initialContent, onChange }: BasicEditorProps) {
  const plugins = useMemo(() => [
    buildKeymap(basicSchema),
    buildBaseKeymap(),
    history(),
    gapCursor(),
    reactKeys(),
  ], []);

  const initialState = useMemo(() => {
    let doc = basicSchema.nodes.doc.create(null, [
      basicSchema.nodes.paragraph.create(),
    ]);

    if (initialContent) {
      try {
        const parser = new DOMParser();
        const htmlDoc = parser.parseFromString(initialContent, 'text/html');
        const fragment = basicSchema.nodeFromJSON({
          type: 'doc',
          content: Array.from(htmlDoc.body.childNodes)
            .map(node => {
              if (node.nodeType === Node.TEXT_NODE) {
                return { type: 'paragraph', content: [{ type: 'text', text: node.textContent }] };
              }
              return { type: 'paragraph', content: [{ type: 'text', text: node.textContent || '' }] };
            })
            .filter(n => n.content?.[0]?.text),
        });
        doc = fragment;
      } catch (e) {
        console.warn('Failed to parse initial content:', e);
      }
    }

    return EditorState.create({
      doc,
      plugins,
    });
  }, [initialContent, plugins]);

  const [state, setState] = useState(initialState);

  const handleDispatchTransaction = useCallback((tr: Parameters<NonNullable<Parameters<typeof ProseMirror>[0]['dispatchTransaction']>>[0]) => {
    const newState = state.apply(tr);
    setState(newState);
    
    if (onChange) {
      const serializer = DOMSerializer.fromSchema(basicSchema);
      const fragment = serializer.serializeFragment(newState.doc.content);
      const div = document.createElement('div');
      div.appendChild(fragment);
      onChange(div.innerHTML);
    }
  }, [state, onChange]);

  return (
    <div className="prosemirror-editor-wrapper basic">
      <ProseMirror
        state={state}
        dispatchTransaction={handleDispatchTransaction}
      >
        <BasicEditorContent variant="basic" />
      </ProseMirror>
    </div>
  );
}
