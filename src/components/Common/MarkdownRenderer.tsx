import { ReactNode } from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const parseMarkdown = (text: string): ReactNode[] => {
    const lines = text.split('\n');
    const elements: ReactNode[] = [];
    let key = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={key++} className="text-xl font-bold mb-3 mt-4" style={{ color: '#5B4B9D' }}>
            {line.replace('### ', '')}
          </h3>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={key++} className="text-2xl font-bold mb-4 mt-6" style={{ color: '#5B4B9D' }}>
            {line.replace('## ', '')}
          </h2>
        );
      } else if (line.startsWith('# ')) {
        elements.push(
          <h1 key={key++} className="text-3xl font-bold mb-4 mt-6" style={{ color: '#5B4B9D' }}>
            {line.replace('# ', '')}
          </h1>
        );
      } else if (line.match(/^\d+\./)) {
        const text = line.replace(/^\d+\.\s*/, '');
        elements.push(
          <li key={key++} className="mb-2 mr-6" style={{ color: '#424242' }}>
            {parseInlineMarkdown(text)}
          </li>
        );
      } else if (line.startsWith('- ')) {
        const text = line.replace(/^-\s*/, '');
        elements.push(
          <li key={key++} className="mb-2 mr-6 list-disc" style={{ color: '#424242' }}>
            {parseInlineMarkdown(text)}
          </li>
        );
      } else if (line.startsWith('---')) {
        elements.push(<hr key={key++} className="my-4 border-gray-300" />);
      } else if (line.trim() !== '') {
        elements.push(
          <p key={key++} className="mb-3 leading-relaxed" style={{ color: '#424242' }}>
            {parseInlineMarkdown(line)}
          </p>
        );
      } else {
        elements.push(<div key={key++} className="h-2" />);
      }
    }

    return elements;
  };

  const parseInlineMarkdown = (text: string): ReactNode => {
    const parts: ReactNode[] = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      if (boldMatch) {
        const beforeBold = remaining.substring(0, boldMatch.index);
        if (beforeBold) {
          parts.push(<span key={key++}>{beforeBold}</span>);
        }
        parts.push(
          <strong key={key++} className="font-bold" style={{ color: '#5B4B9D' }}>
            {boldMatch[1]}
          </strong>
        );
        remaining = remaining.substring((boldMatch.index || 0) + boldMatch[0].length);
        continue;
      }

      const italicMatch = remaining.match(/\*(.+?)\*/);
      if (italicMatch) {
        const beforeItalic = remaining.substring(0, italicMatch.index);
        if (beforeItalic) {
          parts.push(<span key={key++}>{beforeItalic}</span>);
        }
        parts.push(
          <em key={key++} className="italic">
            {italicMatch[1]}
          </em>
        );
        remaining = remaining.substring((italicMatch.index || 0) + italicMatch[0].length);
        continue;
      }

      const codeMatch = remaining.match(/`(.+?)`/);
      if (codeMatch) {
        const beforeCode = remaining.substring(0, codeMatch.index);
        if (beforeCode) {
          parts.push(<span key={key++}>{beforeCode}</span>);
        }
        parts.push(
          <code
            key={key++}
            className="px-2 py-1 rounded text-sm"
            style={{ backgroundColor: '#F5F5F5', color: '#5B4B9D' }}
          >
            {codeMatch[1]}
          </code>
        );
        remaining = remaining.substring((codeMatch.index || 0) + codeMatch[0].length);
        continue;
      }

      parts.push(<span key={key++}>{remaining}</span>);
      break;
    }

    return <>{parts}</>;
  };

  return (
    <div className={`markdown-content ${className}`} style={{ textAlign: 'right', direction: 'rtl' }}>
      {parseMarkdown(content)}
    </div>
  );
}
