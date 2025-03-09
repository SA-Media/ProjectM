# API Documentation

This document provides detailed information about the SEO Backlink Builder API endpoints, request/response formats, authentication, and error handling.

## Base URL

The API base URL in development is:
```
http://localhost:5000/api/v1
```

For production, replace with your production domain.

## Authentication

The API uses JWT (JSON Web Token) authentication for protected endpoints.

### Getting an Authentication Token

**Endpoint:** `POST /auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Example User"
  }
}
```

### Using Authentication

Include the JWT token in the Authorization header for protected endpoints:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## API Endpoints

### Content Analysis

#### Analyze Content

**Endpoint:** `POST /analyze`

**Authentication:** Required

**Request:**
```json
{
  "content": "Your SEO content to analyze...",
  "options": {
    "includeKeywordSuggestions": true,
    "detailedAnalysis": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overallScore": 85,
    "categories": [
      {
        "name": "Keyword Usage",
        "score": 90,
        "suggestions": [
          "Consider using the keyword 'SEO optimization' more frequently",
          "The keyword density is currently 1.2%, which is good"
        ]
      },
      {
        "name": "Readability",
        "score": 80,
        "suggestions": [
          "Consider breaking up longer paragraphs",
          "Your content has a Flesch-Kincaid readability score of 68, which is good"
        ]
      },
      {
        "name": "Structure",
        "score": 85,
        "suggestions": [
          "Add more subheadings to break up content",
          "Consider adding bullet points for better skimmability"
        ]
      }
    ],
    "keywordSuggestions": [
      "SEO optimization",
      "content marketing",
      "search ranking"
    ],
    "analysisId": "abc123"
  }
}
```

#### Get Analysis History

**Endpoint:** `GET /analyze/history`

**Authentication:** Required

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "id": "abc123",
        "content": "Content excerpt...",
        "overallScore": 85,
        "createdAt": "2023-07-15T14:30:00Z"
      },
      {
        "id": "def456",
        "content": "Another content excerpt...",
        "overallScore": 78,
        "createdAt": "2023-07-14T10:15:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 42
    }
  }
}
```

#### Get Analysis Details

**Endpoint:** `GET /analyze/:analysisId`

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "abc123",
    "content": "Full content...",
    "overallScore": 85,
    "categories": [
      {
        "name": "Keyword Usage",
        "score": 90,
        "suggestions": [
          "Consider using the keyword 'SEO optimization' more frequently",
          "The keyword density is currently 1.2%, which is good"
        ]
      },
      // Other categories...
    ],
    "createdAt": "2023-07-15T14:30:00Z"
  }
}
```

### Lead Management

#### Get Leads

**Endpoint:** `GET /leads`

**Authentication:** Required

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20)
- `search` (optional): Search term
- `sort` (optional): Sort field (default: "createdAt")
- `order` (optional): Sort order ("asc" or "desc", default: "desc")

**Response:**
```json
{
  "success": true,
  "data": {
    "leads": [
      {
        "id": 1,
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@example.com",
        "phone": "123-456-7890",
        "company_name": "Example Inc",
        "position": "Marketing Manager",
        "address": "123 Main St",
        "city": "Anytown",
        "state": "CA",
        "zip": "12345",
        "country": "USA",
        "notes": "Potential client for SEO services",
        "createdAt": "2023-07-15T14:30:00Z",
        "updatedAt": "2023-07-15T14:30:00Z"
      },
      // Additional leads...
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 195
    }
  }
}
```

#### Get Lead

