import { Schema, type NodeSpec, type MarkSpec } from 'prosemirror-model';

// Node specifications
const nodes: Record<string, NodeSpec> = {
  doc: {
    content: 'block+',
  },
  paragraph: {
    content: 'inline*',
    group: 'block',
    attrs: {
      textAlign: { default: null },
    },
    parseDOM: [
      {
        tag: 'p',
        getAttrs: (dom) => {
          const element = dom;
          return {
            textAlign: element.style.textAlign || null,
          };
        },
      },
    ],
    toDOM(node) {
      const attrs: Record<string, string> = {};
      if (node.attrs.textAlign) {
        attrs.style = `text-align: ${node.attrs.textAlign}`;
      }
      return ['p', attrs, 0];
    },
  },
  blockquote: {
    content: 'block+',
    group: 'block',
    parseDOM: [{ tag: 'blockquote' }],
    toDOM() {
      return ['blockquote', 0];
    },
  },
  horizontal_rule: {
    group: 'block',
    parseDOM: [{ tag: 'hr' }],
    toDOM() {
      return ['hr'];
    },
  },
  heading: {
    attrs: { level: { default: 1 }, textAlign: { default: null } },
    content: 'inline*',
    group: 'block',
    defining: true,
    parseDOM: [
      { tag: 'h1', attrs: { level: 1 } },
      { tag: 'h2', attrs: { level: 2 } },
      { tag: 'h3', attrs: { level: 3 } },
      { tag: 'h4', attrs: { level: 4 } },
      { tag: 'h5', attrs: { level: 5 } },
      { tag: 'h6', attrs: { level: 6 } },
    ],
    toDOM(node) {
      const attrs: Record<string, string> = {};
      if (node.attrs.textAlign) {
        attrs.style = `text-align: ${node.attrs.textAlign}`;
      }
      return ['h' + node.attrs.level, attrs, 0];
    },
  },
  bullet_list: {
    content: 'list_item+',
    group: 'block',
    parseDOM: [{ tag: 'ul' }],
    toDOM() {
      return ['ul', 0];
    },
  },
  ordered_list: {
    content: 'list_item+',
    group: 'block',
    attrs: { order: { default: 1 } },
    parseDOM: [
      {
        tag: 'ol',
        getAttrs: (dom) => ({
          order: (dom as HTMLElement).hasAttribute('start')
            ? +(dom as HTMLElement).getAttribute('start')!
            : 1,
        }),
      },
    ],
    toDOM(node) {
      return node.attrs.order === 1
        ? ['ol', 0]
        : ['ol', { start: node.attrs.order }, 0];
    },
  },
  list_item: {
    content: 'paragraph block*',
    parseDOM: [{ tag: 'li' }],
    toDOM() {
      return ['li', 0];
    },
    defining: true,
  },
  text: {
    group: 'inline',
  },
  image: {
    inline: true,
    attrs: {
      src: {},
      alt: { default: null },
      title: { default: null },
    },
    group: 'inline',
    draggable: true,
    parseDOM: [
      {
        tag: 'img[src]',
        getAttrs: (dom) => {
          const element = dom as HTMLElement;
          return {
            src: element.getAttribute('src'),
            title: element.getAttribute('title'),
            alt: element.getAttribute('alt'),
          };
        },
      },
    ],
    toDOM(node) {
      return ['img', node.attrs];
    },
  },
  video: {
    inline: false,
    group: 'block',
    attrs: {
      src: {},
      controls: { default: true },
    },
    parseDOM: [
      {
        tag: 'video',
        getAttrs: (dom) => {
          const element = dom as HTMLElement;
          return {
            src: element.getAttribute('src'),
            controls: element.hasAttribute('controls'),
          };
        },
      },
    ],
    toDOM(node) {
      return ['video', { ...node.attrs, controls: node.attrs.controls ? 'true' : null }];
    },
  },
  file: {
    inline: true,
    group: 'inline',
    attrs: {
      href: {},
      filename: {},
      fileType: { default: 'file' },
    },
    parseDOM: [
      {
        tag: 'a[data-file]',
        getAttrs: (dom) => {
          const element = dom as HTMLElement;
          return {
            href: element.getAttribute('href'),
            filename: element.getAttribute('data-filename'),
            fileType: element.getAttribute('data-filetype') || 'file',
          };
        },
      },
    ],
    toDOM(node) {
      return [
        'a',
        {
          href: node.attrs.href,
          'data-file': 'true',
          'data-filename': node.attrs.filename,
          'data-filetype': node.attrs.fileType,
          class: 'file-attachment',
        },
        ['span', { class: 'file-icon' }, '📎'],
        ['span', { class: 'file-name' }, node.attrs.filename],
      ];
    },
  },
  hard_break: {
    inline: true,
    group: 'inline',
    selectable: false,
    parseDOM: [{ tag: 'br' }],
    toDOM() {
      return ['br'];
    },
  },
};

