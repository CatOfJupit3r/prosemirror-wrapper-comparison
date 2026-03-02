import { Plugin, PluginKey } from 'prosemirror-state';
import type { EditorView } from 'prosemirror-view';
import type { Schema } from 'prosemirror-model';
import { uploadFile } from '../../../utils/upload';

export interface FileDropPluginOptions {
  onUploadStart?: () => void;
  onUploadEnd?: () => void;
  onUploadError?: (error: Error) => void;
}

const ALLOWED_MIME_TYPES = [
  'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml',
  'video/mp4', 'video/webm', 'video/quicktime',
  'application/pdf', 'application/msword', 
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

function isAllowedFile(file: File): boolean {
  return ALLOWED_MIME_TYPES.some(mime => file.type.startsWith(mime.split('/')[0] + '/') || file.type === mime);
}

function handleFiles(
  files: File[],
  view: EditorView,
  schema: Schema,
  pos: number | null,
  options: FileDropPluginOptions
) {
  const { onUploadStart, onUploadEnd, onUploadError } = options;

  for (const file of files) {
    if (!isAllowedFile(file)) {
      continue;
    }

    onUploadStart?.();

    uploadFile(file)
      .then((result) => {
        const { state, dispatch } = view;
        
        // Determine insertion position - use provided pos or current selection
        const insertPos = pos ?? state.selection.from;
        
        if (file.type.startsWith('image/')) {
          const imageType = schema.nodes.image;
          if (imageType) {
            const node = imageType.create({ 
              src: result.url, 
              alt: file.name,
              title: file.name 
            });
            const tr = state.tr.insert(insertPos, node);
            dispatch(tr.scrollIntoView());
          }
        } else if (file.type.startsWith('video/')) {
          const videoType = schema.nodes.video;
          if (videoType) {
            const node = videoType.create({ src: result.url });
            const tr = state.tr.insert(insertPos, node);
            dispatch(tr.scrollIntoView());
          }
        } else {
          const fileType = schema.nodes.file;
          if (fileType) {
            const node = fileType.create({ 
              href: result.url, 
              filename: file.name,
              fileType: file.type 
            });
            const tr = state.tr.insert(insertPos, node);
            dispatch(tr.scrollIntoView());
          }
        }
        
        onUploadEnd?.();
      })
      .catch((error) => {
        console.error('Upload failed:', error);
        onUploadError?.(error as Error);
        onUploadEnd?.();
      });
  }
}

/**
 * Creates a ProseMirror plugin that handles file drops and pastes.
 * Supports images, videos, and other file attachments.
 */
export function createFileDropPlugin(
  schema: Schema,
  options: FileDropPluginOptions = {}
): Plugin {
  return new Plugin({
    key: new PluginKey('fileDrop'),
    props: {
      handleDrop(view, event, _slice, moved) {
        // Don't handle if it's an internal move
        if (moved) {
          return false;
        }

        const dataTransfer = event.dataTransfer;
        if (!dataTransfer) {
          return false;
        }

        const files = Array.from(dataTransfer.files);
        if (files.length === 0) {
          return false;
        }

        const droppableFiles = files.filter(isAllowedFile);
        if (droppableFiles.length === 0) {
          return false;
        }

        event.preventDefault();
        event.stopPropagation();

        // Get drop position
        const coordinates = view.posAtCoords({ 
          left: event.clientX, 
          top: event.clientY 
        });
        const pos = coordinates?.pos ?? view.state.selection.from;

        handleFiles(droppableFiles, view, schema, pos, options);
        return true;
      },

      handlePaste(view, event) {
        const clipboardData = event.clipboardData;
        if (!clipboardData) {
          return false;
        }

        const files = Array.from(clipboardData.files);
        if (files.length === 0) {
          return false;
        }

        const pasteableFiles = files.filter(isAllowedFile);
        if (pasteableFiles.length === 0) {
          return false;
        }

        event.preventDefault();

        handleFiles(pasteableFiles, view, schema, null, options);
        return true;
      },
    },
  });
}
