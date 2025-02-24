import React, { useState } from 'react';
import styled from 'styled-components';
import { AppLayout } from './components/layout/AppLayout';
import { Button } from './components/ui/Button';
import { AnalysisCard } from './components/dashboard/AnalysisCard';
import { theme } from './styles/theme';
import './styles/fonts.css';

const FormContainer = styled.div`
  background-color: ${theme.colors.background.light};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
  padding: ${theme.spacing.xl};
  margin-bottom: ${theme.spacing.xl};
`;

const FormTitle = styled.h2`
  font-family: ${theme.typography.fontFamily.heading};
  font-weight: ${theme.typography.fontWeight.bold};
  font-size: ${theme.typography.fontSize['3xl']};
  color: ${theme.colors.text.primary};
  margin-top: 0;
  margin-bottom: ${theme.spacing.lg};
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 200px;
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  border: 2px solid rgba(0, 0, 0, 0.1);
  font-family: ${theme.typography.fontFamily.body};
  font-size: ${theme.typography.fontSize.base};
  margin-bottom: ${theme.spacing.lg};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.teal};
  }
`;

const ResultsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.lg};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const LoadingSpinner = styled.div`
  width: 64px;
  height: 64px;
  border: 8px solid ${theme.colors.primary.yellow};
  border-radius: 50%;
  border-top-color: ${theme.colors.primary.teal};
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ErrorMessage = styled.div`
  background-color: #ffebee;
  color: #c62828;
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing.lg};
  border-left: 4px solid #c62828;
  font-family: ${theme.typography.fontFamily.body};
`;

function App() {
  const [article, setArticle] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!article.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5004/api/v1/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ article }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }
      
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error analyzing article:', error);
      setError(error.message || 'Failed to analyze article. Please try again.');
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <FormContainer>
        <FormTitle>SEO Backlink Builder</FormTitle>
        <TextArea 
          value={article}
          onChange={(e) => setArticle(e.target.value)}
          placeholder="Paste your SEO article here..."
        />
        <Button onClick={handleAnalyze} disabled={!article.trim() || loading}>
          {loading ? 'Analyzing...' : 'Analyze Article'}
        </Button>
      </FormContainer>
      
      {results && (
        <ResultsContainer>
          <AnalysisCard 
            title="Identified Themes" 
            subjects={results.subjects} 
          />
          <AnalysisCard 
            title="Related Websites" 
            subjects={results.websites} 
          />
        </ResultsContainer>
      )}
      
      {loading && (
        <LoadingOverlay>
          <LoadingSpinner />
        </LoadingOverlay>
      )}
    </AppLayout>
  );
}

export default App; 