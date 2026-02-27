import { useEffect, useCallback } from 'react';
import './ImagePreviewModal.css';

interface ImagePreviewModalProps {
  src: string;
  alt?: string;
  onClose: () => void;
}

export function ImagePreviewModal({ src, alt, onClose }: ImagePreviewModalProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  return (
    <div className="image-preview-overlay" onClick={onClose}>
      <div className="image-preview-container" onClick={(e) => e.stopPropagation()}>
        <button className="image-preview-close" onClick={onClose} title="Close">
          ✕
        </button>
        <img src={src} alt={alt || 'Preview'} className="image-preview-img" />
        {alt && <div className="image-preview-caption">{alt}</div>}
      </div>
    </div>
  );
}
