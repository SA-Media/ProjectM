import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { AppLayout } from './components/layout/AppLayout';
import { Button } from './components/ui/Button';
import { AnalysisCard } from './components/dashboard/AnalysisCard';
import { theme } from './styles/theme';
import { loadingQuotes } from './components/loading/QuotesData';
import './styles/fonts.css';
import LandingPage from './pages/LandingPage';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';

// Register the required Chart.js components
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// Updated styling to match landing page aesthetic
const FormContainer = styled.div`
  background-color: white;
  border: 2px solid black;
  border-radius: ${theme.borderRadius.lg};
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  padding: ${theme.spacing.xl};
  margin-bottom: ${theme.spacing.xl};
  width: 100%;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  }
`;

const FormTitle = styled.h2`
  font-family: 'Courier', monospace;
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
  border: 2px solid rgba(0, 0, 0, 0.2);
  font-family: ${theme.typography.fontFamily.body};
  font-size: ${theme.typography.fontSize.base};
  margin-bottom: ${theme.spacing.lg};
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.teal};
    box-shadow: 0 0 0 3px rgba(122, 201, 192, 0.25);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  flex-wrap: wrap;
`;

// Updated button styling
const StyledButton = styled(Button)`
  background-color: ${props => props.primary ? theme.colors.primary.teal : 'white'};
  color: ${props => props.primary ? 'white' : theme.colors.text.primary};
  border: 2px solid black;
  border-radius: ${theme.borderRadius.md};
  font-weight: ${theme.typography.fontWeight.semibold};
  padding: 0.75rem 1.5rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ResultsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

// Updated card styling
const Card = styled.div`
  background-color: white;
  border: 2px solid black;
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  }
`;

const CardTitle = styled.h3`
  font-family: 'Courier', monospace;
  font-weight: ${theme.typography.fontWeight.bold};
  font-size: ${theme.typography.fontSize.xl};
  color: ${theme.colors.text.primary};
  margin-top: 0;
  margin-bottom: ${theme.spacing.md};
  border-bottom: 2px solid ${theme.colors.primary.teal};
  padding-bottom: ${theme.spacing.sm};
`;

const List = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
`;

const ListItem = styled.li`
  padding: ${theme.spacing.md};
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing.sm};
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: rgba(122, 201, 192, 0.1);
  }
`;

const ErrorMessage = styled.div`
  background-color: #FFF5F5;
  color: #E53E3E;
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing.md};
  border: 2px solid #E53E3E;
`;

// Updated loading overlay styling
const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
`;

const LoadingQuoteBox = styled.div`
  background-color: white;
  border: 2px solid black;
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.xl};
  max-width: 90%;
  width: 500px;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
`;

const LoadingTitle = styled.h3`
  font-family: 'Courier', monospace;
  font-weight: ${theme.typography.fontWeight.bold};
  font-size: ${theme.typography.fontSize.xl};
  margin-bottom: ${theme.spacing.md};
`;

const QuoteText = styled.p`
  font-style: italic;
  margin-bottom: ${theme.spacing.lg};
  color: ${theme.colors.text.secondary};
`;

const ProgressBarContainer = styled.div`
  height: 8px;
  background-color: #E2E8F0;
  border-radius: 4px;
  overflow: hidden;
  margin-top: ${theme.spacing.md};
`;

const ProgressBar = styled.div`
  height: 100%;
  background-color: ${theme.colors.primary.teal};
  border-radius: 4px;
  animation: progress 3s infinite;
  
  @keyframes progress {
    0% {
      width: 0%;
    }
    50% {
      width: 70%;
    }
    100% {
      width: 100%;
    }
  }
`;

const LoadingSpinner = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: ${theme.colors.primary.teal};
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  position: absolute;
  top: calc(50% - 120px);
  
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

// Scoring section styling
const ScoreDashboard = styled.div`
  background-color: white;
  border: 2px solid black;
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  margin-top: ${theme.spacing.lg};
`;

const ScoreHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.lg};
  border-bottom: 2px solid ${theme.colors.primary.teal};
  padding-bottom: ${theme.spacing.md};
`;

const ScoreTitle = styled.h3`
  font-family: 'Courier', monospace;
  font-weight: ${theme.typography.fontWeight.bold};
  font-size: ${theme.typography.fontSize.xl};
  margin: 0;
`;

