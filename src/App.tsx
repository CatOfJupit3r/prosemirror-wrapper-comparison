import { useState } from 'react';
import { BasicEditor, ExtendedEditor } from './editors/react-prosemirror';
import { BasicEditor as TiptapBasicEditor, ExtendedEditor as TiptapExtendedEditor } from './editors/tiptap';
import { BasicEditor as RemirrorBasicEditor, ExtendedEditor as RemirrorExtendedEditor } from './editors/remirror';
import './App.css';

function App() {
  const [basicHtml, setBasicHtml] = useState('');
  const [extendedHtml, setExtendedHtml] = useState('');
  const [tiptapBasicHtml, setTiptapBasicHtml] = useState('');
  const [tiptapExtendedHtml, setTiptapExtendedHtml] = useState('');
  const [remirrorBasicHtml, setRemirrorBasicHtml] = useState('');
  const [remirrorExtendedHtml, setRemirrorExtendedHtml] = useState('');
  const [activeTab, setActiveTab] = useState<'react-prosemirror' | 'tiptap' | 'remirror'>('tiptap');

  return (
    <div className="app">
      <header className="app-header">
        <h1>Rich Text Editor Comparison</h1>
        <nav className="tab-nav">
          <button
            className={`tab-btn ${activeTab === 'react-prosemirror' ? 'active' : ''}`}
            onClick={() => setActiveTab('react-prosemirror')}
          >
            React ProseMirror
          </button>
          <button
            className={`tab-btn ${activeTab === 'tiptap' ? 'active' : ''}`}
            onClick={() => setActiveTab('tiptap')}
          >
            TipTap
          </button>
          <button
            className={`tab-btn ${activeTab === 'remirror' ? 'active' : ''}`}
            onClick={() => setActiveTab('remirror')}
          >
            ReMirror
          </button>
        </nav>
      </header>

      <main className="app-main">
        {activeTab === 'react-prosemirror' && (
          <div className="editor-section">
            <h2>React ProseMirror (@handlewithcare/react-prosemirror)</h2>
            
            <div className="editor-container">
              <h3>Basic Editor</h3>
              <p className="editor-description">
                Font size, bold, italic, underline, strikethrough, bullet lists, numbered lists, 
                text color, background color, tabulation controls
              </p>
              <BasicEditor onChange={setBasicHtml} />
              <details className="html-output">
                <summary>View HTML Output</summary>
                <pre>{basicHtml || '<p></p>'}</pre>
              </details>
            </div>

            <div className="editor-container">
              <h3>Extended Editor</h3>
              <p className="editor-description">
                All Basic features + block quote, text alignment, links, images (click to preview), 
                videos, file attachments
              </p>
              <ExtendedEditor
                onChange={setExtendedHtml}
              />
              <details className="html-output">
                <summary>View HTML Output</summary>
                <pre>{extendedHtml || '<p></p>'}</pre>
              </details>
            </div>
          </div>
        )}

        {activeTab === 'tiptap' && (
          <div className="editor-section">
            <h2>TipTap</h2>
            
            <div className="editor-container">
              <h3>Basic Editor</h3>
              <p className="editor-description">
                Font size, bold, italic, underline, strikethrough, bullet lists, numbered lists, 
                text color, background color, tabulation controls
              </p>
              <TiptapBasicEditor onChange={setTiptapBasicHtml} />
              <details className="html-output">
                <summary>View HTML Output</summary>
                <pre>{tiptapBasicHtml || '<p></p>'}</pre>
              </details>
            </div>

            <div className="editor-container">
              <h3>Extended Editor</h3>
              <p className="editor-description">
                All Basic features + block quote, text alignment, links, images (click to preview), 
                videos, file attachments
              </p>
              <TiptapExtendedEditor onChange={setTiptapExtendedHtml} />
              <details className="html-output">
                <summary>View HTML Output</summary>
                <pre>{tiptapExtendedHtml || '<p></p>'}</pre>
              </details>
            </div>
          </div>
        )}

        {activeTab === 'remirror' && (
          <div className="editor-section">
            <h2>ReMirror</h2>
            
            <div className="editor-container">
              <h3>Basic Editor</h3>
              <p className="editor-description">
                Font size, bold, italic, underline, strikethrough, bullet lists, numbered lists, 
                text color, background color, tabulation controls
              </p>
              <RemirrorBasicEditor onChange={setRemirrorBasicHtml} />
              <details className="html-output">
                <summary>View HTML Output</summary>
                <pre>{remirrorBasicHtml || '<p></p>'}</pre>
              </details>
            </div>

            <div className="editor-container">
              <h3>Extended Editor</h3>
              <p className="editor-description">
                All Basic features + block quote, text alignment, links, images (click to preview), 
                videos, file attachments
              </p>
              <RemirrorExtendedEditor onChange={setRemirrorExtendedHtml} />
              <details className="html-output">
                <summary>View HTML Output</summary>
                <pre>{remirrorExtendedHtml || '<p></p>'}</pre>
              </details>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
