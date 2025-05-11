import React, { useState } from 'react';
import axios from 'axios';

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post('http://127.0.0.1:8000/chat', { question });
      console.log("Chatbot response:", res.data);
      if (res.data && Array.isArray(res.data.answers)) {
        setAnswers(res.data.answers);
      } else {
        setAnswers(["No answers received. Please try again."]);
      }
    } catch (err) {
      console.error("Error fetching chat response:", err);
      setAnswers([`Error: ${err.message}`]);
    }
    setLoading(false);
    setQuestion('');
  };

  return (
    <div className="chatbot-wrapper">
      {!isOpen && (
        <button className="chatbot-button-glass" onClick={() => setIsOpen(true)}>
          💬 Chat with InsightBot
        </button>
      )}

      {isOpen && (
        <div className="chatbot-panel-glass">
          <div className="chatbot-header-glass">
            <span>🤖 InsightBot</span>
            <button onClick={() => setIsOpen(false)}>✖</button>
          </div>

          <form onSubmit={handleSubmit} className="chatbot-form-glass">
            <input
              type="text"
              placeholder="Ask about sales, revenue, gender..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <button type="submit">Ask</button>
          </form>

          <div className="chatbot-body-glass">
            {loading && <p className="chatbot-loading">Thinking...</p>}

            {answers.length > 0 && answers[0].includes('|') ? (
              <table>
                <thead>
                  <tr>
                    <th>Txn ID</th><th>Date</th><th>Cust ID</th><th>Gender</th>
                    <th>Age</th><th>Category</th><th>Qty</th><th>Price</th><th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {answers.map((row, idx) => (
                    <tr key={idx}>
                      {row.split('|').map((val, i) => (
                        <td key={i}>{val.trim()}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : answers.length > 0 ? (
              <ul>
                {answers.map((ans, idx) => (
                  <li key={idx}>{ans}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

export default Chatbot;
