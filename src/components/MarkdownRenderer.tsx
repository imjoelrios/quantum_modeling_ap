import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownRendererProps {
  data: { [key: string]: { markdown_text: string } };
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ data }) => {
  return (
    <div>
      {Object.entries(data).map(([title, content]) => (
        <div key={title}>
          <h2>{title}</h2>
          <ReactMarkdown>
            {content.markdown_text}
          </ReactMarkdown>
        </div>
      ))}
    </div>
  );
};

export default MarkdownRenderer;
