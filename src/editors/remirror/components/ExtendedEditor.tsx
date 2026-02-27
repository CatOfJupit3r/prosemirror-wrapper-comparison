import { useState, useCallback } from 'react';
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
  BlockquoteExtension,
  LinkExtension,
  ImageExtension,
} from 'remirror/extensions';
import { FontSizeExtension } from '@remirror/extension-font-size';
import { TextColorExtension } from '@remirror/extension-text-color';
import { TextHighlightExtension } from '@remirror/extension-text-highlight';
import { VideoExtension } from '../extensions/VideoExtension';
import { FileAttachmentExtension } from '../extensions/FileAttachmentExtension';
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
      new BlockquoteExtension(),
      new LinkExtension({ 
        autoLink: false,
        defaultTarget: '_blank',
      }),
      new ImageExtension({
        enableResizing: false,
      }),
      new VideoExtension({}),
      new FileAttachmentExtension({}),
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
    <div className="remirror-editor-wrapper extended" onClick={handleImageClick}>
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
        <Toolbar variant="extended" />
      </Remirror>

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
