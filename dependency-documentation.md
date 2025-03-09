# Dependency Documentation

This document provides a comprehensive overview of all dependencies used in the SEO Backlink Builder project, including their versions and specific purposes within the application.

## Root Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| concurrently | ^8.2.0 | Allows running multiple npm commands concurrently (used to start both frontend and backend) |
| openai | ^4.85.1 | Integration with OpenAI services for content analysis and generation |
| selenium-webdriver | ^4.28.1 | Automated browser control for web scraping and testing |
| chromedriver | ^133.0.1 | Chrome-specific driver for Selenium WebDriver |
| chart.js | ^4.4.8 | JavaScript charting library for data visualization |
| react-chartjs-2 | ^5.3.0 | React wrapper for Chart.js |

## Backend Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| express | ^4.18.2 | Web framework for Node.js to build the REST API |
| axios | ^1.6.3 | Promise-based HTTP client for making API requests |
| cheerio | ^1.0.0-rc.12 | Fast and flexible HTML parsing for web scraping |
| cors | ^2.8.5 | Middleware to enable Cross-Origin Resource Sharing |
| dotenv | ^16.0.3 | Loads environment variables from .env file |
| jsonwebtoken | ^8.5.1 | Implementation of JSON Web Tokens for authentication |
| mongoose | ^7.0.1 | MongoDB object modeling tool |
| mysql2 | ^3.12.0 | MySQL client for Node.js with prepared statements |
| selenium-webdriver | ^4.16.0 | Backend-specific version of Selenium for web automation |

### Backend Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| nodemon | ^2.0.22 | Automatically restarts the server during development when files change |

## Frontend Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| axios | ^1.4.0 | HTTP client for making API requests to the backend |
| react | ^18.2.0 | JavaScript library for building user interfaces |
| react-dom | ^18.2.0 | React package for working with the DOM |
| react-query | ^3.39.3 | Data fetching and state management library for React |
| react-router-dom | ^7.2.0 | Declarative routing for React applications |
| react-toastify | ^11.0.5 | React notification library for alerts and feedback |
| styled-components | ^6.1.15 | CSS-in-JS library for component styling |
| zustand | ^4.2.5 | Small, fast state management solution for React |

### Frontend Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| vite | ^4.5.9 | Next generation frontend build tool that significantly improves development experience |

## Dependency Management

The project uses npm workspaces to manage dependencies across the monorepo. This setup allows:

1. **Centralized dependency management**: Common dependencies can be installed at the root level
2. **Workspace-specific dependencies**: Each workspace can maintain its own dependencies
3. **Single node_modules folder**: Reduces duplication and disk space requirements
4. **Simplified scripts**: Run commands across all workspaces or target specific ones

## Version Compatibility Notes

- **Node.js**: The application requires Node.js ≥ 18.0.0 as specified in the backend's package.json engines field
- **React**: Using React 18 which introduced concurrency features and automatic batching
- **Vite**: Using Vite 4 which offers superior developer experience and build performance
- **Selenium**: Using Selenium 4 which has significant architectural changes from version 3

## Updating Dependencies

When updating dependencies, consider the following:

1. **Backend dependencies**: Update by running `npm update --workspace=backend`
2. **Frontend dependencies**: Update by running `npm update --workspace=frontend`
3. **Root dependencies**: Update by running `npm update`

Always verify compatibility and test thoroughly after updating dependencies, especially for major version upgrades.

## Security Considerations

Several dependencies handle sensitive operations:

- **jsonwebtoken**: Responsible for authentication token generation and verification
- **axios**: Handles HTTP requests that may contain sensitive data
- **mysql2**: Manages database connections and queries

Regularly update these packages to address security vulnerabilities, and ensure proper configuration to prevent common security issues.

## Environment-Specific Dependencies

The application uses environment variables (loaded via `dotenv`) to configure various behaviors. Key environment variables include:

- **Database connection parameters**: Used by mysql2
- **API keys**: Used by OpenAI and other external services
- **Port configurations**: Used by Express server

Ensure these are properly set in the environment or in a `.env` file (not committed to version control) for the dependencies to function correctly. 