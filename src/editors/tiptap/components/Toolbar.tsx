import { useCallback, useEffect, useState, useRef } from 'react';
import { Editor } from '@tiptap/react';
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
  FaSpinner,
} from 'react-icons/fa';
import { uploadFile } from '../../../utils/upload';
import { Dropdown } from './Dropdown';
import './Toolbar.css';

interface ToolbarProps {
  editor: Editor | null;
  variant: 'basic' | 'extended';
}

// Custom hook to force re-render on editor state changes
function useForceUpdate() {
  const [, setTick] = useState(0);
  return useCallback(() => setTick((tick) => tick + 1), []);
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

export function Toolbar({ editor, variant }: ToolbarProps) {
  const isExtended = variant === 'extended';
  const forceUpdate = useForceUpdate();
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  
  // File input refs
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Subscribe to editor transactions to update toolbar state
  useEffect(() => {
    if (!editor) return;

    // Force re-render when selection or content changes
    editor.on('selectionUpdate', forceUpdate);
    editor.on('transaction', forceUpdate);

    return () => {
      editor.off('selectionUpdate', forceUpdate);
      editor.off('transaction', forceUpdate);
    };
  }, [editor, forceUpdate]);

  const handleAddLink = useCallback(() => {
    if (!editor || !linkUrl) return;
    
    editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    setLinkUrl('');
    setShowLinkInput(false);
  }, [editor, linkUrl]);

  const handleRemoveLink = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().unsetLink().run();
  }, [editor]);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editor) return;
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const result = await uploadFile(file);
        editor.chain().focus().setImage({ src: result.url, alt: file.name }).run();
      } catch (error) {
        console.error('Image upload failed:', error);
        alert('Failed to upload image');
      } finally {
        setIsUploading(false);
      }
    }
    e.target.value = '';
  }, [editor]);

  const handleVideoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editor) return;
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const result = await uploadFile(file);
        editor.chain().focus().insertContent({
          type: 'video',
          attrs: { src: result.url },
        }).run();
      } catch (error) {
        console.error('Video upload failed:', error);
        alert('Failed to upload video');
      } finally {
        setIsUploading(false);
      }
    }
    e.target.value = '';
  }, [editor]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editor) return;
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const result = await uploadFile(file);
        editor.chain().focus().insertContent({
          type: 'fileAttachment',
          attrs: { src: result.url, name: file.name },
        }).run();
      } catch (error) {
        console.error('File upload failed:', error);
        alert('Failed to upload file');
      } finally {
        setIsUploading(false);
      }
    }
    e.target.value = '';
  }, [editor]);

  const handleIndent = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().indent().run();
  }, [editor]);

  const handleOutdent = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().outdent().run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  // Get current styles
  const currentFontSize = editor.getAttributes('textStyle').fontSize || '16px';
  const currentTextColor = editor.getAttributes('textStyle').color || '#000000';
  const currentBgColor = editor.getAttributes('highlight').color;

  return (
    <div className="tiptap-toolbar">
      {/* Font Size Dropdown */}
      <Dropdown
        trigger={
          <button type="button" className={`toolbar-btn dropdown-trigger ${currentFontSize !== '16px' ? 'active' : ''}`}>
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
              onClick={() => editor.chain().focus().setFontSize(size).run()}
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
        className={`toolbar-btn ${editor.isActive('bold') ? 'active' : ''}`}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold (Ctrl+B)"
      >
        <FaBold />
      </button>
      <button
        type="button"
        className={`toolbar-btn ${editor.isActive('italic') ? 'active' : ''}`}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic (Ctrl+I)"
      >
        <FaItalic />
      </button>
      <button
        type="button"
        className={`toolbar-btn ${editor.isActive('underline') ? 'active' : ''}`}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        title="Underline (Ctrl+U)"
      >
        <FaUnderline />
      </button>
      <button
        type="button"
        className={`toolbar-btn ${editor.isActive('strike') ? 'active' : ''}`}
        onClick={() => editor.chain().focus().toggleStrike().run()}
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
      >
        <div className="color-grid">
          {TEXT_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={`color-option ${currentTextColor === color ? 'active' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => editor.chain().focus().setColor(color).run()}
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
                  editor.chain().focus().unsetHighlight().run();
                } else {
                  editor.chain().focus().toggleHighlight({ color }).run();
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
        className={`toolbar-btn ${editor.isActive('bulletList') ? 'active' : ''}`}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        title="Bullet List"
      >
        <FaListUl />
      </button>
      <button
        type="button"
        className={`toolbar-btn ${editor.isActive('orderedList') ? 'active' : ''}`}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
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
            className={`toolbar-btn ${editor.isActive('blockquote') ? 'active' : ''}`}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="Block Quote"
          >
            <FaQuoteRight />
          </button>

          {/* Text Alignment - left is active by default when no alignment set */}
          <button
            type="button"
            className={`toolbar-btn ${!editor.isActive({ textAlign: 'center' }) && !editor.isActive({ textAlign: 'right' }) && !editor.isActive({ textAlign: 'justify' }) ? 'active' : ''}`}
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            title="Align Left"
          >
            <FaAlignLeft />
          </button>
          <button
            type="button"
            className={`toolbar-btn ${editor.isActive({ textAlign: 'center' }) ? 'active' : ''}`}
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            title="Align Center"
          >
            <FaAlignCenter />
          </button>
          <button
            type="button"
            className={`toolbar-btn ${editor.isActive({ textAlign: 'right' }) ? 'active' : ''}`}
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            title="Align Right"
          >
            <FaAlignRight />
          </button>
          <button
            type="button"
            className={`toolbar-btn ${editor.isActive({ textAlign: 'justify' }) ? 'active' : ''}`}
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
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
                className={`toolbar-btn ${editor.isActive('link') ? 'active' : ''}`}
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
          {editor.isActive('link') && (
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

          {/* Media - using file inputs like ProseMirror */}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageUpload}
            disabled={isUploading}
          />
          <button
            type="button"
            className={`toolbar-btn ${isUploading ? 'uploading' : ''}`}
            onClick={() => imageInputRef.current?.click()}
            title="Insert Image"
            disabled={isUploading}
          >
            {isUploading ? <FaSpinner className="spinner" /> : <FaImage />}
          </button>

          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            style={{ display: 'none' }}
            onChange={handleVideoUpload}
            disabled={isUploading}
          />
          <button
            type="button"
            className={`toolbar-btn ${isUploading ? 'uploading' : ''}`}
            onClick={() => videoInputRef.current?.click()}
            title="Insert Video"
            disabled={isUploading}
          >
            {isUploading ? <FaSpinner className="spinner" /> : <FaVideo />}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
            disabled={isUploading}
          />
          <button
            type="button"
            className={`toolbar-btn ${isUploading ? 'uploading' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            title="Attach File"
            disabled={isUploading}
          >
            {isUploading ? <FaSpinner className="spinner" /> : <FaPaperclip />}
          </button>
        </>
      )}
    </div>
  );
}
