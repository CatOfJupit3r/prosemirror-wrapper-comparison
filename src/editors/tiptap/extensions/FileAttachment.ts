import { Node, mergeAttributes } from '@tiptap/react';

export interface FileAttachmentOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/react' {
  interface Commands<ReturnType> {
    fileAttachment: {
      setFileAttachment: (options: { src: string; name: string }) => ReturnType;
    };
  }
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

export const FileAttachment = Node.create<FileAttachmentOptions>({
  name: 'fileAttachment',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: 'inline',

  inline: true,

  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      name: {
        default: 'file',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'a[data-file-attachment]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const name = HTMLAttributes.name as string;
    const icon = getFileIcon(name);

    return [
      'a',
      mergeAttributes(this.options.HTMLAttributes, {
        'data-file-attachment': '',
        class: 'file-attachment',
        href: HTMLAttributes.src,
        target: '_blank',
        rel: 'noopener noreferrer',
        download: name,
      }),
      `${icon} ${name}`,
    ];
  },

  addCommands() {
    return {
      setFileAttachment:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});
