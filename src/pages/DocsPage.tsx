import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Book, ArrowLeft, Menu } from 'lucide-react';
import { authFetch } from '../app/authFetch';
import { useTitle } from '../hooks/useTitle';
import DocsSidebar from '../components/docs/DocsSidebar';
import { DOCS_MAP } from '../components/docs/docsData';
import MarkdownRenderer from '../components/docs/MarkdownRenderer';
import TableOfContents from '../components/docs/TableOfContents';
import '../components/docs/Docs.css';

const DocsPage: React.FC = () => {
  useTitle('Documentation');
  const navigate = useNavigate();
  const params = useParams();
  const slug = params['*'] || ''; // Catch-all route param

  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fetch Content
  useEffect(() => {
    const loadContent = async () => {
        setLoading(true);
        // Scroll to top
        document.querySelector('.docs-content-container')?.scrollTo(0, 0);
        
        try {
            const res = await authFetch(`/api/docs/content?slug=${slug}`);
            if (res.ok) {
                const data = await res.json();
                setContent(data.content);
            } else {
                setContent('# 404 Not Found\nThe requested document could not be found.');
            }
        } catch (e) {
            setContent('# Error\nFailed to load documentation.');
        } finally {
            setLoading(false);
        }
    };
    loadContent();
  }, [slug]);

  return (
    <div className="docs-layout">
      {/* Mobile Header */}
      <div className="mobile-header" style={{ display: 'none' }}>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <Menu />
          </button>
          <span>Kernex Docs</span>
      </div>

      {/* Sidebar */}
      <div className={`docs-sidebar-container ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="docs-sidebar-header">
              <Book size={24} className="text-blue-600" />
              <span>Kernex Docs</span>
          </div>
          
          <div style={{ padding: '16px 16px 0' }}>
              <button 
                  onClick={() => navigate('/workspace')}
                  className="docs-sidebar-item"
                  style={{ width: '100%', marginBottom: '16px' }}
              >
                  <ArrowLeft size={16} style={{ marginRight: 8 }} />
                  Back to App
              </button>
          </div>

          <DocsSidebar tree={DOCS_MAP} activeSlug={slug} />
      </div>

      {/* Content */}
      <div className="docs-content-container">
          <div className="docs-content-wrapper">
              <div className="docs-article">
                  {loading ? (
                      <div style={{ padding: 40, color: '#6b7280' }}>Loading...</div>
                  ) : (
                      <MarkdownRenderer content={content} />
                  )}
              </div>

              <footer className="docs-footer">
                  <div className="docs-footer-divider" />
                  <div className="docs-footer-content">
                      <div className="docs-footer-left">
                          © {new Date().getFullYear()} Kernex. MIT Licensed.
                      </div>
                      <div className="docs-footer-right">
                          <a href="https://github.com/Arjun-M/Kernex" target="_blank" rel="noopener noreferrer">GitHub</a>
                          <span className="dot">·</span>
                          <a href="https://github.com/Arjun-M/Kernex/issues" target="_blank" rel="noopener noreferrer">Issues</a>
                      </div>
                  </div>
              </footer>
          </div>
          
          {/* TOC - Only render if not loading and content exists */}
          {!loading && content && (
              <div className="docs-toc-container">
                  <TableOfContents key={content.substring(0, 100)} /> {/* Key ensures TOC remounts/re-parses on content change */}
              </div>
          )}
      </div>
    </div>
  );
};

export default DocsPage;