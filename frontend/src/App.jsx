import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [article, setArticle] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [backlinkData, setBacklinkData] = useState(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setAnalysisData(null);
    setBacklinkData(null);
    try {
      const response = await axios.post('http://localhost:5001/api/v1/analyze', { article });
      setAnalysisData(response.data);
    } catch (error) {
      console.error("Error analyzing article: ", error);
    }
    setLoading(false);
  };

  const handleFindBacklinks = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5001/api/v1/backlinks', { subjects: analysisData.subjects });
      setBacklinkData(response.data);
    } catch (error) {
      console.error("Error fetching backlinks: ", error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">SEO Backlink Builder</h1>
          <nav>
            <a href="#" className="text-gray-600 hover:text-gray-800 mx-2">Home</a>
            <a href="#" className="text-gray-600 hover:text-gray-800 mx-2">About</a>
            <a href="#" className="text-gray-600 hover:text-gray-800 mx-2">Contact</a>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {/* Hero Section */}
        <section className="bg-white rounded-lg shadow p-6 my-6">
          <h2 className="text-xl font-semibold mb-4">Analyze your SEO Article</h2>
          <textarea 
            className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring focus:border-blue-300"
            rows="8"
            placeholder="Paste your article here..."
            value={article}
            onChange={(e) => setArticle(e.target.value)}
          />
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleAnalyze}
              disabled={loading || article.trim() === ""}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded disabled:opacity-50 transition"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Analyzing...
                </div>
              ) : "Analyze Article"}
            </button>
          </div>
        </section>

        {/* Results Section */}
        {analysisData && (
          <section className="bg-white rounded-lg shadow p-6 my-6">
            <h2 className="text-xl font-semibold mb-4">Article Analysis</h2>
            <div className="mt-4">
              <strong>Extracted Subjects:</strong>
              <ul className="list-disc ml-6 mt-2">
                {analysisData.subjects && analysisData.subjects.map((subject, idx) => (
                  <li key={idx}>{subject}</li>
                ))}
              </ul>
            </div>
            {!backlinkData && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleFindBacklinks}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition disabled:opacity-50"
                >
                  {loading ? "Finding Backlink Opportunities..." : "Find Backlink Opportunities"}
                </button>
              </div>
            )}
          </section>
        )}

        {/* Backlink Opportunities Section */}
        {backlinkData && (
          <section className="bg-white rounded-lg shadow p-6 my-6">
            <h2 className="text-xl font-semibold mb-4">Backlink Opportunities</h2>
            <div className="mt-2">
              <strong>Backlinks:</strong>
              <ul className="list-disc ml-6 mt-2">
                {backlinkData.backlinks.map((siteObj, idx) => (
                  <li key={idx}>
                    <a href={siteObj.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {siteObj.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-2">
              <strong>Emails:</strong>
              <ul className="list-disc ml-6 mt-2">
                {backlinkData.emails.map((email, idx) => (
                  <li key={idx}>{email}</li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App; 