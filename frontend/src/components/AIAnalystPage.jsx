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

  const backendUrl = useMemo(
    () => import.meta.env.VITE_BACKEND_URL || 'https://autonomous-product-intelligence-system.onrender.com',
    []
  );

  const handleAsk = async (event) => {
    event.preventDefault();

    if (!question.trim()) return;

    const userQuestion = question.trim();

    setMessages((current) => [
      ...current,
      {
        role: 'user',
        content: userQuestion,
      },
    ]);

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('question', userQuestion);

    if (selectedCategory) {
      formData.append('category', selectedCategory);
    }

    try {
      const response = await fetch(`${backendUrl}/ask`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Unable to ask analyst');
      }

      const payload = await response.json();

      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: payload.answer,
         //confidence: payload.confidence ?? 0,//
          citations: payload.citations ?? [],
        },
      ]);
    } catch (error) {
      console.error(error);

      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content:
            'I could not answer the question because the backend is unavailable.',
          confidence: 0,
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
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask anything about your uploaded documents..."
              />
            </label>

            <label>
              <span>Category (Optional)</span>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>

                {CATEGORIES.map((category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                ))}
              </select>
            </label>

          </div>

          <button
            type="submit"
            disabled={isSubmitting || !question.trim()}
          >
            {isSubmitting ? 'Thinking...' : 'Ask AI'}
          </button>
        </form>

        <div className="chat-thread">

          {messages.length === 0 ? (
            <div className="empty-chat">
              <p>
                Ask a question about your uploaded documents.
                The AI will answer only from indexed sources.
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <article
                key={index}
                className={`chat-message ${message.role}`}
              >

                <div className="message-meta">

                  <strong>
                    {message.role === 'user'
                      ? 'You'
                      : 'AI Analyst'}
                  </strong>

                  {message.role === 'assistant' && (
                    <span>AI Assistant</span>
                    )}

                </div>

                <p
                  style={{
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.7,
                  }}
                >
                  <div
                  className="message-content"
                  style={{
                    whiteSpace: "pre-wrap",
                    lineHeight: "1.7",
                    marginTop: "10px",
                    }}
                    >
                      {message.content}
                      </div>
                </p>

                {message.role === 'assistant' &&
                  message.citations &&
                  message.citations.length > 0 && (

                    <details className="citations-block">

                      <summary>
                        View Sources ({message.citations.length})
                      </summary>

                      <ul>

                        {message.citations.map(
                          (citation, citationIndex) => (
                            <li
                              key={citationIndex}
                            >
                              📄{' '}
                              <strong>
                                {citation.source}
                              </strong>

                              <p
                                style={{
                                  marginTop: 6,
                                  opacity: 0.8,
                                  whiteSpace: 'pre-wrap',
                                }}
                              >
                                {citation.snippet}
                              </p>
                            </li>
                          )
                        )}

                      </ul>

                    </details>
                  )}

              </article>
            ))
          )}

        </div>

      </div>
    </section>
  );
}

export default AIAnalystPage;