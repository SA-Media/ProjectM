# SEO Backlink Builder

A comprehensive tool for analyzing SEO content, building backlinks, and discovering leads for your business.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [System Requirements](#system-requirements)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Technologies](#technologies)
- [Development](#development)
- [Troubleshooting](#troubleshooting)

## Overview

The SEO Backlink Builder is a full-stack application designed to help users analyze SEO content, find potential backlink opportunities, and manage leads. The application consists of a React frontend and a Node.js/Express backend.

## Features

- SEO content analysis
- Lead management and discovery
- Website analysis for backlink opportunities
- User-friendly dashboard with visualizations
- Data export capabilities

## System Requirements

- Node.js >= 18.0.0
- MySQL database server
- Chrome browser (for Selenium WebDriver features)

## Installation

### Quick Start

1. Clone the repository from GitHub:
   ```
   git clone https://github.com/your-username/seo-backlink-builder.git
   cd seo-backlink-builder
   ```

2. Install dependencies for both frontend and backend:
   ```
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   # Database Configuration
   DB_HOST=127.0.0.1
   DB_USER=root
   DB_PASSWORD=password
   DB_NAME=leads_db
   DB_PORT=3306
   
   # API Keys
   HYPERBOLIC_API_KEY=your_api_key_here
   
   # Other Configuration
   PORT=5000
   FRONTEND_URL=http://localhost:3000
   ```

4. Set up the MySQL database:
   - Ensure your MySQL server is running
   - Create a database named `leads_db` (or as specified in your `.env`)
   - The application will automatically create necessary tables on startup

5. Start the development server:
   ```
   npm run dev
   ```

6. Access the application:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:5000](http://localhost:5000)

## Project Structure

```
seo-backlink-builder/
├── backend/                # Backend Node.js/Express application
│   ├── server.js           # Main server entry point
│   └── package.json        # Backend dependencies
│
├── frontend/               # Frontend React application
│   ├── src/                # Source code
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── styles/         # CSS and styling
│   │   ├── assets/         # Static assets
│   │   ├── App.jsx         # Main application component
│   │   └── main.jsx        # Application entry point
│   ├── index.html          # HTML template
│   └── package.json        # Frontend dependencies
│
├── package.json            # Root package.json for workspaces
└── README.md               # Project documentation
```

## API Documentation

### Authentication

The API uses JWT authentication for protected endpoints.

### Endpoints

#### Content Analysis

`POST /api/v1/analyze`

Analyzes SEO content and provides recommendations.

Request body:
```json
{
  "content": "Your SEO content to analyze..."
}
```

Response:
```json
{
  "analysis": {
    "score": 85,
    "categories": [
      {
        "name": "Keyword Usage",
        "score": 90,
        "suggestions": ["..."]
      },
      // Other categories
    ],
    "suggestions": ["..."]
  }
}
```

#### Lead Management

`GET /api/v1/leads`

Returns a list of leads.

Query parameters:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of results per page (default: 20)
- `search` (optional): Search term for filtering leads

Response:
```json
{
  "leads": [
    {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "company_name": "Example Inc",
      // Other lead data
    }
    // Additional leads
  ],
  "totalCount": 100,
  "pages": 5
}
```

`POST /api/v1/leads`

Creates a new lead.

Request body:
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane@example.com",
  "company_name": "Example Corp",
  // Other lead data
}
```

Response:
```json
{
  "id": 2,
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane@example.com",
  "company_name": "Example Corp",
  // Other lead data
}
```

Additional endpoints are available for updating, deleting, and managing leads.

## Technologies

### Frontend Dependencies (v1.0.0)
- React v18.2.0
- React Router DOM v7.2.0
- Axios v1.4.0
- React Query v3.39.3
- Styled Components v6.1.15
- React Toastify v11.0.5
- Zustand v4.2.5
- Chart.js v4.4.8
- React Chart.js 2 v5.3.0
- Vite v4.5.9 (dev)

### Backend Dependencies (v1.0.0)
- Express v4.18.2
- Axios v1.6.3
- Cheerio v1.0.0-rc.12
- CORS v2.8.5
- Dotenv v16.0.3
- JSON Web Token v8.5.1
- Mongoose v7.0.1
- MySQL2 v3.12.0
- Selenium WebDriver v4.16.0
- Nodemon v2.0.22 (dev)

### Root Dependencies
- Concurrently v8.2.0
- OpenAI v4.85.1
- Selenium WebDriver v4.28.1
- ChromeDriver v133.0.1
- Chart.js v4.4.8
- React Chart.js 2 v5.3.0

## Development

### Running in Development Mode

```
npm run dev
```

This starts both the frontend and backend in development mode with hot-reloading.

### Building for Production

```
# Build the frontend
cd frontend
npm run build

# Start the production server
cd ..
npm start
```

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Ensure your MySQL server is running
   - Verify credentials in `.env` are correct
   - Check if the database exists

2. **API Connection Issues**
   - Verify that the backend server is running
   - Check for CORS issues in the browser console
   - Confirm that the frontend is using the correct API URL

3. **Selenium WebDriver Issues**
   - Ensure you have ChromeDriver installed and it matches your Chrome version
   - Check that Chrome is installed and accessible

For additional help, please open an issue on the GitHub repository. 