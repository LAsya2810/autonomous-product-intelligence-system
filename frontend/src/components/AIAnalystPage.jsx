import { useMemo, useState } from 'react';

const CATEGORIES = [
  'Support Tickets',
  'Meeting Notes',
  'PRDs',
  'Feature Requests',
  'Release Notes',
];

function AIAnalystPage() {
  const [question, setQuestion] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [messages, setMessages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const backendUrl = useMemo(() => import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000', []);

  const handleAsk = async (event) => {
    event.preventDefault();
    if (!question.trim()) {
      return;
    }

    const nextUserMessage = { role: 'user', content: question.trim() };
    setMessages((current) => [...current, nextUserMessage]);
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('question', question.trim());
    if (selectedCategory) {
      formData.append('category', selectedCategory);
    }

    try {
      const response = await fetch(`${backendUrl}/ask`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Unable to ask the analyst');
      }

      const payload = await response.json();
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: payload.answer,
          confidence: payload.confidence,
          citations: payload.citations || [],
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: 'I could not answer the question because the backend was unavailable.',
          confidence: 0.1,
          citations: [],
        },
      ]);
    } finally {
      setQuestion('');
      setIsSubmitting(false);
    }
  };

  return (
    <section className="ai-analyst-page">
      <div className="card ai-analyst-shell">
        <div className="page-heading">
          <div>
            <p className="eyebrow">AI Analyst</p>
            <h2>Grounded answers from your indexed knowledge base</h2>
          </div>
        </div>

        <form className="upload-card" onSubmit={handleAsk}>
          <div className="upload-fields">
            <label>
              <span>Question</span>
              <input
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Ask about support, features, releases, or meeting notes"
              />
            </label>
            <label>
              <span>Optional category filter</span>
              <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
                <option value="">All categories</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button type="submit" disabled={isSubmitting || !question.trim()}>
            {isSubmitting ? 'Thinking…' : 'Ask'}
          </button>
        </form>

        <div className="chat-thread">
          {messages.length === 0 ? (
            <div className="empty-chat">
              <p>Ask a question and the assistant will answer using only the indexed documents and cite the supporting chunks.</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <article key={`${message.role}-${index}`} className={`chat-message ${message.role}`}>
                <div className="message-meta">
                  <strong>{message.role === 'user' ? 'You' : 'Analyst'}</strong>
                  {message.role === 'assistant' ? (
                    <span className="confidence-pill">Confidence {message.confidence}</span>
                  ) : null}
                </div>
                <p>{message.content}</p>
                {message.role === 'assistant' && message.citations?.length ? (
                  <details className="citations-block">
                    <summary>Citations</summary>
                    <ul>
                      {message.citations.map((citation, citationIndex) => (
                        <li key={`${citation.source}-${citationIndex}`}>
                          <strong>{citation.source}</strong>
                          <p>{citation.snippet}</p>
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : null}
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default AIAnalystPage;
