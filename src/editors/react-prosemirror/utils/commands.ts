import { EditorState, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Schema, MarkType, NodeType, type Attrs } from 'prosemirror-model';
import { toggleMark, setBlockType, wrapIn, lift } from 'prosemirror-commands';
import { wrapInList, liftListItem, sinkListItem } from 'prosemirror-schema-list';

export type Command = (state: EditorState, dispatch?: (tr: Transaction) => void, view?: EditorView) => boolean;

// Toggle a mark on/off
export function toggleMarkCommand(markType: MarkType, attrs?: Attrs): Command {
  return toggleMark(markType, attrs);
}

// Check if a mark is active
export function isMarkActive(state: EditorState, markType: MarkType): boolean {
  const { from, $from, to, empty } = state.selection;
  if (empty) {
    return !!markType.isInSet(state.storedMarks || $from.marks());
  }
  return state.doc.rangeHasMark(from, to, markType);
}

// Check if a block type is active
export function isBlockTypeActive(state: EditorState, nodeType: NodeType, attrs?: Attrs): boolean {
  const { $from, to } = state.selection;
  let active = false;
  
  state.doc.nodesBetween($from.pos, to, (node) => {
    if (node.type === nodeType) {
      if (!attrs || Object.keys(attrs).every(key => node.attrs[key] === attrs[key])) {
        active = true;
      }
    }
  });
  
  return active;
}

// Set block type command
export function setBlockTypeCommand(nodeType: NodeType, attrs?: Attrs): Command {
  return setBlockType(nodeType, attrs);
}

// Wrap in block quote
export function wrapInBlockquote(schema: Schema): Command {
  const blockquoteType = schema.nodes.blockquote;
  if (!blockquoteType) return () => false;
  return wrapIn(blockquoteType);
}

// Lift out of blockquote
export function liftFromBlockquote(): Command {
  return lift;
}

// Wrap in bullet list
export function toggleBulletList(schema: Schema): Command {
  const listType = schema.nodes.bullet_list;
  const itemType = schema.nodes.list_item;
  if (!listType || !itemType) return () => false;
  
  return (state, dispatch) => {
    if (isBlockTypeActive(state, listType)) {
      return liftListItem(itemType)(state, dispatch);
    }
    return wrapInList(listType)(state, dispatch);
  };
}

// Wrap in ordered list
export function toggleOrderedList(schema: Schema): Command {
  const listType = schema.nodes.ordered_list;
  const itemType = schema.nodes.list_item;
  if (!listType || !itemType) return () => false;
  
  return (state, dispatch) => {
    if (isBlockTypeActive(state, listType)) {
      return liftListItem(itemType)(state, dispatch);
    }
    return wrapInList(listType)(state, dispatch);
  };
}

// Indent list item
export function indentListItem(schema: Schema): Command {
  const itemType = schema.nodes.list_item;
  if (!itemType) return () => false;
  return sinkListItem(itemType);
}

// Outdent list item
export function outdentListItem(schema: Schema): Command {
  const itemType = schema.nodes.list_item;
  if (!itemType) return () => false;
  return liftListItem(itemType);
}

// Set text alignment
export function setTextAlign(alignment: string | null): Command {
  return (state, dispatch) => {
    const { from, to } = state.selection;
    let tr = state.tr;
    
    state.doc.nodesBetween(from, to, (node, pos) => {
      if (node.type.name === 'paragraph' || node.type.name === 'heading') {
        tr = tr.setNodeMarkup(pos, undefined, {
          ...node.attrs,
          textAlign: alignment,
        });
      }
    });
    
    if (dispatch) {
      dispatch(tr);
    }
    return true;
  };
}

// Insert image
export function insertImage(src: string, alt?: string, title?: string): Command {
  return (state, dispatch) => {
    const imageType = state.schema.nodes.image;
    if (!imageType) return false;
    
    const { from } = state.selection;
    const node = imageType.create({ src, alt, title });
    
    if (dispatch) {
      dispatch(state.tr.insert(from, node));
    }
    return true;
  };
}

// Insert video
export function insertVideo(src: string): Command {
  return (state, dispatch) => {
    const videoType = state.schema.nodes.video;
    if (!videoType) return false;
    
    const { from } = state.selection;
    const node = videoType.create({ src, controls: true });
    
    if (dispatch) {
      dispatch(state.tr.insert(from, node));
    }
    return true;
  };
}

// Insert file attachment
export function insertFile(href: string, filename: string, fileType?: string): Command {
  return (state, dispatch) => {
    const fileNodeType = state.schema.nodes.file;
    if (!fileNodeType) return false;
    
    const { from } = state.selection;
    const node = fileNodeType.create({ href, filename, fileType: fileType || 'file' });
    
    if (dispatch) {
      dispatch(state.tr.insert(from, node));
    }
    return true;
  };
}

