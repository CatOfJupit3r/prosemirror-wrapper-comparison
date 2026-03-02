import { PlainExtension } from '@remirror/core';
import type { ProsemirrorPlugin } from '@remirror/pm';
import { Plugin, PluginKey } from '@remirror/pm/state';
import type { EditorView } from '@remirror/pm/view';
import { uploadFile } from '../../../utils/upload';

export interface FileDropHandlerOptions {
  onUploadStart?: () => void;
  onUploadEnd?: () => void;
  onUploadError?: (error: Error) => void;
}

/**
 * Extension to handle file drops and pastes in the editor
 */
export class FileDropHandlerExtension extends PlainExtension<FileDropHandlerOptions> {
  static defaultOptions: FileDropHandlerOptions = {
    onUploadStart: () => {},
    onUploadEnd: () => {},
    onUploadError: () => {},
  };

  get name() {
    return 'fileDropHandler' as const;
  }

  createExternalPlugins(): ProsemirrorPlugin[] {
    const { onUploadStart, onUploadEnd, onUploadError } = this.options;

    const handleFiles = (files: File[], view: EditorView, pos?: number) => {
      for (const file of files) {
        onUploadStart?.();
        uploadFile(file)
          .then((result) => {
            const { state, dispatch } = view;
            
            // Determine insertion position
            const insertPos = pos ?? state.selection.from;
            
            if (file.type.startsWith('image/')) {
              const imageType = state.schema.nodes.image;
              if (imageType) {
                const node = imageType.create({ src: result.url, alt: file.name });
                const tr = state.tr.insert(insertPos, node);
                dispatch(tr);
              }
            } else if (file.type.startsWith('video/')) {
              const videoType = state.schema.nodes.video;
              if (videoType) {
                const node = videoType.create({ src: result.url });
                const tr = state.tr.insert(insertPos, node);
                dispatch(tr);
              }
            } else {
              const fileType = state.schema.nodes.fileAttachment;
              if (fileType) {
                const node = fileType.create({ src: result.url, name: file.name });
                const tr = state.tr.insert(insertPos, node);
                dispatch(tr);
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
    };

    const plugin = new Plugin({
      key: new PluginKey('fileDropHandler'),
      props: {
        handleDrop: (view, event, _slice, _moved) => {
          const dataTransfer = event.dataTransfer;
          if (!dataTransfer) {
            return false;
          }

          const files = dataTransfer.files;
          if (!files || files.length === 0) {
            return false;
          }

          // Check if any file is droppable
          const droppableFiles = Array.from(files).filter(
            file => file.type.startsWith('image/') || 
                    file.type.startsWith('video/') || 
                    file.type.startsWith('application/') ||
                    file.type.startsWith('text/')
          );

          if (droppableFiles.length === 0) {
            return false;
          }

          event.preventDefault();
          event.stopPropagation();

          // Get drop position
          const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
          const pos = coordinates?.pos ?? view.state.selection.from;

          handleFiles(droppableFiles, view, pos);
          return true;
        },
        handlePaste: (view, event, _slice) => {
          const clipboardData = event.clipboardData;
          if (!clipboardData) {
            return false;
          }

          const files = clipboardData.files;
          if (!files || files.length === 0) {
            return false;
          }

          // Check if any file is pasteable
          const pasteableFiles = Array.from(files).filter(
            file => file.type.startsWith('image/') || 
                    file.type.startsWith('video/') || 
                    file.type.startsWith('application/') ||
                    file.type.startsWith('text/')
          );

          if (pasteableFiles.length === 0) {
            return false;
          }

          event.preventDefault();
          handleFiles(pasteableFiles, view);
          return true;
        },
      },
    });

    return [plugin];
  }
}
