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
