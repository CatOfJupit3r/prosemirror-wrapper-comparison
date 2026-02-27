import { useCallback } from 'react';
import { Remirror, useRemirror } from '@remirror/react';
import {
  BoldExtension,
  ItalicExtension,
  UnderlineExtension,
  StrikeExtension,
  BulletListExtension,
  OrderedListExtension,
  PlaceholderExtension,
  NodeFormattingExtension,
} from 'remirror/extensions';
import { FontSizeExtension } from '@remirror/extension-font-size';
import { TextColorExtension } from '@remirror/extension-text-color';
import { TextHighlightExtension } from '@remirror/extension-text-highlight';
import { Toolbar } from './Toolbar';
import './Editor.css';

interface BasicEditorProps {
  initialContent?: string;
  onChange?: (html: string) => void;
}

export function BasicEditor({ initialContent, onChange }: BasicEditorProps) {
  const { manager, state, setState } = useRemirror({
    extensions: () => [
      new BoldExtension({}),
      new ItalicExtension(),
      new UnderlineExtension(),
      new StrikeExtension(),
      new BulletListExtension({}),
      new OrderedListExtension(),
      new TextHighlightExtension({}),
      new TextColorExtension({}),
      new FontSizeExtension({ defaultSize: '16px', unit: 'px' }),
      new PlaceholderExtension({ placeholder: 'Start typing...' }),
      new NodeFormattingExtension({}),
    ],
    content: initialContent || '<p></p>',
    stringHandler: 'html',
  });

  const handleChange = useCallback(
    (params: { helpers: { getHTML: () => string } }) => {
      if (onChange) {
        onChange(params.helpers.getHTML());
      }
    },
    [onChange],
  );

  return (
    <div className="remirror-editor-wrapper basic">
      <Remirror
        manager={manager}
        state={state}
        onChange={(params) => {
          setState(params.state);
          handleChange(params);
        }}
        classNames={['remirror-editor']}
        autoRender="end"
      >
        <Toolbar variant="basic" />
      </Remirror>
    </div>
  );
}
