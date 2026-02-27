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
import { FontSize } from '../extensions/FontSize';
import { Tabulation } from '../extensions/Tabulation';
import { Toolbar } from './Toolbar';
import './Editor.css';

interface BasicEditorProps {
  initialContent?: string;
  onChange?: (html: string) => void;
}

export function BasicEditor({ initialContent, onChange }: BasicEditorProps) {
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
    ],
    content: initialContent || '<p></p>',
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
      }
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor',
        'data-placeholder': 'Start typing...',
      },
    },
  });

  return (
    <div className="tiptap-editor-wrapper basic">
      <Toolbar editor={editor} variant="basic" />
      <EditorContent editor={editor} />
    </div>
  );
}