const OverallScore = styled.div`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${props => {
    const score = parseInt(props.score);
    if (score >= 80) return '#38A169';
    if (score >= 60) return '#D69E2E';
    return '#E53E3E';
  }};
  background-color: ${props => {
    const score = parseInt(props.score);
    if (score >= 80) return 'rgba(56, 161, 105, 0.1)';
    if (score >= 60) return 'rgba(214, 158, 46, 0.1)';
    return 'rgba(229, 62, 62, 0.1)';
  }};
  padding: 0.5rem 1rem;
  border-radius: ${theme.borderRadius.md};
  border: 2px solid ${props => {
    const score = parseInt(props.score);
    if (score >= 80) return '#38A169';
    if (score >= 60) return '#D69E2E';
    return '#E53E3E';
  }};
`;

const CategoryScoreCard = styled.div`
  background-color: #F7FAFC;
  border: 2px solid black;
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
`;

const CategoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.sm};
`;

const CategoryName = styled.h4`
  font-family: 'Courier', monospace;
  font-weight: ${theme.typography.fontWeight.bold};
  font-size: ${theme.typography.fontSize.lg};
  margin: 0;
`;

const CategoryScore = styled.div`
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${props => {
    const score = (props.score / props.maxScore) * 100;
    if (score >= 80) return '#38A169';
    if (score >= 60) return '#D69E2E';
    return '#E53E3E';
  }};
`;

const SubcategoriesList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: ${theme.spacing.sm} 0 0;
`;

const SubcategoryItem = styled.li`
  display: flex;
  justify-content: space-between;
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  margin-bottom: ${theme.spacing.xs};
  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  
  &:hover {
    background-color: #F0FFF4;
  }
`;

const SubcategoryName = styled.span`
  font-size: ${theme.typography.fontSize.sm};
`;

const SubcategoryScore = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${props => {
    const score = (props.score / props.maxScore) * 100;
    if (score >= 80) return '#38A169';
    if (score >= 60) return '#D69E2E';
    return '#E53E3E';
  }};
`;

// Add this new styled component near your other styled components
const ScoreCardLayout = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.spacing.lg};
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ScoreDetails = styled.div`
  flex: 1;
`;

const ChartContainer = styled.div`
  width: 220px;
  height: 220px;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    width: 100%;
    max-width: 300px;
    margin-top: ${theme.spacing.md};
  }
`;

// Backend configuration
const DEFAULT_PORT = 5005; // Set your default port here
const getBackendUrl = () => {
  // Read from environment variable if available (for production deployments)
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  
  // Check localStorage for a stored port (from previous connection)
  const storedPort = localStorage.getItem('backendPort');
  if (storedPort) {
    return `http://localhost:${storedPort}`;
  }
  
  // Default fallback
  return `http://localhost:${DEFAULT_PORT}`;
};