// Mark specifications
const marks: Record<string, MarkSpec> = {
  bold: {
    parseDOM: [
      { tag: 'strong' },
      { tag: 'b', getAttrs: (node) => (node as HTMLElement).style.fontWeight !== 'normal' && null },
      {
        style: 'font-weight',
        getAttrs: (value) => /^(bold(er)?|[5-9]\d{2,})$/.test(value as string) && null,
      },
    ],
    toDOM() {
      return ['strong', 0];
    },
  },
  italic: {
    parseDOM: [
      { tag: 'i' },
      { tag: 'em' },
      { style: 'font-style=italic' },
    ],
    toDOM() {
      return ['em', 0];
    },
  },
  underline: {
    parseDOM: [
      { tag: 'u' },
      { style: 'text-decoration=underline' },
    ],
    toDOM() {
      return ['u', 0];
    },
  },
  strikethrough: {
    parseDOM: [
      { tag: 's' },
      { tag: 'strike' },
      { tag: 'del' },
      { style: 'text-decoration=line-through' },
    ],
    toDOM() {
      return ['s', 0];
    },
  },
  textColor: {
    attrs: { color: {} },
    parseDOM: [
      {
        style: 'color',
        getAttrs: (value) => ({ color: value }),
      },
    ],
    toDOM(mark) {
      return ['span', { style: `color: ${mark.attrs.color}` }, 0];
    },
  },
  backgroundColor: {
    attrs: { color: {} },
    parseDOM: [
      {
        style: 'background-color',
        getAttrs: (value) => ({ color: value }),
      },
    ],
    toDOM(mark) {
      return ['span', { style: `background-color: ${mark.attrs.color}` }, 0];
    },
  },
  link: {
    attrs: {
      href: {},
      title: { default: null },
      target: { default: '_blank' },
    },
    inclusive: false,
    parseDOM: [
      {
        tag: 'a[href]',
        getAttrs: (dom) => {
          const element = dom as HTMLElement;
          return {
            href: element.getAttribute('href'),
            title: element.getAttribute('title'),
            target: element.getAttribute('target'),
          };
        },
      },
    ],
    toDOM(mark) {
      return ['a', { href: mark.attrs.href, title: mark.attrs.title, target: mark.attrs.target }, 0];
    },
  },
  fontSize: {
    attrs: { size: {} },
    parseDOM: [
      {
        style: 'font-size',
        getAttrs: (value) => ({ size: value }),
      },
    ],
    toDOM(mark) {
      return ['span', { style: `font-size: ${mark.attrs.size}` }, 0];
    },
  },
};

// Basic schema (for Basic variant)
export const basicSchema = new Schema({
  nodes: {
    doc: nodes.doc,
    paragraph: nodes.paragraph,
    bullet_list: nodes.bullet_list,
    ordered_list: nodes.ordered_list,
    list_item: nodes.list_item,
    text: nodes.text,
    hard_break: nodes.hard_break,
  },
  marks: {
    bold: marks.bold,
    italic: marks.italic,
    underline: marks.underline,
    strikethrough: marks.strikethrough,
    textColor: marks.textColor,
    backgroundColor: marks.backgroundColor,
    fontSize: marks.fontSize,
  },
});

// Extended schema (includes all features)
export const extendedSchema = new Schema({
  nodes,
  marks,
});

export { nodes, marks };