**Endpoint:** `GET /leads/:id`

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "123-456-7890",
    "company_name": "Example Inc",
    "position": "Marketing Manager",
    "address": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zip": "12345",
    "country": "USA",
    "notes": "Potential client for SEO services",
    "createdAt": "2023-07-15T14:30:00Z",
    "updatedAt": "2023-07-15T14:30:00Z"
  }
}
```

#### Create Lead

**Endpoint:** `POST /leads`

**Authentication:** Required

**Request:**
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane@example.com",
  "phone": "987-654-3210",
  "company_name": "Another Company",
  "position": "SEO Specialist",
  "address": "456 Oak Ave",
  "city": "Somewhere",
  "state": "NY",
  "zip": "67890",
  "country": "USA",
  "notes": "Interested in backlink services"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane@example.com",
    "phone": "987-654-3210",
    "company_name": "Another Company",
    "position": "SEO Specialist",
    "address": "456 Oak Ave",
    "city": "Somewhere",
    "state": "NY",
    "zip": "67890",
    "country": "USA",
    "notes": "Interested in backlink services",
    "createdAt": "2023-07-16T09:45:00Z",
    "updatedAt": "2023-07-16T09:45:00Z"
  }
}
```

#### Update Lead

**Endpoint:** `PUT /leads/:id`

**Authentication:** Required

**Request:**
```json
{
  "phone": "987-654-3211",
  "notes": "Updated notes about this lead"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane@example.com",
    "phone": "987-654-3211",
    "company_name": "Another Company",
    "position": "SEO Specialist",
    "address": "456 Oak Ave",
    "city": "Somewhere",
    "state": "NY",
    "zip": "67890",
    "country": "USA",
    "notes": "Updated notes about this lead",
    "createdAt": "2023-07-16T09:45:00Z",
    "updatedAt": "2023-07-16T10:30:00Z"
  }
}
```

#### Delete Lead

**Endpoint:** `DELETE /leads/:id`

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "message": "Lead successfully deleted"
}
```

### Website Analysis

#### Analyze Website

**Endpoint:** `POST /website-analysis`

**Authentication:** Required

**Request:**
```json
{
  "url": "https://example.com",
  "options": {
    "scrapeDepth": 2,
    "includeSocialLinks": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "analysisId": "xyz789",
    "url": "https://example.com",
    "status": "processing",
    "estimatedCompletionTime": "60 seconds"
  }
}
```

#### Get Website Analysis Status

**Endpoint:** `GET /website-analysis/:analysisId`

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "analysisId": "xyz789",
    "url": "https://example.com",
    "status": "completed",
    "results": {
      "domainAuthority": 45,
      "backlinks": 1245,
      "topKeywords": ["example", "domain", "test"],
      "socialLinks": {
        "facebook": "https://facebook.com/example",
        "twitter": "https://twitter.com/example",
        "linkedin": "https://linkedin.com/company/example"
      },
      "contactInfo": {
        "email": "contact@example.com",
        "phone": "123-456-7890"
      }
    },
    "completedAt": "2023-07-16T11:05:00Z"
  }
}
```

## Error Handling

The API uses standard HTTP status codes for errors:

- 400: Bad Request (invalid input)
- 401: Unauthorized (missing or invalid authentication)
- 403: Forbidden (authenticated but not authorized)
- 404: Not Found (resource does not exist)
- 429: Too Many Requests (rate limit exceeded)
- 500: Internal Server Error (server issue)

Error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "A descriptive error message",
    "details": {
      "field": "content",
      "issue": "Content must be at least 100 characters long"
    }
  }
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

- 100 requests per minute for authenticated users
- 10 requests per minute for unauthenticated users

Rate limit information is included in response headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1626451800
```

## Pagination

Endpoints that return lists of resources support pagination through query parameters:

- `page`: Page number (starting from 1)
- `limit`: Number of items per page

Pagination information is included in the response:

```json
{
  "pagination": {
    "currentPage": 2,
    "totalPages": 10,
    "totalItems": 195,
    "itemsPerPage": 20
  }
}
```

## Data Export

### Export Leads

**Endpoint:** `GET /export/leads`

**Authentication:** Required

**Query Parameters:**
- `format`: Export format ("csv" or "json", default: "csv")
- `searchQuery` (optional): Filter leads by search term
- `dateFrom` (optional): Filter leads created on or after this date (YYYY-MM-DD)
- `dateTo` (optional): Filter leads created on or before this date (YYYY-MM-DD)

**Response:**
A downloadable file in the requested format containing the leads data. 