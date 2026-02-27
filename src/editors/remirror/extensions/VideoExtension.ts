import {
  NodeExtension,
  ExtensionTag,
} from '@remirror/core';
import type { NodeExtensionSpec, CommandFunction } from '@remirror/core';

export interface VideoOptions {
  // Intentionally empty - this extension has no configurable options
  _?: never;
}

export interface VideoAttributes {
  src: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Remirror {
    interface AllExtensions {
      video: VideoExtension;
    }
  }
}

export class VideoExtension extends NodeExtension<VideoOptions> {
  static readonly disableExtraAttributes = true;

  get name() {
    return 'video' as const;
  }

  createTags() {
    return [ExtensionTag.Block];
  }

  createNodeSpec(): NodeExtensionSpec {
    return {
      attrs: {
        src: { default: '' },
      },
      group: 'block',
      atom: true,
      draggable: true,
      parseDOM: [
        {
          tag: 'div[data-video]',
          getAttrs: (element) => {
            const video = element.querySelector('video');
            const iframe = element.querySelector('iframe');
            return {
              src: video?.getAttribute('src') || iframe?.getAttribute('src') || '',
            };
          },
        },
      ],
      toDOM: (node) => {
        const src = (node.attrs.src as string) || '';
        
        // Check if it's a YouTube URL
        const youtubeMatch = src ? /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/.exec(src) : null;
        // Check if it's a Vimeo URL
        const vimeoMatch = src ? /vimeo\.com\/(?:video\/)?(\d+)/.exec(src) : null;

        if (youtubeMatch) {
          return [
            'div',
            { 'data-video': '', class: 'video-wrapper' },
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
            { 'data-video': '', class: 'video-wrapper' },
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
          { 'data-video': '', class: 'video-wrapper' },
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
    };
  }

  createCommands() {
    return {
      insertVideo: (attrs: VideoAttributes): CommandFunction => {
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
