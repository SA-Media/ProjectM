# SEO Backlink Builder - Codebase Documentation

This document provides a comprehensive overview of the SEO Backlink Builder codebase, designed to help developers understand the system architecture, components, and integration points.

## Architecture Overview

The SEO Backlink Builder is built using a modern web stack with a clear separation of concerns:

- **Frontend**: React-based single-page application
- **Backend**: Express.js API server
- **Database**: MySQL database for persistent storage
- **External Services**: Integration with web scraping and analysis tools

### System Architecture Diagram

```
┌────────────────┐      ┌────────────────┐      ┌────────────────┐
│                │      │                │      │                │
│   React SPA    │◄────►│  Express API   │◄────►│  MySQL Database│
│   (Frontend)   │      │   (Backend)    │      │                │
│                │      │                │      │                │
└────────────────┘      └───────┬────────┘      └────────────────┘
                                │
                       ┌────────▼────────┐
                       │  External APIs  │
                       │  & Web Scraping │
                       │                 │
                       └─────────────────┘
```

## Frontend Architecture

The frontend is built with React, Vite, and various UI libraries. It follows a component-based architecture with a central state management approach.

### Key Frontend Files and Directories

- `frontend/src/main.jsx`: Application entry point
- `frontend/src/App.jsx`: Main application component containing routes and core functionality
- `frontend/src/components/`: Reusable UI components
- `frontend/src/pages/`: Page-level components
- `frontend/src/styles/`: Styling and theme configuration

### Frontend State Management

The application uses a combination of:
- Local React state (useState) for component-specific state
- React Query for server state management
- Zustand for global application state

### Frontend Component Architecture

The component hierarchy is organized as follows:

```
App
├── AppLayout (Layout wrapper)
│   ├── Header
│   ├── Sidebar
│   └── Main Content Area
├── Pages
│   ├── LandingPage
│   ├── Dashboard
│   ├── Analysis
│   └── Leads
└── Shared Components
    ├── Button
    ├── AnalysisCard
    ├── LeadGrid
    └── Other UI components
```

### Frontend API Integration

API calls are managed through a centralized API client using Axios. The main API integration points are:

- Content analysis (`/api/v1/analyze`)
- Lead management (CRUD operations)
- User authentication
- Dashboard data retrieval

## Backend Architecture

The backend is built using Node.js and Express, following a RESTful API design pattern.

### Key Backend Files

- `backend/server.js`: Main server entry point containing all routes and middleware

### Backend API Structure

The API follows a RESTful architecture with these main resource endpoints:

- `/api/v1/analyze`: Content analysis endpoints
- `/api/v1/leads`: Lead management endpoints
- `/api/v1/auth`: Authentication endpoints

### Database Schema

The MySQL database includes the following key tables:

**Leads Table**:
```sql
CREATE TABLE leads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(100),
  company_name VARCHAR(255),
  position VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  zip VARCHAR(50),
  country VARCHAR(100)
  /* Additional fields */
)
```

**Analysis Table**:
```sql
CREATE TABLE analyses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  content TEXT,
  score INT,
  analysis_data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  /* Additional fields */
)
```

## Key Technical Features

### Web Scraping and Data Collection

The application uses:
- Selenium WebDriver for dynamic website scraping
- Cheerio for static HTML parsing
- MySQL for storing and querying collected data

### Content Analysis

The content analysis feature:
1. Accepts user input (article content)
2. Processes the content for SEO optimization
3. Returns scores and recommendations across multiple categories
4. Visualizes the results using Chart.js

### Lead Management

The lead management system:
1. Stores contact information for potential leads
2. Provides filtering and search capabilities
3. Allows for lead data export

## Development Workflow

### Local Development

1. Run the application in development mode: `npm run dev`
2. Frontend development server runs on port 3000
3. Backend API server runs on port 5000
4. MySQL database should be running locally on default port 3306

### Testing

No formal testing framework is currently implemented. Adding Jest/React Testing Library for frontend and Mocha/Chai for backend is recommended.

### Deployment Considerations

For production deployment:
1. Build the frontend: `cd frontend && npm run build`
2. Ensure proper environment variables are set
3. Configure a production database
4. Set up proper SSL certificates for HTTPS
5. Consider using a process manager like PM2 for the Node.js application

## Common Workflows

### Content Analysis Workflow

1. User enters content in the textarea
2. The application sends the content to the `/api/v1/analyze` endpoint
3. Backend performs analysis (may include third-party API calls)
4. Results are returned and displayed with visualizations
5. Analysis is saved to history for future reference

### Lead Management Workflow

1. User searches for leads based on criteria
2. Backend queries the database and returns matching leads
3. User can view, edit, or export lead information
4. User can add new leads manually or through the analysis process

## Integration Points

### External API Integrations

The application integrates with:
- Hyperbolic API (for enhanced content analysis)
- Web scraping tools (Selenium, Cheerio)
- Potentially other SEO analysis services

## Future Development Recommendations

1. **Code Organization**: Refactor server.js into modular routes and controllers
2. **Testing**: Implement comprehensive test coverage
3. **Documentation**: Add JSDoc comments to functions
4. **Performance**: Implement caching for frequent API calls
5. **Security**: Enhance authentication and implement rate limiting

## Troubleshooting Guide

### Common Error Scenarios

1. **Database Connection Issues**
   - Error: "Cannot connect to MySQL database"
   - Solution: Check database connection parameters and ensure MySQL is running

2. **API Request Failures**
   - Error: "Failed to fetch from /api/v1/analyze"
   - Solution: Verify backend is running and check request payload format

3. **Selenium Errors**
   - Error: "WebDriver session not created"
   - Solution: Ensure Chrome and ChromeDriver versions match and are installed correctly 