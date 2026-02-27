import { Extension } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    tabulation: {
      indent: () => ReturnType;
      outdent: () => ReturnType;
    };
  }
}

const INDENT_SIZE = 40; // pixels

export const Tabulation = Extension.create({
  name: 'tabulation',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading'],
        attributes: {
          indent: {
            default: 0,
            parseHTML: (element) => {
              const marginLeft = element.style.marginLeft;
              return marginLeft ? Math.round(parseInt(marginLeft, 10) / INDENT_SIZE) : 0;
            },
            renderHTML: (attributes) => {
              if (!attributes.indent) {
                return {};
              }
              return {
                style: `margin-left: ${attributes.indent * INDENT_SIZE}px`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      indent:
        () =>
        ({ tr, state, dispatch, editor }) => {
          const { selection } = state;
          const { from, to, $from } = selection;

          // If in a list, use list indentation
          if (state.schema.nodes.listItem) {
            const listItemType = state.schema.nodes.listItem;
            for (let d = $from.depth; d > 0; d--) {
              if ($from.node(d).type === listItemType) {
                return editor.commands.sinkListItem('listItem');
              }
            }
          }

          // For paragraphs/headings - only indent if at beginning or has selection
          const hasSelection = !selection.empty;
          const isAtStart = $from.parentOffset === 0;

          if (!hasSelection && !isAtStart) {
            // Insert tab character if not at start and no selection
            return editor.commands.insertContent('\t');
          }

          // Collect all positions to update first
          const updates: Array<{ pos: number; node: any }> = [];
          state.doc.nodesBetween(from, to, (node, pos) => {
            // Only process nodes that are actually in the selection range
            if ((node.type.name === 'paragraph' || node.type.name === 'heading') && pos >= from) {
              updates.push({ pos, node });
              return false; // Don't descend into children
            }
          });

          // Apply indent to all affected blocks
          if (dispatch && updates.length > 0) {
            updates.forEach(({ pos, node }) => {
              const currentIndent = node.attrs.indent || 0;
              const newIndent = Math.min(currentIndent + 1, 10); // Max 10 levels
              tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                indent: newIndent,
              });
            });
          }

          return updates.length > 0;
        },
      outdent:
        () =>
        ({ tr, state, dispatch, editor }) => {
          const { selection } = state;
          const { from, to, $from } = selection;

          // If in a list, use list outdentation
          if (state.schema.nodes.listItem) {
            const listItemType = state.schema.nodes.listItem;
            for (let d = $from.depth; d > 0; d--) {
              if ($from.node(d).type === listItemType) {
                return editor.commands.liftListItem('listItem');
              }
            }
          }

          // Collect all positions to update first
          const updates: Array<{ pos: number; node: any }> = [];
          state.doc.nodesBetween(from, to, (node, pos) => {
            // Only process nodes that are actually in the selection range
            if ((node.type.name === 'paragraph' || node.type.name === 'heading') && pos >= from) {
              const currentIndent = node.attrs.indent || 0;
              if (currentIndent > 0) {
                updates.push({ pos, node });
              }
              return false; // Don't descend into children
            }
          });

          // Apply outdent to all affected blocks
          if (dispatch && updates.length > 0) {
            updates.forEach(({ pos, node }) => {
              const currentIndent = node.attrs.indent || 0;
              tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                indent: currentIndent - 1,
              });
            });
          }

          return updates.length > 0;
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      Tab: () => {
        // Always prevent default tab behavior
        this.editor.commands.indent();
        return true;
      },
      'Shift-Tab': () => {
        // Always prevent default shift-tab behavior
        this.editor.commands.outdent();
        return true;
      },
      Backspace: ({ editor }) => {
        const { selection } = editor.state;
        const { $from } = selection;

        // Only outdent on backspace if at the very beginning of the node
        if ($from.parentOffset === 0 && selection.empty) {
          const node = $from.parent;
          if ((node.type.name === 'paragraph' || node.type.name === 'heading') && node.attrs.indent > 0) {
            return this.editor.commands.outdent();
          }
        }

        return false;
      },
      Delete: ({ editor }) => {
        const { selection } = editor.state;
        const { $from } = selection;

        // Only outdent on delete if at the very beginning of the node
        if ($from.parentOffset === 0 && selection.empty) {
          const node = $from.parent;
          if ((node.type.name === 'paragraph' || node.type.name === 'heading') && node.attrs.indent > 0) {
            return this.editor.commands.outdent();
          }
        }

        return false;
      },
    };
  },
});
