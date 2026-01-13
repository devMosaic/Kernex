import React from 'react';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
});

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // We can add custom render rules here or plugins if we import them
  const html = md.render(content);

  return (
    <div 
      className="markdown-body"
      dangerouslySetInnerHTML={{ __html: html }} 
    />
  );
};

export default MarkdownRenderer;
