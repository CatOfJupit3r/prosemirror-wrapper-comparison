import { useCallback, useState, useRef } from 'react';
import { useCommands, useActive, useRemirrorContext } from '@remirror/react';
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaStrikethrough,
  FaListUl,
  FaListOl,
  FaIndent,
  FaOutdent,
  FaQuoteRight,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaAlignJustify,
  FaLink,
  FaUnlink,
  FaImage,
  FaVideo,
  FaPaperclip,
  FaChevronDown,
} from 'react-icons/fa';
import { Dropdown } from './Dropdown';
import './Toolbar.css';

interface ToolbarProps {
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

export function Toolbar({ variant }: ToolbarProps) {
  const isExtended = variant === 'extended';
  const commands = useCommands();
  const active = useActive();
  const { getState } = useRemirrorContext();
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  // File input refs
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get current font size
  const getFontSize = useCallback(() => {
    try {
      const attrs = getState().selection.$from.marks();
      for (const mark of attrs) {
        if (mark.type.name === 'fontSize' && mark.attrs.size) {
          return mark.attrs.size;
        }
      }
    } catch {
      // Ignore errors when selection is not available
    }
    return '16px';
  }, [getState]);

  // Get current text color
  const getTextColor = useCallback(() => {
    try {
      const attrs = getState().selection.$from.marks();
      for (const mark of attrs) {
        if (mark.type.name === 'textColor' && mark.attrs.color) {
          return mark.attrs.color;
        }
      }
    } catch {
      // Ignore errors
    }
    return '#000000';
  }, [getState]);

  // Get current highlight color
  const getHighlightColor = useCallback(() => {
    try {
      const attrs = getState().selection.$from.marks();
      for (const mark of attrs) {
        if (mark.type.name === 'textHighlight' && mark.attrs.highlight) {
          return mark.attrs.highlight;
        }
      }
    } catch {
      // Ignore errors
    }
    return null;
  }, [getState]);

  // Get current text alignment
  const getCurrentAlign = useCallback(() => {
    try {
      const { $from } = getState().selection;
      const node = $from.parent;
      if (node.attrs?.nodeTextAlignment) {
        return node.attrs.nodeTextAlignment;
      }
    } catch {
      // Ignore errors
    }
    return null;
  }, [getState]);

  const currentFontSize = getFontSize();
  const currentTextColor = getTextColor();
  const currentBgColor = getHighlightColor();
  const currentAlign = getCurrentAlign();

  const handleAddLink = useCallback(() => {
    if (!linkUrl) return;
    commands.updateLink({ href: linkUrl });
    setLinkUrl('');
    setShowLinkInput(false);
  }, [commands, linkUrl]);

  const handleRemoveLink = useCallback(() => {
    commands.removeLink();
  }, [commands]);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        commands.insertImage({ src: reader.result as string, alt: file.name });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  }, [commands]);

  const handleVideoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        commands.insertVideo?.({ src: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  }, [commands]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        commands.insertFileAttachment?.({ src: reader.result as string, name: file.name });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  }, [commands]);

  const handleIndent = useCallback(() => {
    // Check if in list, use list sink, otherwise use nodeFormatting
    if (active.bulletList() || active.orderedList()) {
      commands.sinkListItem?.('listItem');
    } else {
      commands.increaseIndent?.();
    }
  }, [active, commands]);

  const handleOutdent = useCallback(() => {
    if (active.bulletList() || active.orderedList()) {
      commands.liftListItem?.('listItem');
    } else {
      commands.decreaseIndent?.();
    }
  }, [active, commands]);

  return (
    <div className="remirror-toolbar">
      {/* Font Size Dropdown */}
      <Dropdown
        trigger={
          <button type="button" className={`toolbar-btn dropdown-trigger ${currentFontSize === '16px' ? '' : 'active'}`}>
            {currentFontSize} <FaChevronDown size={8} />
          </button>
        }
      >
        <div className="font-size-options">
          {FONT_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              className={`font-size-option ${currentFontSize === size ? 'active' : ''}`}
              onClick={() => commands.setFontSize?.(size)}
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
        className={`toolbar-btn ${active.bold() ? 'active' : ''}`}
        onClick={() => commands.toggleBold()}
        title="Bold (Ctrl+B)"
      >
        <FaBold />
      </button>
      <button
        type="button"
        className={`toolbar-btn ${active.italic() ? 'active' : ''}`}
        onClick={() => commands.toggleItalic()}
        title="Italic (Ctrl+I)"
      >
        <FaItalic />
      </button>
      <button
        type="button"
        className={`toolbar-btn ${active.underline() ? 'active' : ''}`}
        onClick={() => commands.toggleUnderline()}
        title="Underline (Ctrl+U)"
      >
        <FaUnderline />
      </button>
      <button
        type="button"
        className={`toolbar-btn ${active.strike() ? 'active' : ''}`}
        onClick={() => commands.toggleStrike()}
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
            className={`toolbar-btn color-btn ${currentTextColor === '#000000' ? '' : 'active'}`} 
            title="Text Color"
          >
            <span className="color-icon">A</span>
            <span
              className="color-indicator"
              style={{ backgroundColor: currentTextColor }}
            />
          </button>
        }
      >
        <div className="color-grid">
          {TEXT_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={`color-option ${currentTextColor === color ? 'active' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => commands.setTextColor?.(color)}
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
      >
        <div className="color-grid">
          {BACKGROUND_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={`color-option ${color === 'transparent' ? 'transparent-color' : ''} ${(currentBgColor === color) || (!currentBgColor && color === 'transparent') ? 'active' : ''}`}
              style={{ backgroundColor: color === 'transparent' ? '#fff' : color }}
              onClick={() => {
                if (color === 'transparent') {
                  commands.removeTextHighlight?.();
                } else {
                  commands.setTextHighlight?.(color);
                }
              }}
              title={color === 'transparent' ? 'No highlight' : color}
            />
          ))}
        </div>
      </Dropdown>

      <div className="toolbar-divider" />

      {/* Lists */}
      <button
        type="button"
        className={`toolbar-btn ${active.bulletList() ? 'active' : ''}`}
        onClick={() => commands.toggleBulletList()}
        title="Bullet List"
      >
        <FaListUl />
      </button>
      <button
        type="button"
        className={`toolbar-btn ${active.orderedList() ? 'active' : ''}`}
        onClick={() => commands.toggleOrderedList()}
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
            className={`toolbar-btn ${active.blockquote?.() ? 'active' : ''}`}
            onClick={() => commands.toggleBlockquote?.()}
            title="Block Quote"
          >
            <FaQuoteRight />
          </button>

          {/* Text Alignment */}
          <button
            type="button"
            className={`toolbar-btn ${!currentAlign || currentAlign === 'left' ? 'active' : ''}`}
            onClick={() => commands.leftAlign?.()}
            title="Align Left"
          >
            <FaAlignLeft />
          </button>
          <button
            type="button"
            className={`toolbar-btn ${currentAlign === 'center' ? 'active' : ''}`}
            onClick={() => commands.centerAlign?.()}
            title="Align Center"
          >
            <FaAlignCenter />
          </button>
          <button
            type="button"
            className={`toolbar-btn ${currentAlign === 'right' ? 'active' : ''}`}
            onClick={() => commands.rightAlign?.()}
            title="Align Right"
          >
            <FaAlignRight />
          </button>
          <button
            type="button"
            className={`toolbar-btn ${currentAlign === 'justify' ? 'active' : ''}`}
            onClick={() => commands.justifyAlign?.()}
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
                className={`toolbar-btn ${active.link?.() ? 'active' : ''}`}
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
          {active.link?.() && (
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
