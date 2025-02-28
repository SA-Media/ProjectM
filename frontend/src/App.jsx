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
import { Chart, RadarController, LineElement, PointElement, RadialLinearScale, Tooltip, Legend } from 'chart.js';
import LeadGrid from './components/dashboard/LeadGrid';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Register the required Chart.js components
Chart.register(RadarController, LineElement, PointElement, RadialLinearScale, Tooltip, Legend);

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
  background-color: ${props => props.$primary ? theme.colors.primary.teal : 'white'};
  color: ${props => props.$primary ? 'white' : theme.colors.text.primary};
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
  font-family: ${props => props.theme?.typography?.fontFamily?.body || 'system-ui, sans-serif'};
  font-size: ${props => props.theme?.typography?.fontSize?.lg || '1.125rem'};
  margin-bottom: ${props => props.theme?.spacing?.xl || '2rem'};
  padding: ${props => props.theme?.spacing?.lg || '1.5rem'};
  background-color: ${props => props.theme?.colors?.background?.light || '#F7FAFC'};
  border: 1px solid ${props => props.theme?.colors?.border?.light || '#E2E8F0'};
  border-radius: ${props => props.theme?.borderRadius?.md || '0.375rem'};
  max-width: 800px;
  width: 100%;
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
    const score = parseInt(props.$score);
    if (score >= 80) return '#38A169';
    if (score >= 60) return '#D69E2E';
    return '#E53E3E';
  }};
  background-color: ${props => {
    const score = parseInt(props.$score);
    if (score >= 80) return 'rgba(56, 161, 105, 0.1)';
    if (score >= 60) return 'rgba(214, 158, 46, 0.1)';
    return 'rgba(229, 62, 62, 0.1)';
  }};
  padding: 0.5rem 1rem;
  border-radius: ${theme.borderRadius.md};
  border: 2px solid ${props => {
    const score = parseInt(props.$score);
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
  background-color: ${props => {
    const percentage = (props.$score / props.$maxScore) * 100;
    if (percentage >= 70) return '#D5F5E3'; // light green
    if (percentage >= 40) return '#FCF3CF'; // light yellow
    return '#FADBD8'; // light red
  }};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${props => {
    const score = (props.$score / props.$maxScore) * 100;
    if (score >= 80) return '#38A169';
    if (score >= 60) return '#D69E2E';
    return '#E53E3E';
  }};
  padding: 0.5rem 1rem;
  border-radius: ${theme.borderRadius.md};
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
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${props => {
    const score = (props.$score / props.$maxScore) * 100;
    if (score >= 80) return '#38A169';
    if (score >= 60) return '#D69E2E';
    return '#E53E3E';
  }};
  background-color: ${props => {
    const score = (props.$score / props.$maxScore) * 100;
    if (score >= 80) return 'rgba(56, 161, 105, 0.1)';
    if (score >= 60) return 'rgba(214, 158, 46, 0.1)';
    return 'rgba(229, 62, 62, 0.1)';
  }};
  padding: 0.25rem 0.5rem;
  border-radius: ${theme.borderRadius.md};
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

// Utility function for API calls with improved error handling
const apiCall = async (url, method = 'GET', data = null, timeoutMs = 30000) => {
  console.log(`Making ${method} request to ${url}`, data);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      ...(data && { body: JSON.stringify(data) }),
    };

    const response = await fetch(url, options);
    clearTimeout(timeoutId);

    console.log(`Response status: ${response.status}`);
    
    // Handle non-2xx responses
    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (jsonError) {
        // If response is not JSON, try to get text
        try {
          errorMessage = await response.text() || errorMessage;
        } catch (textError) {
          console.error('Could not parse error response as text:', textError);
        }
      }
      
      throw new Error(errorMessage);
    }

    const responseData = await response.json();
    console.log('Response data:', responseData);
    return responseData;
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Handle different error types
    if (error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs/1000} seconds`);
    }
    
    console.error('API call error:', error);
    throw error;
  }
};

// Global error boundary for the entire app
class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Application error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <ErrorTitle>Something went wrong</ErrorTitle>
          <ErrorMessage>
            {this.state.error && this.state.error.toString()}
          </ErrorMessage>
          <Button 
            onClick={() => {
              this.setState({ hasError: false, error: null, errorInfo: null });
              window.location.reload();
            }}
          >
            Try again
          </Button>
          {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
            <ErrorStack>
              {this.state.errorInfo.componentStack}
            </ErrorStack>
          )}
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding: ${props => props.theme?.spacing?.xl || '2rem'};
  background-color: ${props => props.theme?.colors?.background?.light || '#F7FAFC'};
`;

const ErrorTitle = styled.h1`
  font-family: 'Courier', monospace;
  font-size: ${props => props.theme?.typography?.fontSize?.['4xl'] || '2.25rem'};
  margin-bottom: ${props => props.theme?.spacing?.lg || '1.5rem'};
  color: ${props => props.theme?.colors?.error || '#E53E3E'};
`;

const ErrorStack = styled.pre`
  font-family: monospace;
  font-size: ${props => props.theme?.typography?.fontSize?.sm || '0.875rem'};
  margin-top: ${props => props.theme?.spacing?.xl || '2rem'};
  padding: ${props => props.theme?.spacing?.lg || '1.5rem'};
  background-color: #f8f8f8;
  border: 1px solid ${props => props.theme?.colors?.border?.light || '#e2e8f0'};
  border-radius: ${props => props.theme?.borderRadius?.md || '0.375rem'};
  max-width: 800px;
  width: 100%;
  overflow-x: auto;
  color: #666;
`;

// Create an error boundary component
class ChartErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Chart error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center',
          backgroundColor: theme.colors.background.light,
          borderRadius: theme.borderRadius.md,
          color: theme.colors.text.primary
        }}>
          <h3>Chart couldn't be displayed</h3>
          <p>There was a problem rendering the chart component.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Then update your RadarChart component to simplify it and avoid potential issues
