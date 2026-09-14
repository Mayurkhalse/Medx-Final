import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumb';

const suggestedQuestions = [
  'What does my hemoglobin result mean?',
  'How has my hemoglobin changed?',
  'What should I discuss with my doctor?',
];

const mockResponses = {
  'What does my hemoglobin result mean?': {
    title: 'About your hemoglobin result',
    answer:
      'Your latest hemoglobin value is 13.6 g/dL. In this prototype, Med-X would compare this value with the reference information reported by the laboratory and your previous observations before explaining what the result may indicate.',
    observations: [
      'Latest value: 13.6 g/dL',
      'Previous value: 13.5 g/dL',
      'Trend: relatively stable'
    ],
    source: 'Complete Blood Count • 22 Aug 2026'
  },

  'How has my hemoglobin changed?': {
    title: 'Your hemoglobin trend',
    answer:
      'The available sample observations show hemoglobin changing from 13.1 → 13.4 → 13.5 → 13.6 g/dL. Med-X would use these longitudinal observations to explain the direction and significance of the change rather than looking at the latest value alone.',
    observations: [
      'Previous: 13.1 g/dL',
      'Intermediate: 13.4 g/dL → 13.5 g/dL',
      'Latest: 13.6 g/dL'
    ],
    source: 'Monitoring data • Last 6 months'
  },

  'What should I discuss with my doctor?': {
    title: 'Possible discussion points',
    answer:
      'Based on the information currently available in this prototype, you could discuss your recent laboratory results, how measurements have changed over time, and whether any changes are relevant to your personal health context. Med-X would not replace clinical evaluation or provide a diagnosis.',
    observations: [
      'Review your latest CBC',
      'Discuss relevant changes over time',
      'Provide your doctor with the original report'
    ],
    source: 'Health record • Available information'
  }
};

const AskMedX = () => {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState(null);
  const [isThinking, setIsThinking] = useState(false);

  const askQuestion = (value = question) => {
    const trimmed = value.trim();

    if (!trimmed) return;

    setQuestion(trimmed);
    setResponse(null);
    setIsThinking(true);

    setTimeout(() => {
      setResponse(
        mockResponses[trimmed] || {
          title: 'Med-X understood your question',
          answer:
            'This prototype demonstrates how Med-X will respond using information already available in your health record. Once the AI service is connected, the response will be generated from the relevant patient data, laboratory observations and approved medical knowledge sources.',
          observations: [
            'Relevant health information identified',
            'Supporting observations would be retrieved',
            'Response would be generated from available context'
          ],
          source: 'Med-X health record'
        }
      );

      setIsThinking(false);
    }, 650);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    askQuestion();
  };

  return (
    <div className="medx-page">
      <Breadcrumb items={[{ label: 'Ask Med-X' }]} />

      <div className="medx-page-header">
        <p className="medx-eyebrow">MED-X INTELLIGENCE</p>
        <h1>Ask Med-X</h1>
        <p className="medx-subtitle">
          Ask questions about information already available in your health
          record.
        </p>
      </div>

      <section className="medx-ai-intro">
        <div>
          <span className="medx-status-label">HOW IT WORKS</span>
          <h2>Understand your health information through conversation</h2>
          <p>
            Med-X will use your available health information to explain
            measurements, reports and changes in a simple way. Responses are
            intended to support understanding and are not a replacement for
            professional medical care.
          </p>
        </div>

        <div className="medx-ai-flow">
          <span>Your data</span>
          <strong>→</strong>
          <span>Med-X analysis</span>
          <strong>→</strong>
          <span>Explanation</span>
        </div>
      </section>

      <section className="medx-section">
        <div className="medx-section-heading">
          <div>
            <p className="medx-eyebrow">ASK A QUESTION</p>
            <h2>What would you like to understand?</h2>
          </div>
        </div>

        <div className="medx-question-suggestions">
          {suggestedQuestions.map((item) => (
            <button
              type="button"
              key={item}
              className="medx-question-chip"
              onClick={() => askQuestion(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <form className="medx-ai-form" onSubmit={handleSubmit}>
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask Med-X about a report, result, measurement or change..."
            rows="4"
          />

          <div className="medx-ai-form-footer">
            <span>
              Med-X answers questions using information available in your
              health record.
            </span>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={!question.trim() || isThinking}
            >
              {isThinking ? 'Understanding...' : 'Ask Med-X'}
            </button>
          </div>
        </form>
      </section>

      {isThinking && (
        <section className="medx-ai-response medx-ai-thinking">
          <div className="medx-ai-response-header">
            <span className="medx-ai-badge">MED-X</span>
            <span>Reviewing your health information...</span>
          </div>

          <div className="medx-thinking-lines">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </section>
      )}

      {response && !isThinking && (
        <section className="medx-ai-response">
          <div className="medx-ai-response-header">
            <div>
              <span className="medx-ai-badge">MED-X</span>
              <span className="medx-ai-response-label">
                Response based on available information
              </span>
            </div>

            <span className="medx-ai-demo-label">Prototype response</span>
          </div>

          <div className="medx-ai-answer">
            <h2>{response.title}</h2>
            <p>{response.answer}</p>
          </div>

          <div className="medx-ai-evidence">
            <div>
              <span className="medx-card-label">Supporting information</span>
              <ul>
                {response.observations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <span className="medx-card-label">Source</span>
              <strong>{response.source}</strong>
            </div>
          </div>

          <div className="medx-ai-response-actions">
            <Link to="/reports/cbc-2026-08-22" className="btn btn-outline btn-sm">
              View supporting report
            </Link>

            <Link to="/monitoring" className="btn btn-outline btn-sm">
              View trend
            </Link>
          </div>
        </section>
      )}

      <section className="medx-section medx-ai-boundary">
        <div className="medx-ai-boundary-icon">i</div>

        <div>
          <strong>What Med-X is designed to do</strong>
          <p>
            Explain information already present in your health record, connect
            related observations and make health information easier to
            understand.
          </p>
        </div>

        <div>
          <strong>What Med-X does not do</strong>
          <p>
            It does not replace a doctor, independently diagnose a condition or
            make emergency medical decisions.
          </p>
        </div>
      </section>
    </div>
  );
};

export default AskMedX;
