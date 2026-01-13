import React, { useEffect, useState } from 'react';

interface Heading {
  id: string;
  text: string;
  level: number;
}

const TableOfContents: React.FC = () => {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Parse headings from DOM
    const elements = Array.from(document.querySelectorAll('.markdown-body h2, .markdown-body h3'));
    const items = elements.map((elem, index) => {
      if (!elem.id) elem.id = `heading-${index}`;
      return {
        id: elem.id,
        text: elem.textContent || '',
        level: Number(elem.tagName.charAt(1))
      };
    });
    
    requestAnimationFrame(() => {
        setHeadings(items);
    });

    // Scroll Spy
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    }, { rootMargin: '-10% 0px -80% 0px' });

    elements.forEach(elem => observer.observe(elem));

    return () => observer.disconnect();
  }, []); // Re-run when route changes? Parent should key this component or we depend on DOM change?
          // Ideally depend on location or content.

  if (headings.length === 0) return null;

  return (
    <div className="docs-toc">
      <div className="toc-title">On this page</div>
      <ul>
        {headings.map(heading => (
          <li 
            key={heading.id} 
            className={`toc-item level-${heading.level} ${activeId === heading.id ? 'active' : ''}`}
          >
            <a 
                href={`#${heading.id}`} 
                onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(heading.id)?.scrollIntoView({ behavior: 'smooth' });
                }}
            >
                {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TableOfContents;
