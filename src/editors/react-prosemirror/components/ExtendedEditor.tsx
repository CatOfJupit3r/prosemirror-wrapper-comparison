import { useMemo, useCallback, useState } from 'react';
import { ProseMirror, ProseMirrorDoc, reactKeys, useEditorState } from '@handlewithcare/react-prosemirror';
import { EditorState } from 'prosemirror-state';
import { history } from 'prosemirror-history';
import { gapCursor } from 'prosemirror-gapcursor';
import { DOMSerializer } from 'prosemirror-model';
import { extendedSchema } from '../utils/schema';
import { buildKeymap, buildBaseKeymap } from '../utils/keymap';
import { Toolbar } from './Toolbar';
import { ImagePreviewModal } from './ImagePreviewModal';
import './Editor.css';

interface ExtendedEditorProps {
  initialContent?: string;
  onChange?: (html: string) => void;
}

// Inner component that has access to editor context
function ExtendedEditorContent({ 
  variant, 
  onImageClick 
}: { 
  variant: 'basic' | 'extended';
  onImageClick: (src: string, alt?: string) => void;
}) {
  const state = useEditorState();
  
  return (
    <>
      <Toolbar state={state} variant={variant} />
      <ProseMirrorDoc 
        className="prosemirror-editor extended" 
        data-placeholder="Start typing..."
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target.tagName === 'IMG') {
            const src = target.getAttribute('src');
            const alt = target.getAttribute('alt');
            if (src) {
              onImageClick(src, alt || undefined);
            }
          }
        }}
      />
    </>
  );
}

export function ExtendedEditor({ initialContent, onChange }: ExtendedEditorProps) {
  const [previewImage, setPreviewImage] = useState<{ src: string; alt?: string } | null>(null);

  const plugins = useMemo(() => [
    buildKeymap(extendedSchema),
    buildBaseKeymap(),
    history(),
    gapCursor(),
    reactKeys(),
  ], []);

  const initialState = useMemo(() => {
    let doc = extendedSchema.nodes.doc.create(null, [
      extendedSchema.nodes.paragraph.create(),
    ]);

    if (initialContent) {
      try {
        const parser = new DOMParser();
        const htmlDoc = parser.parseFromString(initialContent, 'text/html');
        const fragment = extendedSchema.nodeFromJSON({
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
      const serializer = DOMSerializer.fromSchema(extendedSchema);
      const fragment = serializer.serializeFragment(newState.doc.content);
      const div = document.createElement('div');
      div.appendChild(fragment);
      onChange(div.innerHTML);
    }
  }, [state, onChange]);

  const handleImageClick = useCallback((src: string, alt?: string) => {
    setPreviewImage({ src, alt });
  }, []);

  return (
    <div className="prosemirror-editor-wrapper extended">
      <ProseMirror
        state={state}
        dispatchTransaction={handleDispatchTransaction}
      >
        <ExtendedEditorContent 
          variant="extended" 
          onImageClick={handleImageClick}
        />
      </ProseMirror>

      {previewImage && (
        <ImagePreviewModal
          src={previewImage.src}
          alt={previewImage.alt}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </div>
  );
}
