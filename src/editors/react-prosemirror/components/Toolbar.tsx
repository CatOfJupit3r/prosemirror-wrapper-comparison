import { useState, useRef } from 'react';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { useEditorEventCallback } from '@handlewithcare/react-prosemirror';
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaStrikethrough,
  FaListUl,
  FaListOl,
  FaIndent,
  FaOutdent,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaAlignJustify,
  FaQuoteRight,
  FaLink,
  FaUnlink,
  FaImage,
  FaVideo,
  FaPaperclip,
  FaFont,
  FaChevronDown,
  FaPalette,
  FaHighlighter,
} from 'react-icons/fa';
import {
  toggleMarkCommand,
  isMarkActive,
  toggleBulletList,
  toggleOrderedList,
  indentListItem,
  outdentListItem,
  setTextColor,
  setBackgroundColor,
  setFontSize,
  setTextAlign,
  wrapInBlockquote,
  toggleLink,
  removeLink,
  insertImage,
  insertVideo,
  insertFile,
  getCurrentTextAlign,
} from '../utils/commands';
import { Dropdown } from './Dropdown';
import './Toolbar.css';

interface ToolbarProps {
  state: EditorState;
  variant: 'basic' | 'extended';
}

const FONT_SIZES = [
  { label: 'Small', value: '12px' },
  { label: 'Normal', value: '14px' },
  { label: 'Medium', value: '16px' },
  { label: 'Large', value: '18px' },
  { label: 'X-Large', value: '20px' },
  { label: 'XX-Large', value: '24px' },
  { label: 'Huge', value: '28px' },
  { label: 'Massive', value: '32px' },
];

const TEXT_COLORS = [
  { color: '#000000', name: 'Black' },
  { color: '#434343', name: 'Dark Gray' },
  { color: '#666666', name: 'Gray' },
  { color: '#999999', name: 'Light Gray' },
  { color: '#E53935', name: 'Red' },
  { color: '#D81B60', name: 'Pink' },
  { color: '#8E24AA', name: 'Purple' },
  { color: '#5E35B1', name: 'Deep Purple' },
  { color: '#1E88E5', name: 'Blue' },
  { color: '#00ACC1', name: 'Cyan' },
  { color: '#43A047', name: 'Green' },
  { color: '#F9A825', name: 'Yellow' },
  { color: '#FB8C00', name: 'Orange' },
  { color: '#6D4C41', name: 'Brown' },
  { color: '#546E7A', name: 'Blue Gray' },
  { color: '#FFFFFF', name: 'White' },
];

const BG_COLORS = [
  { color: 'transparent', name: 'None' },
  { color: '#FFEB3B', name: 'Yellow' },
  { color: '#C8E6C9', name: 'Light Green' },
  { color: '#B3E5FC', name: 'Light Blue' },
  { color: '#F8BBD9', name: 'Light Pink' },
  { color: '#E1BEE7', name: 'Light Purple' },
  { color: '#FFCCBC', name: 'Light Orange' },
  { color: '#CFD8DC', name: 'Light Gray' },
  { color: '#FFF59D', name: 'Pale Yellow' },
  { color: '#A5D6A7', name: 'Mint' },
  { color: '#81D4FA', name: 'Sky Blue' },
  { color: '#F48FB1', name: 'Rose' },
  { color: '#CE93D8', name: 'Lavender' },
  { color: '#FFAB91', name: 'Peach' },
  { color: '#B0BEC5', name: 'Silver' },
  { color: '#FFFFFF', name: 'White' },
];

