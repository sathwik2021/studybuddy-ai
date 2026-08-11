import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

function TypingIndicator() {
  return (
    <div className="message ai-message typing-message">
      <div className="message-avatar">🎓</div>
      <div className="message-bubble typing-bubble">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
      </div>
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === 'user';

  return (
    <div className={`message ${isUser ? 'user-message' : 'ai-message'}`}>
      {!isUser && <div className="message-avatar">🎓</div>}
      <div className={`message-bubble ${isUser ? 'user-bubble' : 'ai-bubble'}`}>
        {isUser ? (
          <p>{msg.content}</p>
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={oneDark}
                    language={match[1]}
                    PreTag="div"
                    customStyle={{ borderRadius: '8px', margin: '8px 0', fontSize: '0.85rem' }}
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={`inline-code ${className || ''}`} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {msg.content}
          </ReactMarkdown>
        )}
        <span className="message-time">
          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      {isUser && <div className="message-avatar user-avatar">👤</div>}
    </div>
  );
}

export default function ChatArea({ messages, isLoading, messagesEndRef }) {
  return (
    <div className="chat-area">
      {messages.map((msg, i) => (
        <Message key={i} msg={msg} />
      ))}
      {isLoading && <TypingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  );
}
