# SEO Backlink Builder

A comprehensive tool for analyzing SEO content, building backlinks, and discovering leads for your business.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [System Requirements](#system-requirements)
- [Quick Start Guide](#quick-start-guide)
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
- npm (included with Node.js)
- MySQL database server (installed and running)
- Chrome browser (for Selenium WebDriver features)

## Quick Start Guide

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/seo-backlink-builder.git
cd seo-backlink-builder
```

### 2. Database Setup

1. Ensure your MySQL server is running
2. Create a database named `leads_db`:
   ```sql
   CREATE DATABASE leads_db;
   ```
3. Make note of your MySQL credentials for the next step

### 3. Configure Backend Environment

Create a `.env` file in the backend directory with the following content:

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

⚠️ **Important**: Adjust the database credentials to match your MySQL setup.

### 4. Install Dependencies

From the root directory, install all dependencies for both frontend and backend:

```bash
# Install root and workspace dependencies
npm install
```

All necessary packages are included in the package.json files:
- Frontend includes react-toastify, chart.js, react-chartjs-2, etc.
- Backend includes express, mysql2, selenium-webdriver, etc.

### 5. Start the Application

From the root directory, start both services with a single command:

```bash
npm run dev
```

This will concurrently start:
- Backend server on http://localhost:5000
- Frontend dev server on http://localhost:3000

### 6. Access the Application

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

```bash
npm run dev
```

This starts both the frontend and backend in development mode with hot-reloading.

### Building for Production

```bash
# Build the frontend
cd frontend
npm run build

# Start the production server
cd ..
npm start
```

## Troubleshooting

### Port Already in Use

If you get an error that the port is already in use:

```bash
# Find the process using the port
lsof -i :3000    # For frontend port
lsof -i :5000    # For backend port

# Kill the process
kill [PID]       # Replace [PID] with the process ID from the above command
```

### Database Connection Issues

- Ensure your MySQL server is running with `mysql.server status` or equivalent for your OS
- Verify the credentials in the `.env` file match your MySQL setup
- Check MySQL connection: `mysql -u root -p leads_db`
- Check if the database exists

### Node.js Version Issues

If you see npm warnings about Node.js version:
1. Consider using nvm (Node Version Manager) to install Node.js v18:
   ```bash
   nvm install 18
   nvm use 18
   ```
2. Then restart the setup process

### API Connection Issues

- Verify that the backend server is running
- Check for CORS issues in the browser console
- Confirm that the frontend is using the correct API URL

### Selenium WebDriver Issues

- Ensure you have ChromeDriver installed and it matches your Chrome version
- Check that Chrome is installed and accessible

### Missing Dependencies

If you encounter errors about missing modules (unlikely with this setup):

```bash
# From the project root
npm install

# Or install a specific package
npm install [package-name] --workspace=frontend
npm install [package-name] --workspace=backend
```

For additional help, please open an issue on the GitHub repository. 