export function Toolbar({ state, variant }: ToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [showFontSizePicker, setShowFontSizePicker] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleToggleMark = useEditorEventCallback((view: EditorView, markName: string) => {
    const markType = view.state.schema.marks[markName];
    if (markType) {
      toggleMarkCommand(markType)(view.state, view.dispatch, view);
      view.focus();
    }
  });

  const handleBulletList = useEditorEventCallback((view: EditorView) => {
    toggleBulletList(view.state.schema)(view.state, view.dispatch, view);
    view.focus();
  });

  const handleOrderedList = useEditorEventCallback((view: EditorView) => {
    toggleOrderedList(view.state.schema)(view.state, view.dispatch, view);
    view.focus();
  });

  const handleIndent = useEditorEventCallback((view: EditorView) => {
    indentListItem(view.state.schema)(view.state, view.dispatch, view);
    view.focus();
  });

  const handleOutdent = useEditorEventCallback((view: EditorView) => {
    outdentListItem(view.state.schema)(view.state, view.dispatch, view);
    view.focus();
  });

  const handleTextColor = useEditorEventCallback((view: EditorView, color: string) => {
    setTextColor(color)(view.state, view.dispatch, view);
    view.focus();
    setShowColorPicker(false);
  });

  const handleBgColor = useEditorEventCallback((view: EditorView, color: string) => {
    setBackgroundColor(color)(view.state, view.dispatch, view);
    view.focus();
    setShowBgColorPicker(false);
  });

  const handleFontSize = useEditorEventCallback((view: EditorView, size: string) => {
    setFontSize(size)(view.state, view.dispatch, view);
    view.focus();
    setShowFontSizePicker(false);
  });

  const handleTextAlign = useEditorEventCallback((view: EditorView, alignment: string | null) => {
    setTextAlign(alignment)(view.state, view.dispatch, view);
    view.focus();
  });

  const handleBlockquote = useEditorEventCallback((view: EditorView) => {
    wrapInBlockquote(view.state.schema)(view.state, view.dispatch, view);
    view.focus();
  });

  const handleAddLink = useEditorEventCallback((view: EditorView) => {
    if (linkUrl) {
      toggleLink(linkUrl)(view.state, view.dispatch, view);
      view.focus();
      setLinkUrl('');
      setShowLinkInput(false);
    }
  });

  const handleRemoveLink = useEditorEventCallback((view: EditorView) => {
    removeLink()(view.state, view.dispatch, view);
    view.focus();
  });

  const handleImageInsert = useEditorEventCallback((view: EditorView, src: string, filename: string) => {
    insertImage(src, filename)(view.state, view.dispatch, view);
    view.focus();
  });

  const handleVideoInsert = useEditorEventCallback((view: EditorView, src: string) => {
    insertVideo(src)(view.state, view.dispatch, view);
    view.focus();
  });

  const handleFileInsert = useEditorEventCallback((view: EditorView, src: string, filename: string, filetype: string) => {
    insertFile(src, filename, filetype)(view.state, view.dispatch, view);
    view.focus();
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        handleImageInsert(reader.result as string, file.name);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        handleVideoInsert(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        handleFileInsert(reader.result as string, file.name, file.type);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const isActive = (markName: string) => {
    const markType = state.schema.marks[markName];
    return markType ? isMarkActive(state, markType) : false;
  };

  const currentAlign = getCurrentTextAlign(state);

  return (
    <div className="pm-toolbar">
      {/* Font Size */}
      <div className="pm-toolbar-group">
        <Dropdown
          isOpen={showFontSizePicker}
          onOpenChange={setShowFontSizePicker}
          trigger={
            <button 
              type="button"
              className="pm-toolbar-btn pm-toolbar-btn-with-dropdown"
              title="Font Size"
            >
              <FaFont size={14} />
              <FaChevronDown size={8} className="pm-chevron" />
            </button>
          }
        >
          <div className="pm-dropdown-title">Font Size</div>
          <div className="pm-dropdown-scroll">
            {FONT_SIZES.map(({ label, value }) => (
              <button 
                key={value} 
                type="button"
                className="pm-dropdown-item"
                onClick={() => handleFontSize(value)}
              >
                <span style={{ fontSize: value }}>{label}</span>
                <span className="pm-dropdown-item-value">{value}</span>
              </button>
            ))}
          </div>
        </Dropdown>
      </div>

      <div className="pm-toolbar-divider" />

      {/* Text Formatting */}
      <div className="pm-toolbar-group">
        <button
          type="button"
          className={`pm-toolbar-btn ${isActive('bold') ? 'active' : ''}`}
          onClick={() => handleToggleMark('bold')}
          title="Bold (⌘B)"
        >
          <FaBold size={14} />
        </button>
        <button
          type="button"
          className={`pm-toolbar-btn ${isActive('italic') ? 'active' : ''}`}
          onClick={() => handleToggleMark('italic')}
          title="Italic (⌘I)"
        >
          <FaItalic size={14} />
        </button>
        <button
          type="button"
          className={`pm-toolbar-btn ${isActive('underline') ? 'active' : ''}`}
          onClick={() => handleToggleMark('underline')}
          title="Underline (⌘U)"
        >
          <FaUnderline size={14} />
        </button>
        <button
          type="button"
          className={`pm-toolbar-btn ${isActive('strikethrough') ? 'active' : ''}`}
          onClick={() => handleToggleMark('strikethrough')}
          title="Strikethrough"
        >
          <FaStrikethrough size={14} />
        </button>
      </div>

      <div className="pm-toolbar-divider" />

      {/* Colors */}
      <div className="pm-toolbar-group">
        <Dropdown
          isOpen={showColorPicker}
          onOpenChange={setShowColorPicker}
          className="pm-color-dropdown"
          trigger={
            <button 
              type="button"
              className="pm-toolbar-btn pm-toolbar-btn-with-dropdown"
              title="Text Color"
            >
              <FaPalette size={14} />
              <FaChevronDown size={8} className="pm-chevron" />
            </button>
          }
        >
          <div className="pm-dropdown-title">Text Color</div>
          <div className="pm-color-grid">
            {TEXT_COLORS.map(({ color, name }) => (
              <button
                key={color}
                type="button"
                className="pm-color-btn"
                style={{ backgroundColor: color }}
                onClick={() => handleTextColor(color)}
                title={name}
              />
            ))}
          </div>
        </Dropdown>

        <Dropdown
          isOpen={showBgColorPicker}
          onOpenChange={setShowBgColorPicker}
          className="pm-color-dropdown"
          trigger={
            <button 
              type="button"
              className="pm-toolbar-btn pm-toolbar-btn-with-dropdown"
              title="Highlight Color"
            >
              <FaHighlighter size={14} />
              <FaChevronDown size={8} className="pm-chevron" />
            </button>
          }
        >
          <div className="pm-dropdown-title">Highlight Color</div>
          <div className="pm-color-grid">
            {BG_COLORS.map(({ color, name }) => (
              <button
                key={color}
                type="button"
                className={`pm-color-btn ${color === 'transparent' ? 'pm-color-btn-none' : ''}`}
                style={{ backgroundColor: color === 'transparent' ? '#fff' : color }}
                onClick={() => handleBgColor(color)}
                title={name}
              >
                {color === 'transparent' && <span className="pm-color-none-x">×</span>}
              </button>
            ))}
          </div>
        </Dropdown>
      </div>

      <div className="pm-toolbar-divider" />

      {/* Lists */}
      <div className="pm-toolbar-group">
        <button
          type="button"
          className="pm-toolbar-btn"
          onClick={handleBulletList}
          title="Bullet List"
        >
          <FaListUl size={14} />
        </button>
        <button
          type="button"
          className="pm-toolbar-btn"
          onClick={handleOrderedList}
          title="Numbered List"
        >
          <FaListOl size={14} />
        </button>
        <button
          type="button"
          className="pm-toolbar-btn"
          onClick={handleOutdent}
          title="Decrease Indent"
        >
          <FaOutdent size={14} />
        </button>
        <button
          type="button"
          className="pm-toolbar-btn"
          onClick={handleIndent}
          title="Increase Indent"
        >
          <FaIndent size={14} />
        </button>
      </div>

      {/* Extended features */}
      {variant === 'extended' && (
        <>
          <div className="pm-toolbar-divider" />

          {/* Text Alignment */}
          <div className="pm-toolbar-group">
            <button
              type="button"
              className={`pm-toolbar-btn ${currentAlign === null || currentAlign === 'left' ? 'active' : ''}`}
              onClick={() => handleTextAlign('left')}
              title="Align Left"
            >
              <FaAlignLeft size={14} />
            </button>
            <button
              type="button"
              className={`pm-toolbar-btn ${currentAlign === 'center' ? 'active' : ''}`}
              onClick={() => handleTextAlign('center')}
              title="Align Center"
            >
              <FaAlignCenter size={14} />
            </button>
            <button
              type="button"
              className={`pm-toolbar-btn ${currentAlign === 'right' ? 'active' : ''}`}
              onClick={() => handleTextAlign('right')}
              title="Align Right"
            >
              <FaAlignRight size={14} />
            </button>
            <button
              type="button"
              className={`pm-toolbar-btn ${currentAlign === 'justify' ? 'active' : ''}`}
              onClick={() => handleTextAlign('justify')}
              title="Justify"
            >
              <FaAlignJustify size={14} />
            </button>
          </div>

          <div className="pm-toolbar-divider" />

          {/* Block Quote */}
          <div className="pm-toolbar-group">
            <button
              type="button"
              className="pm-toolbar-btn"
              onClick={handleBlockquote}
              title="Block Quote"
            >
              <FaQuoteRight size={14} />
            </button>
          </div>

          <div className="pm-toolbar-divider" />

          {/* Links */}
          <div className="pm-toolbar-group">
            <Dropdown
              isOpen={showLinkInput}
              onOpenChange={setShowLinkInput}
              className="pm-link-dropdown"
              trigger={
                <button
                  type="button"
                  className={`pm-toolbar-btn ${isActive('link') ? 'active' : ''}`}
                  title="Insert Link"
                >
                  <FaLink size={14} />
                </button>
              }
            >
              <div className="pm-dropdown-title">Insert Link</div>
              <div className="pm-link-input-wrapper">
                <input
                  type="url"
                  className="pm-link-input"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddLink()}
                />
                <button 
                  type="button" 
                  className="pm-link-submit"
                  onClick={handleAddLink}
                  disabled={!linkUrl}
                >
                  Add
                </button>
              </div>
            </Dropdown>

            {isActive('link') && (
              <button
                type="button"
                className="pm-toolbar-btn"
                onClick={handleRemoveLink}
                title="Remove Link"
              >
                <FaUnlink size={14} />
              </button>
            )}
          </div>

          <div className="pm-toolbar-divider" />

          {/* Media */}
          <div className="pm-toolbar-group">
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageUpload}
            />
            <button
              type="button"
              className="pm-toolbar-btn"
              onClick={() => imageInputRef.current?.click()}
              title="Insert Image"
            >
              <FaImage size={14} />
            </button>
            
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              style={{ display: 'none' }}
              onChange={handleVideoUpload}
            />
            <button
              type="button"
              className="pm-toolbar-btn"
              onClick={() => videoInputRef.current?.click()}
              title="Insert Video"
            >
              <FaVideo size={14} />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <button
              type="button"
              className="pm-toolbar-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Attach File"
            >
              <FaPaperclip size={14} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
