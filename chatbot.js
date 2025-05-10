import React, { useState } from 'react';
import axios from 'axios';

function Chatbot() {
  const [question, setQuestion] = useState('');
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    try {
      const res = await axios.post('http://127.0.0.1:8000/chat', { question });
      setAnswers(res.data.answers || []);
    } catch (err) {
      setAnswers([`Error: ${err.message}`]);
    }
    setLoading(false);
  };

  return (
    <div className="chatbot-box">
      <h2>🤖 Ask InsightBot</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Ask a question about sales, gender, revenue..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          style={{
            padding: '10px', width: '70%', borderRadius: '8px',
            border: '1px solid #ccc', marginRight: '10px'
          }}
        />
        <button type="submit" style={{
          padding: '10px 16px', borderRadius: '8px',
          backgroundColor: '#007bff', color: '#fff', border: 'none'
        }}>
          Ask
        </button>
      </form>

      {loading && <p>Loading answer...</p>}

      {/* Display answers in table if they're structured */}
      {answers.length > 0 && answers[0].includes('|') ? (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Date</th>
              <th>Customer ID</th>
              <th>Gender</th>
              <th>Age</th>
              <th>Product Category</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {answers.map((row, idx) => (
              <tr key={idx}>
                {row.split('|').map((val, i) => (
                  <td key={i} style={{ padding: '6px', borderBottom: '1px solid #eee' }}>
                    {val.trim()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : answers.length > 0 ? (
        <ul style={{ marginTop: '1rem' }}>
          {answers.map((ans, idx) => (
            <li key={idx}>{ans}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export default Chatbot;