// Toggle link
export function toggleLink(href: string, title?: string): Command {
  return (state, dispatch) => {
    const linkMark = state.schema.marks.link;
    if (!linkMark) return false;
    
    if (isMarkActive(state, linkMark)) {
      return toggleMark(linkMark)(state, dispatch);
    }
    
    return toggleMark(linkMark, { href, title, target: '_blank' })(state, dispatch);
  };
}

// Remove link
export function removeLink(): Command {
  return (state, dispatch) => {
    const linkMark = state.schema.marks.link;
    if (!linkMark) return false;
    
    if (!isMarkActive(state, linkMark)) return false;
    
    return toggleMark(linkMark)(state, dispatch);
  };
}

// Set text color
export function setTextColor(color: string): Command {
  return (state, dispatch) => {
    const colorMark = state.schema.marks.textColor;
    if (!colorMark) return false;
    
    const { from, to, empty } = state.selection;
    
    if (dispatch) {
      let tr = state.tr;
      if (!empty) {
        tr = tr.removeMark(from, to, colorMark);
        tr = tr.addMark(from, to, colorMark.create({ color }));
      } else {
        tr = tr.addStoredMark(colorMark.create({ color }));
      }
      dispatch(tr);
    }
    return true;
  };
}

// Set background color
export function setBackgroundColor(color: string): Command {
  return (state, dispatch) => {
    const bgMark = state.schema.marks.backgroundColor;
    if (!bgMark) return false;
    
    const { from, to, empty } = state.selection;
    
    if (dispatch) {
      let tr = state.tr;
      if (!empty) {
        tr = tr.removeMark(from, to, bgMark);
        tr = tr.addMark(from, to, bgMark.create({ color }));
      } else {
        tr = tr.addStoredMark(bgMark.create({ color }));
      }
      dispatch(tr);
    }
    return true;
  };
}

// Set font size
export function setFontSize(size: string): Command {
  return (state, dispatch) => {
    const sizeMark = state.schema.marks.fontSize;
    if (!sizeMark) return false;
    
    const { from, to, empty } = state.selection;
    
    if (dispatch) {
      let tr = state.tr;
      if (!empty) {
        tr = tr.removeMark(from, to, sizeMark);
        tr = tr.addMark(from, to, sizeMark.create({ size }));
      } else {
        tr = tr.addStoredMark(sizeMark.create({ size }));
      }
      dispatch(tr);
    }
    return true;
  };
}

// Get current text alignment
export function getCurrentTextAlign(state: EditorState): string | null {
  const { $from } = state.selection;
  const node = $from.parent;
  if (node.type.name === 'paragraph' || node.type.name === 'heading') {
    return node.attrs.textAlign;
  }
  return null;
}

// Get current font size
export function getCurrentFontSize(state: EditorState): string | null {
  const { from, $from, to, empty } = state.selection;
  const sizeMark = state.schema.marks.fontSize;
  if (!sizeMark) return null;
  
  if (empty) {
    const marks = state.storedMarks || $from.marks();
    for (const mark of marks) {
      if (mark.type === sizeMark) {
        return mark.attrs.size;
      }
    }
    return null;
  }
  
  let size: string | null = null;
  state.doc.nodesBetween(from, to, (node) => {
    for (const mark of node.marks) {
      if (mark.type === sizeMark) {
        size = mark.attrs.size;
      }
    }
  });
  return size;
}

// Get current text color
export function getCurrentTextColor(state: EditorState): string | null {
  const { from, $from, to, empty } = state.selection;
  const colorMark = state.schema.marks.textColor;
  if (!colorMark) return null;
  
  if (empty) {
    const marks = state.storedMarks || $from.marks();
    for (const mark of marks) {
      if (mark.type === colorMark) {
        return mark.attrs.color;
      }
    }
    return null;
  }
  
  let color: string | null = null;
  state.doc.nodesBetween(from, to, (node) => {
    for (const mark of node.marks) {
      if (mark.type === colorMark) {
        color = mark.attrs.color;
      }
    }
  });
  return color;
}

// Get current background color
export function getCurrentBgColor(state: EditorState): string | null {
  const { from, $from, to, empty } = state.selection;
  const bgMark = state.schema.marks.backgroundColor;
  if (!bgMark) return null;
  
  if (empty) {
    const marks = state.storedMarks || $from.marks();
    for (const mark of marks) {
      if (mark.type === bgMark) {
        return mark.attrs.color;
      }
    }
    return null;
  }
  
  let color: string | null = null;
  state.doc.nodesBetween(from, to, (node) => {
    for (const mark of node.marks) {
      if (mark.type === bgMark) {
        color = mark.attrs.color;
      }
    }
  });
  return color;
}
