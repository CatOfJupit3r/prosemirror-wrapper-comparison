import { Node, mergeAttributes } from '@tiptap/react';

export interface VideoOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/react' {
  interface Commands<ReturnType> {
    video: {
      setVideo: (options: { src: string }) => ReturnType;
    };
  }
}

export const Video = Node.create<VideoOptions>({
  name: 'video',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-video]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const src = HTMLAttributes.src as string;
    
    // Check if it's a YouTube URL
    const youtubeMatch = src ? /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/.exec(src) : null;
    // Check if it's a Vimeo URL
    const vimeoMatch = src ? /vimeo\.com\/(?:video\/)?(\d+)/.exec(src) : null;

    if (youtubeMatch) {
      return [
        'div',
        mergeAttributes(this.options.HTMLAttributes, { 'data-video': '', class: 'video-wrapper' }),
        [
          'iframe',
          {
            src: `https://www.youtube.com/embed/${youtubeMatch[1]}`,
            width: '560',
            height: '315',
            frameborder: '0',
            allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
            allowfullscreen: 'true',
          },
        ],
      ];
    }

    if (vimeoMatch) {
      return [
        'div',
        mergeAttributes(this.options.HTMLAttributes, { 'data-video': '', class: 'video-wrapper' }),
        [
          'iframe',
          {
            src: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
            width: '560',
            height: '315',
            frameborder: '0',
            allow: 'autoplay; fullscreen; picture-in-picture',
            allowfullscreen: 'true',
          },
        ],
      ];
    }

    // Direct video URL
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, { 'data-video': '', class: 'video-wrapper' }),
      [
        'video',
        {
          src,
          controls: 'true',
          width: '100%',
        },
      ],
    ];
  },

  addCommands() {
    return {
      setVideo:
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
