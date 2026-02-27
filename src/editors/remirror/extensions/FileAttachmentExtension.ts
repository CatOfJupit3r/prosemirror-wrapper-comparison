import {
  NodeExtension,
  ExtensionTag,
} from '@remirror/core';
import type { NodeExtensionSpec, CommandFunction } from '@remirror/core';

export interface FileAttachmentOptions {
  // Intentionally empty - this extension has no configurable options
  _?: never;
}

export interface FileAttachmentAttributes {
  src: string;
  name: string;
}

const FILE_ICONS: Record<string, string> = {
  pdf: '📄',
  doc: '📝',
  docx: '📝',
  xls: '📊',
  xlsx: '📊',
  ppt: '📽️',
  pptx: '📽️',
  txt: '📃',
  zip: '📦',
  rar: '📦',
  jpg: '🖼️',
  jpeg: '🖼️',
  png: '🖼️',
  gif: '🖼️',
  mp3: '🎵',
  mp4: '🎬',
  default: '📎',
};

function getFileIcon(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  return FILE_ICONS[extension] || FILE_ICONS.default;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Remirror {
    interface AllExtensions {
      fileAttachment: FileAttachmentExtension;
    }
  }
}

export class FileAttachmentExtension extends NodeExtension<FileAttachmentOptions> {
  static readonly disableExtraAttributes = true;

  get name() {
    return 'fileAttachment' as const;
  }

  createTags() {
    return [ExtensionTag.InlineNode];
  }

  createNodeSpec(): NodeExtensionSpec {
    return {
      attrs: {
        src: { default: '' },
        name: { default: 'file' },
      },
      group: 'inline',
      inline: true,
      atom: true,
      draggable: true,
      parseDOM: [
        {
          tag: 'a[data-file-attachment]',
          getAttrs: (element) => {
            return {
              src: element.getAttribute('href') || '',
              name: element.getAttribute('download') || 'file',
            };
          },
        },
      ],
      toDOM: (node) => {
        const src = (node.attrs.src as string) || '';
        const name = (node.attrs.name as string) || 'file';
        const icon = getFileIcon(name);

        return [
          'a',
          {
            'data-file-attachment': '',
            class: 'file-attachment',
            href: src,
            target: '_blank',
            rel: 'noopener noreferrer',
            download: name,
          },
          `${icon} ${name}`,
        ];
      },
    };
  }

  createCommands() {
    return {
      insertFileAttachment: (attrs: FileAttachmentAttributes): CommandFunction => {
        return ({ tr, dispatch }) => {
          const node = this.type.create(attrs);
          if (dispatch) {
            dispatch(tr.replaceSelectionWith(node));
          }
          return true;
        };
      },
    };
  }
}
