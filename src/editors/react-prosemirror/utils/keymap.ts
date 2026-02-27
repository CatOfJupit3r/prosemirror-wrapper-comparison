import { keymap } from 'prosemirror-keymap';
import { Schema } from 'prosemirror-model';
import { baseKeymap, toggleMark, chainCommands, newlineInCode, createParagraphNear, liftEmptyBlock, splitBlock } from 'prosemirror-commands';
import { splitListItem, liftListItem, sinkListItem } from 'prosemirror-schema-list';
import { undo, redo } from 'prosemirror-history';
import { Plugin, type EditorState, type Transaction } from 'prosemirror-state';
import type { EditorView } from 'prosemirror-view';

type Command = (state: EditorState, dispatch?: (tr: Transaction) => void, view?: EditorView) => boolean;

export function buildKeymap(schema: Schema): Plugin {
  const keys: Record<string, Command> = {};

  // Basic text formatting
  if (schema.marks.bold) {
    keys['Mod-b'] = toggleMark(schema.marks.bold);
  }
  if (schema.marks.italic) {
    keys['Mod-i'] = toggleMark(schema.marks.italic);
  }
  if (schema.marks.underline) {
    keys['Mod-u'] = toggleMark(schema.marks.underline);
  }
  if (schema.marks.strikethrough) {
    keys['Mod-Shift-s'] = toggleMark(schema.marks.strikethrough);
  }

  // History
  keys['Mod-z'] = undo;
  keys['Mod-Shift-z'] = redo;
  keys['Mod-y'] = redo;

  // List handling
  if (schema.nodes.list_item) {
    keys['Enter'] = splitListItem(schema.nodes.list_item);
    keys['Tab'] = sinkListItem(schema.nodes.list_item);
    keys['Shift-Tab'] = liftListItem(schema.nodes.list_item);
  }

  // Hard break
  if (schema.nodes.hard_break) {
    const br = schema.nodes.hard_break;
    const cmd = chainCommands(newlineInCode, (state, dispatch) => {
      if (dispatch) {
        dispatch(state.tr.replaceSelectionWith(br.create()).scrollIntoView());
      }
      return true;
    });
    keys['Shift-Enter'] = cmd;
  }

  // Default enter behavior
  keys['Enter'] = chainCommands(
    schema.nodes.list_item ? splitListItem(schema.nodes.list_item) : () => false,
    newlineInCode,
    createParagraphNear,
    liftEmptyBlock,
    splitBlock
  );

  return keymap(keys);
}

export function buildBaseKeymap(): Plugin {
  return keymap(baseKeymap);
}