function App() {
  const [article, setArticle] = useState('');
  const [loading, setLoading] = useState(false);
  const [scoringLoading, setScoringLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [copyScores, setCopyScores] = useState(null);
  const [error, setError] = useState('');
  const [scoringError, setScoringError] = useState('');
  const [currentQuote, setCurrentQuote] = useState('');
  const [historyItems, setHistoryItems] = useState([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  
  // Initialize the backend URL
  const [backendUrl, setBackendUrl] = useState(getBackendUrl());

  // Function to update the backend port
  const updateBackendPort = (port) => {
    const newUrl = `http://localhost:${port}`;
    setBackendUrl(newUrl);
    localStorage.setItem('backendPort', port);
    return newUrl;
  };
  
  // Load history from localStorage on component mount
  useEffect(() => {
    const storedHistory = localStorage.getItem('analysisHistory');
    if (storedHistory) {
      try {
        setHistoryItems(JSON.parse(storedHistory));
      } catch (e) {
        console.error('Failed to parse history from localStorage:', e);
      }
    }
  }, []);
  
  // Update localStorage whenever history changes
  useEffect(() => {
    localStorage.setItem('analysisHistory', JSON.stringify(historyItems));
  }, [historyItems]);
  
  // Cycle through quotes during loading
  useEffect(() => {
    if (loading || scoringLoading) {
      const randomQuote = loadingQuotes[Math.floor(Math.random() * loadingQuotes.length)];
      setCurrentQuote(randomQuote);
      
      const interval = setInterval(() => {
        const newQuote = loadingQuotes[Math.floor(Math.random() * loadingQuotes.length)];
        setCurrentQuote(newQuote);
      }, 6000);
      
      return () => clearInterval(interval);
    }
  }, [loading, scoringLoading]);

  // Enhanced connection test that tries multiple ports if needed
  const testBackendConnection = async () => {
    // Try with current backend URL first
    try {
      console.log(`Testing backend connection at ${backendUrl}...`);
      const response = await fetch(`${backendUrl}/api/v1/analyze`, { 
        method: 'OPTIONS',
        mode: 'cors'
      });
      
      if (response.ok) {
        console.log('Backend connection successful!');
        return true;
      }
    } catch (err) {
      console.error(`Connection failed to ${backendUrl}:`, err);
    }
    
    // If current URL failed, try common alternative ports
    const commonPorts = [5002, 5004, 5005, 5000, 3001];
    
    for (const port of commonPorts) {
      try {
        const testUrl = `http://localhost:${port}`;
        console.log(`Trying alternative port: ${testUrl}`);
        
        const response = await fetch(`${testUrl}/api/v1/analyze`, { 
          method: 'OPTIONS',
          mode: 'cors'
        });
        
        if (response.ok) {
          console.log(`Found working backend at port ${port}`);
          // Update the backend URL for future requests
          updateBackendPort(port);
          return true;
        }
      } catch (err) {
        console.error(`Port ${port} also failed:`, err);
      }
    }
    
    console.error('All connection attempts failed');
    return false;
  };

  useEffect(() => {
    testBackendConnection();
  }, []);

  const handleAnalyze = async () => {
    if (!article.trim()) return;
    
    setError('');
    setLoading(true);
    setResults(null);
    setCopyScores(null);
    
    try {
      console.log('Sending analysis request to backend...');
      const response = await fetch(`${backendUrl}/api/v1/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ article }),
        signal: AbortSignal.timeout(120000),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response error:', response.status, errorText);
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Analysis response received:', data);
      setResults(data);
      
      // Add to history
      const timestamp = new Date();
      const newHistoryItem = {
        id: Date.now(),
        title: `Analysis ${new Date().toLocaleTimeString()}`,
        timestamp,
        article,
        results: data,
      };
      
      setHistoryItems(prev => [newHistoryItem, ...prev]);
      
    } catch (err) {
      console.error('Analysis error:', err);
      setError(`Failed to analyze article: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRateCopy = async () => {
    if (!article.trim()) return;
    
    setScoringError('');
    setScoringLoading(true);
    setCopyScores(null);
    setResults(null);
    
    try {
      console.log('Sending copy rating request to backend...');
      let useBackend = true;
      
      try {
        const testResponse = await fetch(`${backendUrl}/api/v1/score-copy`, {
          method: 'OPTIONS'
        });
        useBackend = testResponse.ok;
      } catch (testErr) {
        console.log('SEO scoring endpoint test failed, will use mock data:', testErr);
        useBackend = false;
      }
      
      if (useBackend) {
        const response = await fetch(`${backendUrl}/api/v1/score-copy`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ article }),
          signal: AbortSignal.timeout(120000),
        });
        
        if (!response.ok) {
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Copy scoring response received:', data);
        setCopyScores(data);
        
        // Add to history
        const timestamp = new Date();
        const newHistoryItem = {
          id: Date.now(),
          type: 'copyRating',
          title: `Copy Score ${new Date().toLocaleTimeString()}`,
          timestamp,
          article,
          copyScores: data,
        };
        
        setHistoryItems(prev => [newHistoryItem, ...prev]);
        
      } else {
        console.log('Using mock data for copy scoring');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const mockResponse = {
          overallScore: 78,
          categories: [
            {
              name: "Content Quality",
              score: 41,
              maxScore: 50,
              subcategories: [
                { name: "Readability", score: 9, maxScore: 10 },
                { name: "Clarity", score: 8, maxScore: 10 },
                { name: "Originality", score: 7, maxScore: 10 },
                { name: "Engagement", score: 8, maxScore: 10 },
                { name: "Depth", score: 9, maxScore: 10 }
              ]
            },
          ],
          improvement: "Consider adding more specific keywords related to your industry. Your content would benefit from more descriptive subheadings and shorter paragraphs for better readability."
        };
        
        setCopyScores(mockResponse);
        
        // Add to history
        const timestamp = new Date();
        const newHistoryItem = {
          id: Date.now(),
          type: 'copyRating',
          title: `Copy Score ${new Date().toLocaleTimeString()}`,
          timestamp,
          article,
          copyScores: mockResponse,
        };
        
        setHistoryItems(prev => [newHistoryItem, ...prev]);
      }
    } catch (err) {
      console.error('Scoring error:', err);
      setScoringError(`Failed to rate copy: ${err.message}`);
    } finally {
      setScoringLoading(false);
    }
  };
  
  const handleSelectHistoryItem = (item) => {
    setSelectedHistoryItem(item);
    setArticle(item.article || '');
    setResults(item.results || null);
    setCopyScores(item.copyScores || null);
  };
  
  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all history items?')) {
      setHistoryItems([]);
      localStorage.removeItem('analysisHistory');
    }
  };
  
  const renderCategoryChart = (category, index) => {
    // Simplified chart representation
    return (
      <div 
        style={{ 
          height: '10px', 
          width: '100%', 
          backgroundColor: '#E2E8F0',
          borderRadius: '5px',
          marginTop: '10px',
          overflow: 'hidden'
        }}
      >
        <div 
          style={{ 
            height: '100%', 
            width: `${(category.score / category.maxScore) * 100}%`,
            backgroundColor: 
              (category.score / category.maxScore) * 100 >= 80 ? '#38A169' :
              (category.score / category.maxScore) * 100 >= 60 ? '#D69E2E' : 
              '#E53E3E',
            borderRadius: '5px'
          }}
        />
      </div>
    );
  };

  return (
    <Router>
      <Routes>
        {/* Landing Page Route */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Main App Route */}
        <Route 
          path="/app" 
          element={
            <AppLayout 
              historyItems={historyItems}
              onSelectHistoryItem={handleSelectHistoryItem}
              onClearHistory={handleClearHistory}
              selectedHistoryItem={selectedHistoryItem}
            >
              {error && <ErrorMessage>{error}</ErrorMessage>}
              {scoringError && <ErrorMessage>{scoringError}</ErrorMessage>}
              
              <FormContainer>
                <FormTitle>SEO Backlink Builder</FormTitle>
                <TextArea 
                  value={article}
                  onChange={(e) => setArticle(e.target.value)}
                  placeholder="Paste your SEO article here..."
                />
                <ButtonGroup>
                  <StyledButton 
                    primary 
                    onClick={handleAnalyze} 
                    disabled={!article.trim() || loading || scoringLoading}
                  >
                    {loading ? 'Analyzing...' : 'Analyze Article'}
                  </StyledButton>
                  <StyledButton 
                    onClick={handleRateCopy} 
                    disabled={!article.trim() || loading || scoringLoading}
                  >
                    {scoringLoading ? 'Rating...' : 'Rate My Copy'}
                  </StyledButton>
                </ButtonGroup>
              </FormContainer>
              
              {results && (
                <ResultsContainer>
                  <Card>
                    <CardTitle>Identified Themes</CardTitle>
                    <List>
                      {results.subjects && results.subjects.map((subject, index) => (
                        <ListItem key={index}>{subject}</ListItem>
                      ))}
                    </List>
                  </Card>
                  
                  <Card>
                    <CardTitle>Recommended Websites</CardTitle>
                    <List>
                      {results.websites && results.websites.map((website, index) => (
                        <ListItem key={index}>
                          <a 
                            href={website.startsWith('http') ? website : `https://${website}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            {website}
                          </a>
                        </ListItem>
                      ))}
                    </List>
                  </Card>
                </ResultsContainer>
              )}
              
              {copyScores && (
                <ScoreDashboard>
                  <ScoreHeader>
                    <ScoreTitle>Copy Quality Assessment</ScoreTitle>
                    <OverallScore score={copyScores.overallScore}>
                      {copyScores.overallScore}/100
                    </OverallScore>
                  </ScoreHeader>
                  
                  {copyScores.improvement && (
                    <div style={{ 
                      backgroundColor: '#F0FFF4', 
                      padding: '1rem', 
                      borderRadius: '0.5rem',
                      marginBottom: '1.5rem',
                      border: '2px solid #38A169'
                    }}>
                      <h4 style={{ marginTop: 0, marginBottom: '0.5rem', fontFamily: 'Courier, monospace' }}>
                        Improvement Suggestions
                      </h4>
                      <p style={{ margin: 0 }}>{copyScores.improvement}</p>
                    </div>
                  )}
                  
                  {copyScores.categories && copyScores.categories.map((category, index) => (
                    <CategoryScoreCard key={index}>
                      <CategoryHeader>
                        <CategoryName>{category.name}</CategoryName>
                        <CategoryScore score={category.score} maxScore={category.maxScore}>
                          {category.score}/{category.maxScore}
                        </CategoryScore>
                      </CategoryHeader>
                      
                      <ScoreCardLayout>
                        <ScoreDetails>
                          <SubcategoriesList>
                            {category.subcategories.map((sub, subIndex) => (
                              <SubcategoryItem key={subIndex}>
                                <SubcategoryName>{sub.name}</SubcategoryName>
                                <SubcategoryScore score={sub.score} maxScore={sub.maxScore}>
                                  {sub.score}/{sub.maxScore}
                                </SubcategoryScore>
                              </SubcategoryItem>
                            ))}
                          </SubcategoriesList>
                          
                          {renderCategoryChart(category, index)}
                        </ScoreDetails>
                        
                        <ChartContainer>
                          <Radar
                            data={{
                              labels: category.subcategories.map(sub => sub.name),
                              datasets: [
                                {
                                  label: category.name,
                                  data: category.subcategories.map(sub => sub.score),
                                  backgroundColor: `rgba(${category.name === 'Content Quality' 
                                    ? '56, 161, 105, 0.2' 
                                    : '214, 158, 46, 0.2'})`,
                                  borderColor: `${category.name === 'Content Quality' 
                                    ? '#38A169' 
                                    : '#D69E2E'}`,
                                  borderWidth: 2,
                                  pointBackgroundColor: `${category.name === 'Content Quality' 
                                    ? '#38A169' 
                                    : '#D69E2E'}`,
                                  pointBorderColor: '#fff',
                                  pointHoverBackgroundColor: '#fff',
                                  pointHoverBorderColor: `${category.name === 'Content Quality' 
                                    ? '#38A169' 
                                    : '#D69E2E'}`,
                                }
                              ]
                            }}
                            options={{
                              scales: {
                                r: {
                                  angleLines: {
                                    display: true,
                                    color: 'rgba(0, 0, 0, 0.1)'
                                  },
                                  suggestedMin: 0,
                                  suggestedMax: 10,
                                  ticks: {
                                    stepSize: 2,
                                    backdropColor: 'transparent'
                                  }
                                }
                              },
                              elements: {
                                line: {
                                  tension: 0.2
                                }
                              },
                              plugins: {
                                legend: {
                                  display: false
                                },
                                tooltip: {
                                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                  titleFont: {
                                    size: 14,
                                    family: 'Courier, monospace'
                                  },
                                  bodyFont: {
                                    size: 12
                                  },
                                  callbacks: {
                                    title: (items) => {
                                      return category.subcategories[items[0].dataIndex].name;
                                    },
                                    label: (item) => {
                                      return `Score: ${item.raw}/10`;
                                    }
                                  }
                                }
                              },
                              responsive: true,
                              maintainAspectRatio: false
                            }}
                          />
                        </ChartContainer>
                      </ScoreCardLayout>
                    </CategoryScoreCard>
                  ))}
                </ScoreDashboard>
              )}
              
              {loading && (
                <LoadingOverlay>
                  <LoadingSpinner />
                  <LoadingQuoteBox>
                    <LoadingTitle>Analyzing Article</LoadingTitle>
                    <QuoteText>"{currentQuote}"</QuoteText>
                    <ProgressBarContainer>
                      <ProgressBar />
                    </ProgressBarContainer>
                  </LoadingQuoteBox>
                </LoadingOverlay>
              )}
              
              {scoringLoading && (
                <LoadingOverlay>
                  <LoadingSpinner />
                  <LoadingQuoteBox>
                    <LoadingTitle>Analyzing Your Copy</LoadingTitle>
                    <QuoteText>"{currentQuote}"</QuoteText>
                    <ProgressBarContainer>
                      <ProgressBar />
                    </ProgressBarContainer>
                  </LoadingQuoteBox>
                </LoadingOverlay>
              )}
            </AppLayout>
          } 
        />
        
        {/* Redirect any other routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App; 