const RadarChart = React.memo(({ data, categoryName }) => {
  const chartRef = React.useRef(null);
  const chartInstance = React.useRef(null);
  
  React.useEffect(() => {
    // Only create chart if canvas element exists and data is valid
    if (!chartRef.current || !data || !data.labels || !data.datasets) {
      return;
    }
    
    // Get canvas context
    const ctx = chartRef.current.getContext('2d');
    
    // Cleanup previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    // Create new chart instance
    chartInstance.current = new Chart(ctx, {
      type: 'radar',
      data: data,
      options: {
        responsive: true, 
        maintainAspectRatio: false,
        scales: {
          r: {
            beginAtZero: true,
            min: 0,
            max: 10,
            ticks: {
              display: false,
              stepSize: 2
            },
            angleLines: {
              display: true,
              color: 'rgba(0, 0, 0, 0.1)'
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
            pointLabels: {
              font: {
                size: 12,
                family: "'Courier', monospace"
              }
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: {
              family: "'Courier', monospace"
            },
            callbacks: {
              title: (items) => data.labels[items[0].dataIndex],
              label: (item) => `Score: ${item.raw}/10`
            }
          }
        }
      }
    });
    
    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [data]);
  
  return (
    <div style={{ width: '100%', height: '300px', position: 'relative' }}>
      <canvas ref={chartRef} />
    </div>
  );
});

// Define a wrapper component for StyledButton that handles the $primary prop
const PrimaryButton = ({ $primary, ...props }) => {
  return <StyledButton $primary={$primary} variant={$primary ? 'primary' : 'outline'} {...props} />;
};

function App() {
  // State variables for the main application
  const [article, setArticle] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scoringLoading, setScoringLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [copyScores, setCopyScores] = useState(null);
  const [error, setError] = useState('');
  const [scoringError, setScoringError] = useState('');
  const [currentQuote, setCurrentQuote] = useState('');
  const [historyItems, setHistoryItems] = useState([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [leads, setLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadsError, setLeadsError] = useState('');
  const [showLeads, setShowLeads] = useState(false);
  const [activeTab, setActiveTab] = useState('analysis'); // 'analysis' or 'rating'
  const [errorMessage, setErrorMessage] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('');
  const [isConnectionSuccessful, setIsConnectionSuccessful] = useState(false);
  
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

  const testBackendConnection = async () => {
    // Ensure the state variable is defined before using it
    if (typeof setIsTestingConnection === 'function') {
      setIsTestingConnection(true);
    }
    
    try {
      const response = await fetch(`${backendUrl}/api/v1/health`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: 'Unknown error occurred'
        }));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }
      
      const data = await response.json();
      if (typeof setConnectionStatus === 'function') {
        setConnectionStatus('Connected successfully!');
      }
      if (typeof setIsConnectionSuccessful === 'function') {
        setIsConnectionSuccessful(true);
      }
      console.log('Connection successful:', data);
      toast.success('Connected to backend successfully!');
    } catch (error) {
      console.error('Connection error:', error);
      if (typeof setConnectionStatus === 'function') {
        setConnectionStatus(`Connection failed: ${error.message}`);
      }
      if (typeof setIsConnectionSuccessful === 'function') {
        setIsConnectionSuccessful(false);
      }
      if (typeof setErrorMessage === 'function') {
        setErrorMessage(error.message);
      }
      toast.error(`Failed to connect to backend: ${error.message}`);
    } finally {
      if (typeof setIsTestingConnection === 'function') {
        setIsTestingConnection(false);
      }
    }
  };

  useEffect(() => {
    testBackendConnection();
  }, []);

  const handleAnalyze = async () => {
    if (isLoading) return;
    
    if (!article.trim()) {
      toast.warning('Please enter some text to analyze.');
      return;
    }

    setIsLoading(true);
    setLoading(true);
    setLoadingMessage(loadingQuotes[Math.floor(Math.random() * loadingQuotes.length)]);
    setAnalysisResults(null);
    setResults(null);
    setErrorMessage(null);

    try {
      const result = await apiCall(`${backendUrl}/api/v1/analyze`, 'POST', { article: article });
      
      console.log('Analysis results:', result);
      setAnalysisResults(result);
      setResults(result);
      
      // Save to history
      const newHistoryItem = {
        id: Date.now(),
        text: article.substring(0, 100) + (article.length > 100 ? '...' : ''),
        fullText: article,
        results: result,
        timestamp: new Date().toISOString()
      };
      
      setHistoryItems(prev => [newHistoryItem, ...prev]);
      // Also save to localStorage
      const updatedHistory = [newHistoryItem, ...historyItems];
      localStorage.setItem('analysisHistory', JSON.stringify(updatedHistory.slice(0, 10)));
      
      toast.success('Analysis completed successfully!');
    } catch (error) {
      console.error('Analysis error:', error);
      setErrorMessage(error.message);
      toast.error(`Analysis failed: ${error.message}`);
    } finally {
      setIsLoading(false);
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
      setActiveTab('rating');
      setShowLeads(false);
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

  // Update the handleSearchLeads function to use the more robust endpoint
  const handleSearchLeads = async () => {
    if (!results || !results.subjects || results.subjects.length === 0) {
      setLeadsError('No subjects available to search for leads');
      return;
    }
    
    setLeadsError('');
    setLeadsLoading(true);
    setLeads([]);
    setShowLeads(true);
    
    try {
      console.log('Sending lead search request to backend...');
      const response = await fetch(`${backendUrl}/api/v1/search-leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subjects: results.subjects }),
        signal: AbortSignal.timeout(60000),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Lead search response error:', response.status, errorText);
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Lead search response received:', data);
      setLeads(data.leads || []);
      
    } catch (err) {
      console.error('Lead search error:', err);
      setLeadsError(`Failed to search for leads: ${err.message}`);
    } finally {
      setLeadsLoading(false);
    }
  };

  // Add this useEffect near the other useEffect hooks to debug the results
  useEffect(() => {
    console.log('Results state updated:', results);
  }, [results]);

  useEffect(() => {
    console.log('AnalysisResults state updated:', analysisResults);
  }, [analysisResults]);

  return (
    <>
      <GlobalErrorBoundary>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/app/*"
              element={
                <AppLayout>
                  {errorMessage && (
                    <ErrorNotification>
                      <ErrorIcon>⚠️</ErrorIcon>
                      <ErrorText>{errorMessage}</ErrorText>
                      <CloseButton onClick={() => setErrorMessage(null)}>×</CloseButton>
                    </ErrorNotification>
                  )}
                  {error && <ErrorMessage>{error}</ErrorMessage>}
                  {scoringError && <ErrorMessage>{scoringError}</ErrorMessage>}
                  {leadsError && <ErrorMessage>{leadsError}</ErrorMessage>}
                  
                  <FormContainer>
                    <FormTitle>SEO Backlink Builder</FormTitle>
                    <TextArea 
                      value={article}
                      onChange={(e) => setArticle(e.target.value)}
                      placeholder="Paste your SEO article here..."
                    />
                    <ButtonGroup>
                      <PrimaryButton 
                        $primary 
                        onClick={() => {
                          handleAnalyze();
                          setActiveTab('analysis');
                        }} 
                        disabled={!article.trim() || loading || scoringLoading || leadsLoading}
                      >
                        {loading ? 'Analyzing...' : 'Analyze Article'}
                      </PrimaryButton>
                      <PrimaryButton 
                        onClick={() => {
                          handleRateCopy();
                          setActiveTab('rating');
                        }} 
                        disabled={!article.trim() || loading || scoringLoading || leadsLoading}
                      >
                        {scoringLoading ? 'Rating...' : 'Rate My Copy'}
                      </PrimaryButton>
                    </ButtonGroup>
                  </FormContainer>
                  
                  {(results || analysisResults) && activeTab === 'analysis' && (
                    <ResultsContainer>
                      <Card>
                        <CardTitle>Identified Themes</CardTitle>
                        <List>
                          {(results?.subjects || analysisResults?.subjects || []).map((subject, index) => (
                            <ListItem key={index}>{subject}</ListItem>
                          ))}
                        </List>
                        <ButtonContainer>
                          <PrimaryButton 
                            onClick={handleSearchLeads}
                            disabled={leadsLoading}
                          >
                            {leadsLoading ? 'Searching...' : 'Show Me Leads'}
                          </PrimaryButton>
                        </ButtonContainer>
                      </Card>
                      
                      <Card>
                        <CardTitle>Recommended Websites</CardTitle>
                        <List>
                          {(results?.websites || analysisResults?.websites || []).map((website, index) => (
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
                  
                  {showLeads && activeTab === 'analysis' && (
                    <LeadResultsContainer>
                      <LeadSectionTitle>Potential Leads</LeadSectionTitle>
                      {leadsLoading ? (
                        <LoadingMessage>Searching for relevant leads...</LoadingMessage>
                      ) : (
                        <LeadGrid leads={leads} />
                      )}
                    </LeadResultsContainer>
                  )}
                  
                  {copyScores && activeTab === 'rating' && (
                    <ScoreDashboard>
                      <ScoreHeader>
                        <ScoreTitle>Copy Quality Assessment</ScoreTitle>
                        <OverallScore $score={copyScores.overallScore}>
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
                            <CategoryScore $score={category.score} $maxScore={category.maxScore}>
                              {category.score}/{category.maxScore}
                            </CategoryScore>
                          </CategoryHeader>
                          
                          <ScoreCardLayout>
                            <ScoreDetails>
                              <SubcategoriesList>
                                {category.subcategories.map((sub, subIndex) => (
                                  <SubcategoryItem key={subIndex}>
                                    <SubcategoryName>{sub.name}</SubcategoryName>
                                    <SubcategoryScore $score={sub.score} $maxScore={sub.maxScore}>
                                      {sub.score}/{sub.maxScore}
                                    </SubcategoryScore>
                                  </SubcategoryItem>
                                ))}
                              </SubcategoriesList>
                              
                              {renderCategoryChart(category, index)}
                            </ScoreDetails>
                            
                            <ChartContainer>
                              <ChartErrorBoundary>
                                <RadarChart 
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
                                  categoryName={`category-${index}`}
                                />
                              </ChartErrorBoundary>
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
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </GlobalErrorBoundary>
      <ToastContainer 
        position="top-right" 
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

// Add styled components for the leads section
const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: ${props => props.theme?.spacing?.md || '1rem'};
`;

const LeadResultsContainer = styled.div`
  margin-top: 2rem;
  background-color: white;
  border: 2px solid black;
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.xl};
  box-shadow: ${theme.shadows.md};
  width: 100%;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    box-shadow: ${theme.shadows.lg};
  }
`;

const LeadSectionTitle = styled.h2`
  font-family: 'Courier', monospace;
  font-weight: ${theme.typography.fontWeight.bold};
  font-size: ${theme.typography.fontSize['2xl']};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.lg};
  text-align: center;
  border-bottom: 2px solid ${theme.colors.primary.teal};
  padding-bottom: ${theme.spacing.sm};
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
  font-style: italic;
`;

const ErrorNotification = styled.div`
  display: flex;
  align-items: center;
  padding: ${props => props.theme?.spacing?.md || '1rem'} ${props => props.theme?.spacing?.lg || '1.5rem'};
  background-color: ${props => (props.theme?.colors?.error ? `${props.theme.colors.error}20` : '#FED7D7')};
  border: 1px solid ${props => props.theme?.colors?.error || '#E53E3E'};
  border-radius: ${props => props.theme?.borderRadius?.md || '0.375rem'};
  margin-bottom: ${props => props.theme?.spacing?.lg || '1.5rem'};
`;

const ErrorIcon = styled.span`
  font-size: 1.5rem;
  margin-right: ${props => props.theme?.spacing?.md || '1rem'};
`;

const ErrorText = styled.div`
  flex: 1;
  font-family: ${props => props.theme?.typography?.fontFamily?.body || 'system-ui, sans-serif'};
  color: ${props => props.theme?.colors?.error || '#E53E3E'};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${props => props.theme?.colors?.error || '#E53E3E'};
  padding: 0 ${props => props.theme?.spacing?.sm || '0.5rem'};
  
  &:hover {
    opacity: 0.8;
  }
  
  &:focus {
    outline: none;
  }
`;

export default App; 