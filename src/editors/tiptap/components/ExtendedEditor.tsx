import { useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Blockquote from '@tiptap/extension-blockquote';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { FontSize } from '../extensions/FontSize';
import { Tabulation } from '../extensions/Tabulation';
import { Video } from '../extensions/Video';
import { FileAttachment } from '../extensions/FileAttachment';
import { Toolbar } from './Toolbar';
import { ImagePreviewModal } from './ImagePreviewModal';
import './Editor.css';

interface ExtendedEditorProps {
  initialContent?: string;
  onChange?: (html: string) => void;
}

export function ExtendedEditor({ initialContent, onChange }: ExtendedEditorProps) {
  const [previewImage, setPreviewImage] = useState<{ src: string; alt?: string } | null>(null);

  const handleImageClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.tagName === 'IMG') {
      const src = target.getAttribute('src');
      const alt = target.getAttribute('alt');
      if (src) {
        setPreviewImage({ src, alt: alt || undefined });
      }
    }
  }, []);

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            marginLeft: {
              default: null,
              parseHTML: element => element.style.marginLeft || null,
              renderHTML: attributes => {
                if (!attributes.marginLeft) {
                  return {};
                }
                return {
                  style: `margin-left: ${attributes.marginLeft}`,
                };
              },
            },
          };
        },
      }),
      Text,
      Bold,
      Italic,
      Underline,
      Strike,
      BulletList,
      OrderedList,
      ListItem,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      FontSize,
      Tabulation,
      Blockquote,
      TextAlign.configure({
        types: ['paragraph', 'heading'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'tiptap-image',
        },
      }),
      Video,
      FileAttachment,
    ],
    content: initialContent || '<p></p>',
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
      }
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor extended',
        'data-placeholder': 'Start typing...',
      },
    },
  });

  return (
    <div className="tiptap-editor-wrapper extended">
      <Toolbar editor={editor} variant="extended" />
      <div onClick={handleImageClick}>
        <EditorContent editor={editor} />
      </div>

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
