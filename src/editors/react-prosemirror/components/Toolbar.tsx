import { useState, useRef, useCallback } from 'react';
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
  FaChevronDown,
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
  getCurrentFontSize,
  getCurrentTextColor,
  getCurrentBgColor,
} from '../utils/commands';
import { Dropdown } from './Dropdown';
import './Toolbar.css';

interface ToolbarProps {
  state: EditorState;
  variant: 'basic' | 'extended';
}

const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px'];

const TEXT_COLORS = [
  '#000000', '#374151', '#6b7280', '#9ca3af',
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899',
];

const BACKGROUND_COLORS = [
  'transparent', '#fef3c7', '#fce7f3', '#dbeafe',
  '#dcfce7', '#f3e8ff', '#fee2e2', '#e0e7ff',
  '#ccfbf1', '#fef9c3', '#f5f5f4', '#e2e8f0',
];

export function Toolbar({ state, variant }: ToolbarProps) {
  const isExtended = variant === 'extended';
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

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        handleImageInsert(reader.result as string, file.name);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  }, [handleImageInsert]);

  const handleVideoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        handleVideoInsert(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  }, [handleVideoInsert]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        handleFileInsert(reader.result as string, file.name, file.type);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  }, [handleFileInsert]);

  const isActive = (markName: string) => {
    const markType = state.schema.marks[markName];
    return markType ? isMarkActive(state, markType) : false;
  };

  const currentAlign = getCurrentTextAlign(state);
  const currentFontSize = getCurrentFontSize(state) || '16px';
  const currentTextColor = getCurrentTextColor(state) || '#000000';
  const currentBgColor = getCurrentBgColor(state);

  return (
    <div className="prosemirror-toolbar">
      {/* Font Size Dropdown */}
      <Dropdown
        trigger={
          <button type="button" className={`toolbar-btn dropdown-trigger ${currentFontSize !== '16px' ? 'active' : ''}`}>
            {currentFontSize} <FaChevronDown size={8} />
          </button>
        }
        isOpen={showFontSizePicker}
        onOpenChange={setShowFontSizePicker}
      >
        <div className="font-size-options">
          {FONT_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              className={`font-size-option ${currentFontSize === size ? 'active' : ''}`}
              onClick={() => handleFontSize(size)}
              style={{ fontSize: size }}
            >
              {size}
            </button>
          ))}
        </div>
      </Dropdown>

      <div className="toolbar-divider" />

      {/* Text Formatting */}
      <button
        type="button"
        className={`toolbar-btn ${isActive('bold') ? 'active' : ''}`}
        onClick={() => handleToggleMark('bold')}
        title="Bold (Ctrl+B)"
      >
        <FaBold />
      </button>
      <button
        type="button"
        className={`toolbar-btn ${isActive('italic') ? 'active' : ''}`}
        onClick={() => handleToggleMark('italic')}
        title="Italic (Ctrl+I)"
      >
        <FaItalic />
      </button>
      <button
        type="button"
        className={`toolbar-btn ${isActive('underline') ? 'active' : ''}`}
        onClick={() => handleToggleMark('underline')}
        title="Underline (Ctrl+U)"
      >
        <FaUnderline />
      </button>
      <button
        type="button"
        className={`toolbar-btn ${isActive('strikethrough') ? 'active' : ''}`}
        onClick={() => handleToggleMark('strikethrough')}
        title="Strikethrough"
      >
        <FaStrikethrough />
      </button>

      <div className="toolbar-divider" />

      {/* Text Color */}
      <Dropdown
        trigger={
          <button 
            type="button" 
            className={`toolbar-btn color-btn ${currentTextColor !== '#000000' ? 'active' : ''}`} 
            title="Text Color"
          >
            <span className="color-icon">A</span>
            <span
              className="color-indicator"
              style={{ backgroundColor: currentTextColor }}
            />
          </button>
        }
        isOpen={showColorPicker}
        onOpenChange={setShowColorPicker}
      >
        <div className="color-grid">
          {TEXT_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={`color-option ${currentTextColor === color ? 'active' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => handleTextColor(color)}
              title={color}
            />
          ))}
        </div>
      </Dropdown>

      {/* Background Color */}
      <Dropdown
        trigger={
          <button 
            type="button" 
            className={`toolbar-btn color-btn ${currentBgColor && currentBgColor !== 'transparent' ? 'active' : ''}`} 
            title="Background Color"
          >
            <span
              className="bg-color-icon"
              style={{ backgroundColor: currentBgColor || '#fef3c7' }}
            >
              A
            </span>
          </button>
        }
        isOpen={showBgColorPicker}
        onOpenChange={setShowBgColorPicker}
      >
        <div className="color-grid">
          {BACKGROUND_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={`color-option ${color === 'transparent' ? 'transparent-color' : ''} ${(currentBgColor === color) || (!currentBgColor && color === 'transparent') ? 'active' : ''}`}
              style={{ backgroundColor: color === 'transparent' ? '#fff' : color }}
              onClick={() => handleBgColor(color)}
              title={color === 'transparent' ? 'No highlight' : color}
            />
          ))}
        </div>
      </Dropdown>

      <div className="toolbar-divider" />

      {/* Lists */}
      <button
        type="button"
        className="toolbar-btn"
        onClick={handleBulletList}
        title="Bullet List"
      >
        <FaListUl />
      </button>
      <button
        type="button"
        className="toolbar-btn"
        onClick={handleOrderedList}
        title="Numbered List"
      >
        <FaListOl />
      </button>

      {/* Indentation */}
      <button
        type="button"
        className="toolbar-btn"
        onClick={handleOutdent}
        title="Decrease Indent (Shift+Tab)"
      >
        <FaOutdent />
      </button>
      <button
        type="button"
        className="toolbar-btn"
        onClick={handleIndent}
        title="Increase Indent (Tab)"
      >
        <FaIndent />
      </button>

      {/* Extended Features */}
      {isExtended && (
        <>
          <div className="toolbar-divider" />

          {/* Block Quote */}
          <button
            type="button"
            className="toolbar-btn"
            onClick={handleBlockquote}
            title="Block Quote"
          >
            <FaQuoteRight />
          </button>

          {/* Text Alignment */}
          <button
            type="button"
            className={`toolbar-btn ${currentAlign === null || currentAlign === 'left' ? 'active' : ''}`}
            onClick={() => handleTextAlign('left')}
            title="Align Left"
          >
            <FaAlignLeft />
          </button>
          <button
            type="button"
            className={`toolbar-btn ${currentAlign === 'center' ? 'active' : ''}`}
            onClick={() => handleTextAlign('center')}
            title="Align Center"
          >
            <FaAlignCenter />
          </button>
          <button
            type="button"
            className={`toolbar-btn ${currentAlign === 'right' ? 'active' : ''}`}
            onClick={() => handleTextAlign('right')}
            title="Align Right"
          >
            <FaAlignRight />
          </button>
          <button
            type="button"
            className={`toolbar-btn ${currentAlign === 'justify' ? 'active' : ''}`}
            onClick={() => handleTextAlign('justify')}
            title="Justify"
          >
            <FaAlignJustify />
          </button>

          <div className="toolbar-divider" />

          {/* Links */}
          <Dropdown
            trigger={
              <button
                type="button"
                className={`toolbar-btn ${isActive('link') ? 'active' : ''}`}
                title="Insert Link"
              >
                <FaLink />
              </button>
            }
            isOpen={showLinkInput}
            onOpenChange={setShowLinkInput}
            closeOnContentClick={false}
          >
            <div className="link-dropdown">
              <div className="link-dropdown-title">Insert Link</div>
              <div className="link-input-wrapper">
                <input
                  type="url"
                  className="link-input"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddLink()}
                />
                <button 
                  type="button" 
                  className="link-submit"
                  onClick={handleAddLink}
                  disabled={!linkUrl}
                >
                  Add
                </button>
              </div>
            </div>
          </Dropdown>
          {isActive('link') && (
            <button
              type="button"
              className="toolbar-btn"
              onClick={handleRemoveLink}
              title="Remove Link"
            >
              <FaUnlink />
            </button>
          )}

          <div className="toolbar-divider" />

          {/* Media */}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageUpload}
          />
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => imageInputRef.current?.click()}
            title="Insert Image"
          >
            <FaImage />
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
            className="toolbar-btn"
            onClick={() => videoInputRef.current?.click()}
            title="Insert Video"
          >
            <FaVideo />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => fileInputRef.current?.click()}
            title="Attach File"
          >
            <FaPaperclip />
          </button>
        </>
      )}
    </div>
  );
}
