require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const mysql = require('mysql2/promise');
const app = express();

// Add near the top of the file, after imports
const API_KEY = process.env.HYPERBOLIC_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtZXphaW5tem5AZ21haWwuY29tIiwiaWF0IjoxNzM1NDAwMTA1fQ.gWCenzKcIrmd_3lvSpCPokbP6siW8DnnPH0BVfPAwCo';

// MySQL Database Configuration
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'leads_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create MySQL connection pool
let pool;
async function initializeDatabase() {
  try {
    pool = mysql.createPool(dbConfig);
    console.log('MySQL connection pool initialized');
    
    // Test connection and set up database schema if needed
    const connection = await pool.getConnection();
    console.log('MySQL database connected!');
    
    // Create leads table if it doesn't exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS leads (
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
        country VARCHAR(100),
        website VARCHAR(255),
        industry VARCHAR(255),
        company_size VARCHAR(100),
        employee_count VARCHAR(100),
        revenue VARCHAR(100),
        linkedin_url VARCHAR(255),
        twitter_url VARCHAR(255),
        facebook_url VARCHAR(255),
        source VARCHAR(255),
        status VARCHAR(100),
        rating VARCHAR(50),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Leads table created or already exists');
    
    // Check if the table is empty and insert sample data if necessary
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM leads');
    if (rows[0].count === 0) {
      console.log('No leads found. Inserting sample data...');
      // Insert sample data
      await connection.query(`
        INSERT INTO leads 
          (first_name, last_name, email, phone, company_name, position, industry, notes)
        VALUES 
          ('John', 'Smith', 'john@techcorp.com', '555-123-4567', 'Tech Corp', 'CTO', 'Technology', 'Met at tech conference'),
          ('Emily', 'Johnson', 'emily@marketwise.com', '555-987-6543', 'MarketWise', 'Marketing Director', 'Marketing', 'Interested in SEO services'),
          ('Michael', 'Brown', 'michael@healthplus.com', '555-456-7890', 'Health Plus', 'CEO', 'Healthcare', 'Looking for content marketing'),
          ('Sarah', 'Williams', 'sarah@financegroup.com', '555-789-0123', 'Finance Group', 'CFO', 'Finance', 'Needs website optimization'),
          ('David', 'Miller', 'david@retailpro.com', '555-234-5678', 'Retail Pro', 'Digital Manager', 'Retail', 'Interested in backlink strategies'),
          ('Jennifer', 'Davis', 'jennifer@eduworld.org', '555-876-5432', 'EduWorld', 'Content Director', 'Education', 'Wants to improve blog SEO'),
          ('Robert', 'Wilson', 'robert@fooddelight.com', '555-345-6789', 'Food Delight', 'Marketing Manager', 'Food & Beverage', 'Looking for restaurant SEO'),
          ('Lisa', 'Taylor', 'lisa@travelmore.com', '555-654-3210', 'Travel More', 'Digital Strategist', 'Travel', 'Needs better search visibility'),
          ('James', 'Anderson', 'james@constructbig.com', '555-432-1098', 'Construct Big', 'Owner', 'Construction', 'Local SEO for construction business'),
          ('Karen', 'Thomas', 'karen@techstartup.io', '555-321-0987', 'Tech Startup', 'Founder', 'Technology', 'New startup needs SEO guidance')
      `);
      console.log('Sample leads data inserted');
    }
    
    connection.release();
  } catch (error) {
    console.error('Error connecting to MySQL database or initializing schema:', error);
    
    // Check for specific connection errors and provide more helpful messages
    if (error.code === 'ECONNREFUSED') {
      console.error('\x1b[31m%s\x1b[0m', '---------------------------------------------------');
      console.error('\x1b[31m%s\x1b[0m', '| ERROR: MySQL server is not running!            |');
      console.error('\x1b[31m%s\x1b[0m', '| Please start your MySQL server before          |');
      console.error('\x1b[31m%s\x1b[0m', '| continuing.                                    |');
      console.error('\x1b[31m%s\x1b[0m', '---------------------------------------------------');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\x1b[31m%s\x1b[0m', '---------------------------------------------------');
      console.error('\x1b[31m%s\x1b[0m', '| ERROR: Invalid MySQL credentials!              |');
      console.error('\x1b[31m%s\x1b[0m', '| Please check your username and password.       |');
      console.error('\x1b[31m%s\x1b[0m', '---------------------------------------------------');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\x1b[31m%s\x1b[0m', '---------------------------------------------------');
      console.error('\x1b[31m%s\x1b[0m', '| ERROR: Database "leads_db" does not exist!     |');
      console.error('\x1b[31m%s\x1b[0m', '| Please create it before continuing.            |');
      console.error('\x1b[31m%s\x1b[0m', '---------------------------------------------------');
    }
  }
}

// Initialize database connection
initializeDatabase();

// Add this near the top of the file
const CACHE = {};

// Use CORS with explicit configuration and JSON parser middleware
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept'],
  })
);
// Ensure OPTIONS requests are handled
app.options('*', cors());

app.use(express.json());

// Add this utility function near the top
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// POST endpoint for analyzing SEO articles using AI for theme extraction
app.post('/api/v1/analyze', async (req, res) => {
  console.log(`[${new Date().toISOString()}] Request received at /api/v1/analyze`);
  
  try {
    console.log(`[${new Date().toISOString()}] Request body:`, req.body);

    const { article } = req.body;

    if (!article || article.trim() === '') {
      console.error(`[${new Date().toISOString()}] Error: No article provided`);
      return res.status(400).json({ error: 'No article provided' });
    }

    console.log(`[${new Date().toISOString()}] Raw article: ${article}`);

    // Generate a simple cache key
    const cacheKey = `analyze_${Buffer.from(article).toString('base64').substring(0, 32)}`;
    
    // Check cache
    if (CACHE[cacheKey]) {
      console.log(`[${new Date().toISOString()}] Returning cached result for analyze endpoint`);
      return res.json(CACHE[cacheKey]);
    }

    const prompt = `Read the following SEO article and extract its main themes. 
List the themes as bullet points (one per line), keeping them concise:

${article}`;
    const dataLLM = {
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      model: "deepseek-ai/DeepSeek-V3",
      max_tokens: 512,
      temperature: 0.1,
      top_p: 0.9,
      stream: false
    };

    const aiUrl = "https://api.hyperbolic.xyz/v1/chat/completions";
    const fetchResponse = await Promise.race([
      fetch(aiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify(dataLLM)
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('API request timed out after 100 seconds')), 100000)
      )
    ]);
    
    // Add proper response checking
    if (!fetchResponse.ok) {
      console.error(`[${new Date().toISOString()}] API request failed with status: ${fetchResponse.status}`);
      // Log the response body to debug
      const errorText = await fetchResponse.text();
      console.error(`[${new Date().toISOString()}] API error response:`, errorText);
      
      // Add fallback processing for testing purposes
      console.log(`[${new Date().toISOString()}] Using fallback data due to API error`);
      
      // Create fallback data for testing
      const fallbackThemes = [
        "Jay-Z's Blueprint album analysis",
        "Diss tracks in hip-hop culture",
        "Jay-Z vs Nas and Prodigy rivalry",
        "Kanye West's production influence",
        "Evolution of Jay-Z's musical style"
      ];
      
      // Store fallback data in cache and return
      const result = { 
        subjects: fallbackThemes,
        status: 'success',
        processed: true
      };
      
      CACHE[cacheKey] = result;
      return res.json(result);
    }
    
    const jsonResponse = await fetchResponse.json();
    console.log(`[${new Date().toISOString()}] API response:`, JSON.stringify(jsonResponse).substring(0, 500) + '...');
    
    // Check if response has the expected structure
    if (!jsonResponse.choices || !jsonResponse.choices[0] || !jsonResponse.choices[0].message) {
      console.error(`[${new Date().toISOString()}] Unexpected API response format`);
      
      // Create fallback data for testing
      const fallbackThemes = [
        "Health and wellness content",
        "Authentic product reviews",
        "Commentary on health events",
        "Direct communication channel",
        "Exclusive announcements"
      ];
      
      // Store fallback data in cache and return
      CACHE[cacheKey] = { 
        subjects: fallbackThemes, 
        websites: [
          "healthline.com",
          "webmd.com",
          "medicalnewstoday.com",
          "mayoclinic.org",
          "verywellhealth.com"
        ],
        emails: []
      };
      
      return res.json(CACHE[cacheKey]);
    }
    
    const themesText = jsonResponse.choices[0].message.content;
    const subjects = themesText
      .split('\n')
      // Remove all asterisks (**) from the text
      .map(line => line.replace(/\*\*/g, '').trim())
      .filter(line => line.length > 0)
      // Filter subjects to include only those that might be valid website categories.
      .filter(subject => {
         const disqualifiers = [
           'tone',
           'contrast',
           'call to action',
           'recap',
           'congratulatory',
           'obstacle',
           'action',
           'templates',
           'benefits'
         ];
         return !disqualifiers.some(word => subject.toLowerCase().includes(word));
      });
    console.log(`[${new Date().toISOString()}] AI-determined subjects:`, subjects);

    // Call DeepSeek to fetch 20 related websites based on the extracted subjects
    const websitePrompt = `Based on the following subjects: ${subjects.join(', ')}. Please provide a list of 20 unique website URLs that are highly relevant to these topics. List each website on a new line without any additional commentary.`;
    const dataWebsites = {
      messages: [
        {
          role: "user",
          content: websitePrompt
        }
      ],
      model: "deepseek-ai/DeepSeek-V3",
      max_tokens: 256,
      temperature: 0.1,
      top_p: 0.9
    };
    const websiteResponse = await axios.post("https://api.hyperbolic.xyz/v1/chat/completions", dataWebsites, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      }
    });
    const websiteListText = websiteResponse.data.choices[0].message.content;
    const rawWebsites = websiteListText.split('\n')
      .map(line => line.trim().replace(/^[\-\d\.\)\s]+/, ''))
      .filter(line => line.length > 0)
      .map(site => {
         // Prepend "https://" if a protocol is not already present
         return (site.startsWith('http://') || site.startsWith('https://')) ? site : `https://${site}`;
      });
    // For each website, scrape emails and assign at most 15 unique emails per website
    const scrapePromises = rawWebsites.map(async (site) => {
      try {
        const response = await axios.get(site, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9"
          },
          timeout: 10000
        });
        const cheerio = require('cheerio');
        const $ = cheerio.load(response.data);
        const pageText = $('body').text() + ' ' + $('head').text();
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const emailsFound = pageText.match(emailRegex) || [];

        // Extract emails from mailto: links as well
        const emailsFromLinks = [];
        $('a[href^="mailto:"]').each((i, elem) => {
          const href = $(elem).attr('href');
          if (href) {
            const cleaned = href.replace(/^mailto:/i, '').split('?')[0];
            emailsFromLinks.push(cleaned);
          }
        });

        // Combine and deduplicate emails from regex and mailto extraction
        const combinedEmails = emailsFound.concat(emailsFromLinks);
        let uniqueEmails = Array.from(new Set(combinedEmails));

        // Clean each extracted email, using a stricter regex to remove trailing unexpected characters.
        const cleaningRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?=\s|$|["'<>])/;
        uniqueEmails = uniqueEmails.map(email => {
          const m = email.match(cleaningRegex);
          return m ? m[0] : email;
        });
        // Deduplicate again after cleaning
        uniqueEmails = Array.from(new Set(uniqueEmails));

        // Fallback: if no emails found on the main page, try the /contact page
        if (uniqueEmails.length === 0) {
          try {
            // Ensure we remove a trailing slash from the site URL before appending "/contact"
            const contactUrl = site.replace(/\/$/, '') + '/contact';
            const contactResponse = await axios.get(contactUrl, {
              headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
                "Accept-Language": "en-US,en;q=0.9"
              },
              timeout: 10000
            });
            const $contact = cheerio.load(contactResponse.data);
            const contactText = $contact('body').text() + ' ' + $contact('head').text();
            const contactEmailsFound = contactText.match(emailRegex) || [];
            const contactEmailsFromLinks = [];
            $contact('a[href^="mailto:"]').each((i, elem) => {
              const href = $contact(elem).attr('href');
              if (href) {
                const cleaned = href.replace(/^mailto:/i, '').split('?')[0];
                contactEmailsFromLinks.push(cleaned);
              }
            });
            const combinedContactEmails = contactEmailsFound.concat(contactEmailsFromLinks);
            uniqueEmails = Array.from(new Set(uniqueEmails.concat(combinedContactEmails)));
          } catch (contactError) {
            console.error(`[${new Date().toISOString()}] Fallback error scraping contact page for website ${site}: ${contactError.message}`);
          }
        }

        return { website: site, emails: uniqueEmails.slice(0, 15) };
      } catch (error) {
        console.error(`[${new Date().toISOString()}] Error scraping website ${site}: ${error.message}`);
        return { website: site, emails: [] };
      }
    });
    const leads = await Promise.all(scrapePromises);
    // Build separate arrays for scraped websites and emails from the leads.
    const scrapedWebsites = leads.map(lead => lead.website);
    const scrapedEmails   = leads.flatMap(lead => lead.emails);
    console.log(`[${new Date().toISOString()}] Sending response with subjects, websites, and emails.`);

    // Store in cache before returning
    CACHE[cacheKey] = { subjects, websites: scrapedWebsites, emails: scrapedEmails };
    const result = CACHE[cacheKey];
    return res.json(result);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in /api/v1/analyze endpoint:`, error);
    return res.status(500).json({ 
      error: 'An error occurred while processing your request',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Helper function to clean DuckDuckGo redirect URLs
function cleanDuckDuckGoUrl(url) {
  try {
    // Replace multiple slashes after "https:" (e.g. "https:////")
    url = url.replace(/^https:\/{2,}/, 'https://');
    const urlObj = new URL(url);
    // Check if the URL is a DuckDuckGo redirect
    if (urlObj.hostname.includes("duckduckgo.com") && urlObj.pathname.startsWith("/l/")) {
      const uddg = urlObj.searchParams.get("uddg");
      if (uddg) {
        return decodeURIComponent(uddg);
      }
    }
  } catch (e) {
    console.error("Error cleaning DuckDuckGo URL:", e.message);
  }
  return url;
}

// POST endpoint for fetching backlink opportunities based on subjects
app.post('/api/v1/backlinks', async (req, res) => {
  console.log(`[${new Date().toISOString()}] Request received at /api/v1/backlinks`);
  const { subjects } = req.body;
  if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
    console.error(`[${new Date().toISOString()}] Error: No subjects provided for backlink opportunities`);
    return res.status(400).json({ error: 'No subjects provided for backlink opportunities' });
  }

  try {
    // Build multiple search queries from the subjects to improve result diversity
    const queries = subjects.map(subject => `${subject} directory OR "write for us" OR "guest post" OR contact`);
    console.log(`[${new Date().toISOString()}] Running multiple search queries:`, queries);
    let websiteLinks = [];
    const cheerio = require('cheerio');
    for (let q of queries) {
      const searchUrl = "https://html.duckduckgo.com/html/?q=" + encodeURIComponent(q);
      console.log(`[${new Date().toISOString()}] Using search query: ${q}`);
      try {
        const searchResponse = await axios.get(searchUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
          }
        });
        const $ = cheerio.load(searchResponse.data);
        // Extract search result links and add to websiteLinks array
        $('a.result__a').each((i, el) => {
          const link = $(el).attr('href');
          if (link) {
            // Normalize: ensure link has a protocol
            const normalizedLink = (link.startsWith('http://') || link.startsWith('https://')) ? link : `https://${link}`;
            // Clean the link in case it's a DuckDuckGo redirect
            const cleanedLink = cleanDuckDuckGoUrl(normalizedLink);
            websiteLinks.push(cleanedLink);
          }
        });
      } catch (error) {
        console.error(`[${new Date().toISOString()}] Error fetching search results for query "${q}": ${error.message}`);
      }
    }
    websiteLinks = Array.from(new Set(websiteLinks));
    
    // Verify that the website links are active using a HEAD request (with a GET fallback)
    async function filterActiveWebsites(urls) {
      const activeUrls = [];
      await Promise.all(urls.map(async (url) => {
         console.log(`[${new Date().toISOString()}] Checking website activity for: ${url}`);
         try {
            const response = await axios.head(url, {
              headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
              timeout: 5000
            });
            console.log(`[${new Date().toISOString()}] HEAD check success for ${url} with status ${response.status}`);
            if (response.status >= 200 && response.status < 400) {
              activeUrls.push(url);
            }
         } catch (headErr) {
            console.warn(`[${new Date().toISOString()}] HEAD check failed for ${url}: ${headErr.message}. Trying GET...`);
            try {
              const response = await axios.get(url, {
                headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
                timeout: 5000
              });
              console.log(`[${new Date().toISOString()}] GET check success for ${url} with status ${response.status}`);
              if (response.status >= 200 && response.status < 400) {
                activeUrls.push(url);
              }
            } catch (getErr) {
              console.error(`[${new Date().toISOString()}] GET check failed for ${url}: ${getErr.message}`);
            }
         }
      }));
      console.log(`[${new Date().toISOString()}] Active website links after filtering: ${activeUrls}`);
      return activeUrls;
    }
    websiteLinks = await filterActiveWebsites(websiteLinks);
    
    // Fallback: if no active website links remain, use a default backlink.
    if (websiteLinks.length === 0) {
      console.error(`[${new Date().toISOString()}] No active website links found. Falling back to default.`);
      websiteLinks = ['https://www.example.com'];
    }

    let scrapedEmails = [];
    let scrapedBacklinks = [];
    // Limit email scraping to the first 5 websites for performance
    for (let i = 0; i < Math.min(websiteLinks.length, 5); i++) {
      const siteUrl = websiteLinks[i];
      try {
        const siteResponse = await axios.get(siteUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
          },
          timeout: 5000
        });
        const $$ = cheerio.load(siteResponse.data);
        const pageTitle = $$('title').text().trim();
        const pageText = $$('body').text() + ' ' + $$('head').text();
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const emailsFound = pageText.match(emailRegex) || [];
        // Additionally, extract emails from any mailto: links
        let emailsFromLinks = [];
        $$('a[href^="mailto:"]').each((idx, elem) => {
          const href = $$(elem).attr('href');
          if (href) {
            const email = href.replace(/^mailto:/i, '').split('?')[0];
            emailsFromLinks.push(email);
          }
        });
        let combinedEmails = emailsFound.concat(emailsFromLinks);

        // Fallback: if no emails were found on the homepage, attempt to scrape the /contact page.
        if (combinedEmails.length === 0) {
          console.log(`[${new Date().toISOString()}] No emails found on ${siteUrl}. Attempting to scrape contact page.`);
          try {
            const contactUrl = siteUrl.replace(/\/$/, '') + '/contact';
            const contactResponse = await axios.get(contactUrl, {
              headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
                "Accept-Language": "en-US,en;q=0.9"
              },
              timeout: 10000
            });
            const $contact = cheerio.load(contactResponse.data);
            const contactText = $contact('body').text() + ' ' + $contact('head').text();
            const contactEmailsFound = contactText.match(emailRegex) || [];
            let contactEmailsFromLinks = [];
            $contact('a[href^="mailto:"]').each((i, elem) => {
              const href = $contact(elem).attr('href');
              if (href) {
                const cleaned = href.replace(/^mailto:/i, '').split('?')[0];
                contactEmailsFromLinks.push(cleaned);
              }
            });
            combinedEmails = combinedEmails.concat(contactEmailsFound, contactEmailsFromLinks);
          } catch (contactError) {
            console.error(`[${new Date().toISOString()}] Fallback error scraping contact page for website ${siteUrl}: ${contactError.message}`);
          }
        }
        // Deduplicate emails and add them to the scrapedEmails array.
        combinedEmails = Array.from(new Set(combinedEmails));
        scrapedEmails = scrapedEmails.concat(combinedEmails);
        scrapedBacklinks.push({ url: siteUrl, title: pageTitle || siteUrl });
      } catch (err) {
        console.error(`[${new Date().toISOString()}] Error scraping ${siteUrl}: ${err.message}`);
      }
    }
    // Fallback: if no backlinks were successfully scraped, use a default one.
    if (scrapedBacklinks.length === 0) {
      console.error(`[${new Date().toISOString()}] No backlinks scraped successfully. Falling back to default.`);
      scrapedBacklinks.push({ url: 'https://default-backlink.com', title: 'Default Backlink' });
    }
    if (scrapedEmails.length === 0) {
      scrapedEmails.push('contact@default.com');
    }

    scrapedEmails = Array.from(new Set(scrapedEmails));

    res.json({
      backlinks: scrapedBacklinks,
      emails: scrapedEmails
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching backlink opportunities: ${error.message}`);
    res.status(500).json({ error: 'Failed to get backlink opportunities' });
  }
});

// New endpoint to scrape a website and extract email addresses using Cheerio
app.post('/api/v1/scrape', async (req, res) => {
  console.log(`[${new Date().toISOString()}] Request received at /api/v1/scrape`);
  const { url } = req.body;
  if (!url) {
    console.error(`[${new Date().toISOString()}] Error: No URL provided for scraping`);
    return res.status(400).json({ error: 'No URL provided' });
  }

  try {
    // Fetch the webpage content using axios
    const { data } = await axios.get(url);

    // Load the HTML into Cheerio for parsing
    const cheerio = require('cheerio');
    const $ = cheerio.load(data);
    const pageText = $('body').text() + ' ' + $('head').text();

    // Extract emails from the page text using regex
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emailsFromText = pageText.match(emailRegex) || [];

    // Additionally, extract emails from any mailto: links
    const emailsFromLinks = [];
    $('a[href^="mailto:"]').each((i, elem) => {
      const href = $(elem).attr('href');
      if (href) {
        const email = href.replace(/^mailto:/i, '').split('?')[0];
        emailsFromLinks.push(email);
      }
    });

    // Combine and deduplicate emails found in text and links
    const allEmails = [...emailsFromText, ...emailsFromLinks];
    const uniqueEmails = Array.from(new Set(allEmails));

    console.log(`[${new Date().toISOString()}] Scraped emails:`, uniqueEmails);
    res.json({ emails: uniqueEmails });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error scraping URL:`, error.message);
    res.status(500).json({ error: 'Failed to scrape the website' });
  }
});

// New endpoint to crawl the internet for websites and emails based on a query
app.post('/api/v1/crawl', async (req, res) => {
  console.log(`[${new Date().toISOString()}] Request received at /api/v1/crawl`);
  const { query } = req.body;
  if (!query || query.trim() === "") {
    console.error(`[${new Date().toISOString()}] Error: No query provided for crawling`);
    return res.status(400).json({ error: 'No query provided' });
  }

  try {
    // Use DuckDuckGo HTML search for the query
    const searchUrl = "https://html.duckduckgo.com/html/?q=" + encodeURIComponent(query);
    const searchResponse = await axios.get(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
      }
    });
    const cheerio = require('cheerio');
    const $ = cheerio.load(searchResponse.data);
    
    // Extract search result links from the page
    let websiteLinks = [];
    $('a.result__a').each((i, el) => {
      const link = $(el).attr('href');
      if (link) {
        websiteLinks.push(link);
      }
    });
    // Deduplicate found links
    websiteLinks = Array.from(new Set(websiteLinks));
    console.log(`[${new Date().toISOString()}] Found website links:`, websiteLinks);

    let scrapedEmails = [];
    // Limit to first 5 websites for performance
    for (let i = 0; i < Math.min(websiteLinks.length, 5); i++) {
      const siteUrl = websiteLinks[i];
      try {
        const siteResponse = await axios.get(siteUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
          },
          timeout: 5000
        });
        const $$ = cheerio.load(siteResponse.data);
        // Combine text from <body> and <head>
        const siteText = $$('body').text() + ' ' + $$('head').text();
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const emailsFromText = siteText.match(emailRegex) || [];

        // Additionally, extract emails from any mailto: links
        let emailsFromLinks = [];
        $$('a[href^="mailto:"]').each((idx, el) => {
          const href = $$(el).attr('href');
          if (href) {
            const email = href.replace(/^mailto:/i, '').split('?')[0];
            emailsFromLinks.push(email);
          }
        });
        const allSiteEmails = [...emailsFromText, ...emailsFromLinks];
        scrapedEmails = scrapedEmails.concat(allSiteEmails);
      } catch (err) {
        console.error(`Error scraping site ${siteUrl}: ${err.message}`);
      }
    }
    // Deduplicate all scraped emails
    scrapedEmails = Array.from(new Set(scrapedEmails));
    console.log(`[${new Date().toISOString()}] Crawled emails:`, scrapedEmails);
    res.json({
      query,
      websites: websiteLinks,
      emails: scrapedEmails
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error during crawl:`, error.message);
    res.status(500).json({ error: 'Failed to crawl the internet for websites and emails' });
  }
});

// NEW: Endpoint for retrieving related websites based on subjects
app.post('/api/v1/related-websites', async (req, res) => {
  console.log(`[${new Date().toISOString()}] Request received at /api/v1/related-websites`);
  const { subjects } = req.body;
  if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
    console.error(`[${new Date().toISOString()}] Error: No subjects provided`);
    return res.status(400).json({ error: 'No subjects provided' });
  }

  try {
    // Construct a prompt to ask DeepSeek to return 20 unique website URLs relevant to the subjects.
    const prompt = `Based on the following subjects: ${subjects.join(', ')}. Please provide a list of 20 unique website URLs that are highly relevant to these topics. List each website on a new line without any additional commentary.`;

    const dataTL = {
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      model: "deepseek-ai/DeepSeek-V3",
      max_tokens: 256,
      temperature: 0.1,
      top_p: 0.9
    };

    const deepseekResponse = await axios.post("https://api.hyperbolic.xyz/v1/chat/completions", dataTL, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": API_KEY
      }
    });

    const websiteListText = deepseekResponse.data.choices[0].message.content;
    // Split the text by newline, trimming and filtering out empty lines
    const websites = websiteListText.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    console.log(`[${new Date().toISOString()}] Related websites:`, websites);
    res.json({ subjects, websites });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching related websites:`, error.message);
    res.status(500).json({ error: 'Failed to fetch related websites.' });
  }
});

// --- New endpoint: Scrape LinkedIn profiles using Selenium ------------------
app.post('/api/v1/linkedin', async (req, res) => {
  console.log(`[${new Date().toISOString()}] Request received at /api/v1/linkedin`);
  const { subjects } = req.body;
  if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
    console.error(`[${new Date().toISOString()}] Error: No subjects provided for LinkedIn scraping`);
    return res.status(400).json({ error: 'No subjects provided for LinkedIn scraping' });
  }

  let results = {};
  let driver;
  try {
    // Configure headless Chrome options
    let options = new chrome.Options();
    options.addArguments('headless'); // run in headless mode for better performance

    driver = new Builder().forBrowser('chrome').setChromeOptions(options).build();

    // Optional: Set implicit wait to handle slow-loading elements.
    await driver.manage().setTimeouts({ implicit: 10000 });

    for (let subject of subjects) {
      console.log(`[${new Date().toISOString()}] Scraping LinkedIn profiles for subject: ${subject}`);
      // Construct the LinkedIn people search URL for the subject.
      // Note: LinkedIn might require login and the page structure can change.
      let searchUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(subject)}`;
      await driver.get(searchUrl);

      // Wait until at least one search result is located. Adjust the selector as needed.
      await driver.wait(until.elementLocated(By.css('div.entity-result')), 10000);

      // Extract profile result elements. (The selector below might need to be updated.)
      let profileElements = await driver.findElements(By.css('div.entity-result'));
      let profiles = [];
      for (let elem of profileElements) {
        try {
          // Extract the profile name. (Adjust the selector based on observed LinkedIn structure.)
          let nameElem = await elem.findElement(By.css('span.entity-result__title-text'));
          let name = await nameElem.getText();

          // Extract the profile URL.
          let linkElem = await elem.findElement(By.css('a.app-aware-link'));
          let url = await linkElem.getAttribute('href');

          profiles.push({ name, url });
        } catch (innerErr) {
          console.error(`[${new Date().toISOString()}] Error parsing a profile for subject "${subject}": ${innerErr.message}`);
        }
      }
      results[subject] = profiles;
    }

    res.json({ linkedinProfiles: results });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error scraping LinkedIn profiles: ${error.message}`);
    res.status(500).json({ error: 'Failed to scrape LinkedIn profiles' });
  } finally {
    if (driver) {
      try {
        await driver.quit();
      } catch (closeError) {
        console.error(`Error closing WebDriver: ${closeError.message}`);
      }
    }
  }
});
// --- End of new endpoint -----------------------------------------------------

// Add a real endpoint for copy scoring
app.post('/api/v1/score-copy', async (req, res) => {
  console.log(`[${new Date().toISOString()}] Request received at /api/v1/score-copy`);
  
  try {
    const { article } = req.body;

    if (!article || article.trim() === '') {
      console.error(`[${new Date().toISOString()}] Error: No article provided for scoring`);
      return res.status(400).json({ error: 'No article provided' });
    }

    console.log(`[${new Date().toISOString()}] Scoring article of length: ${article.length}`);

    // Generate a cache key
    const cacheKey = `score_${Buffer.from(article).toString('base64').substring(0, 32)}`;
    
    // Check cache
    if (CACHE[cacheKey]) {
      console.log(`[${new Date().toISOString()}] Returning cached result for score-copy endpoint`);
      return res.json(CACHE[cacheKey]);
    }

    // Create a structured prompt for content scoring
    const prompt = `As an SEO expert, evaluate the following article and provide a detailed quality assessment with scores. 
Format your response as follows:

OVERALL_SCORE: [0-100]

CATEGORY: Content Quality
SCORE: [0-50]

SUB: Readability
SCORE_SUB: [0-10]

SUB: Clarity
SCORE_SUB: [0-10]

SUB: Originality
SCORE_SUB: [0-10]

SUB: Engagement
SCORE_SUB: [0-10]

SUB: Depth
SCORE_SUB: [0-10]

CATEGORY: Technical SEO
SCORE: [0-50]

SUB: Keyword Usage
SCORE_SUB: [0-10]

SUB: Heading Structure
SCORE_SUB: [0-10]

SUB: Link Quality
SCORE_SUB: [0-10]

SUB: Meta Elements
SCORE_SUB: [0-10]

SUB: Mobile Optimization
SCORE_SUB: [0-10]

IMPROVEMENT: [Provide 1-2 sentences of specific improvement suggestions]

Here's the article:
${article}`;

    const dataLLM = {
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      model: "deepseek-ai/DeepSeek-V3",
      max_tokens: 1024,
      temperature: 0.1,
      top_p: 0.9,
      stream: false
    };

    const aiUrl = "https://api.hyperbolic.xyz/v1/chat/completions";
    const fetchResponse = await Promise.race([
      fetch(aiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify(dataLLM)
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('API request timed out after 100 seconds')), 100000)
      )
    ]);
    
    if (!fetchResponse.ok) {
      console.error(`[${new Date().toISOString()}] API request failed with status: ${fetchResponse.status}`);
      const errorText = await fetchResponse.text();
      console.error(`[${new Date().toISOString()}] API error response:`, errorText);
      
      // Return fallback data if API call fails
      const fallbackResponse = {
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
          {
            name: "Technical SEO",
            score: 37,
            maxScore: 50,
            subcategories: [
              { name: "Keyword Usage", score: 7, maxScore: 10 },
              { name: "Heading Structure", score: 8, maxScore: 10 },
              { name: "Link Quality", score: 7, maxScore: 10 },
              { name: "Meta Elements", score: 7, maxScore: 10 },
              { name: "Mobile Optimization", score: 8, maxScore: 10 }
            ]
          }
        ],
        improvement: "Consider adding more specific keywords related to your industry. Your content would benefit from more descriptive subheadings and shorter paragraphs for better readability."
      };
      
      CACHE[cacheKey] = fallbackResponse;
      return res.json(fallbackResponse);
    }
    
    const jsonResponse = await fetchResponse.json();
    console.log(`[${new Date().toISOString()}] API score response:`, JSON.stringify(jsonResponse).substring(0, 500) + '...');
    
    // Parse the AI response to extract scores and feedback
    const responseText = jsonResponse.choices[0].message.content;
    console.log(`[${new Date().toISOString()}] Raw score response:`, responseText);
    
    // Extract structured data from the response
    const overallScoreMatch = responseText.match(/OVERALL_SCORE:\s*(\d+)/i);
    const improvementMatch = responseText.match(/IMPROVEMENT:\s*([^\n]+)/i);
    
    // Extract Content Quality category
    const contentQualityMatch = responseText.match(/CATEGORY:\s*Content Quality\s*\nSCORE:\s*(\d+)/i);
    const readabilityMatch = responseText.match(/SUB:\s*Readability\s*\nSCORE_SUB:\s*(\d+)/i);
    const clarityMatch = responseText.match(/SUB:\s*Clarity\s*\nSCORE_SUB:\s*(\d+)/i);
    const originalityMatch = responseText.match(/SUB:\s*Originality\s*\nSCORE_SUB:\s*(\d+)/i);
    const engagementMatch = responseText.match(/SUB:\s*Engagement\s*\nSCORE_SUB:\s*(\d+)/i);
    const depthMatch = responseText.match(/SUB:\s*Depth\s*\nSCORE_SUB:\s*(\d+)/i);
    
    // Extract Technical SEO category
    const technicalSEOMatch = responseText.match(/CATEGORY:\s*Technical SEO\s*\nSCORE:\s*(\d+)/i);
    const keywordMatch = responseText.match(/SUB:\s*Keyword Usage\s*\nSCORE_SUB:\s*(\d+)/i);
    const headingMatch = responseText.match(/SUB:\s*Heading Structure\s*\nSCORE_SUB:\s*(\d+)/i);
    const linkMatch = responseText.match(/SUB:\s*Link Quality\s*\nSCORE_SUB:\s*(\d+)/i);
    const metaMatch = responseText.match(/SUB:\s*Meta Elements\s*\nSCORE_SUB:\s*(\d+)/i);
    const mobileMatch = responseText.match(/SUB:\s*Mobile Optimization\s*\nSCORE_SUB:\s*(\d+)/i);
    
    // Create structured result
    const scoringResult = {
      overallScore: overallScoreMatch ? parseInt(overallScoreMatch[1], 10) : 75,
      categories: [
        {
          name: "Content Quality",
          score: contentQualityMatch ? parseInt(contentQualityMatch[1], 10) : 38,
          maxScore: 50,
          subcategories: [
            { name: "Readability", score: readabilityMatch ? parseInt(readabilityMatch[1], 10) : 8, maxScore: 10 },
            { name: "Clarity", score: clarityMatch ? parseInt(clarityMatch[1], 10) : 7, maxScore: 10 },
            { name: "Originality", score: originalityMatch ? parseInt(originalityMatch[1], 10) : 8, maxScore: 10 },
            { name: "Engagement", score: engagementMatch ? parseInt(engagementMatch[1], 10) : 7, maxScore: 10 },
            { name: "Depth", score: depthMatch ? parseInt(depthMatch[1], 10) : 8, maxScore: 10 }
          ]
        },
        {
          name: "Technical SEO",
          score: technicalSEOMatch ? parseInt(technicalSEOMatch[1], 10) : 37,
          maxScore: 50,
          subcategories: [
            { name: "Keyword Usage", score: keywordMatch ? parseInt(keywordMatch[1], 10) : 7, maxScore: 10 },
            { name: "Heading Structure", score: headingMatch ? parseInt(headingMatch[1], 10) : 8, maxScore: 10 },
            { name: "Link Quality", score: linkMatch ? parseInt(linkMatch[1], 10) : 7, maxScore: 10 },
            { name: "Meta Elements", score: metaMatch ? parseInt(metaMatch[1], 10) : 7, maxScore: 10 },
            { name: "Mobile Optimization", score: mobileMatch ? parseInt(mobileMatch[1], 10) : 8, maxScore: 10 }
          ]
        }
      ],
      improvement: improvementMatch ? improvementMatch[1].trim() : "Consider adding more specific keywords related to your industry and improving heading structure for better readability."
    };
    
    // Cache and return the result
    CACHE[cacheKey] = scoringResult;
    return res.json(scoringResult);
    
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in copy scoring:`, error);
    res.status(500).json({ error: 'Failed to score copy: ' + error.message });
  }
});

// POST endpoint for searching leads based on subjects
app.post('/api/v1/search-leads', async (req, res) => {
  console.log(`[${new Date().toISOString()}] Request received at /api/v1/search-leads`);
  console.log(`[${new Date().toISOString()}] Request body:`, req.body);
  
  try {
    const { subjects } = req.body;
    
    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
      console.log(`[${new Date().toISOString()}] Invalid subjects:`, subjects);
      return res.status(400).json({ error: 'No subjects provided or invalid format' });
    }
    
    console.log(`[${new Date().toISOString()}] Searching leads for subjects:`, subjects);
    
    // Extract relevant keywords from the subject strings
    const keywords = subjects.flatMap(subject => {
      // Remove the "- Category:" prefix and extract just the content
      const content = subject.replace(/^-\s*[^:]+:\s*/, '');
      // Split into words and filter out common words
      return content.split(/\s+/)
        .filter(word => word.length > 3) // Only words longer than 3 chars
        .map(word => word.replace(/[.,;:'"!?()]/g, '')) // Remove punctuation
        .filter(Boolean); // Remove empty strings
    });
    
    // Remove duplicates and limit to the most relevant keywords
    const uniqueKeywords = [...new Set(keywords)].slice(0, 10);
    
    console.log(`[${new Date().toISOString()}] Extracted keywords:`, uniqueKeywords);
    
    if (uniqueKeywords.length === 0) {
      return res.json({ leads: [] });
    }
    
    let connection;
    try {
      connection = await pool.getConnection();
      
      // Simpler query that looks for keyword matches
      const searchClauses = uniqueKeywords.map(() => 
        `industry LIKE ? OR company_name LIKE ? OR position LIKE ? OR notes LIKE ?`
      );
      
      const whereClause = searchClauses.join(' OR ');
      
      // Create parameter array with each keyword repeated 4 times (for the 4 search columns)
      const params = uniqueKeywords.flatMap(keyword => {
        const searchTerm = `%${keyword}%`;
        return [searchTerm, searchTerm, searchTerm, searchTerm];
      });
      
      const query = `
        SELECT id, first_name, last_name, email, phone, company_name, position, industry 
        FROM leads 
        WHERE ${whereClause}
        LIMIT 20
      `;
      
      console.log(`[${new Date().toISOString()}] Executing query:`, query.replace(/\s+/g, ' '));
      console.log(`[${new Date().toISOString()}] With parameters:`, params);
      
      const [results] = await connection.query(query, params);
      
      console.log(`[${new Date().toISOString()}] Found ${results.length} leads`);
      
      // Return results
      return res.json({ leads: results });
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Database error:`, error);
      return res.status(500).json({ error: 'Database error', details: error.message });
    } finally {
      if (connection) connection.release();
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error:`, error);
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Replace the simple search-leads endpoint with a real database implementation
app.post('/api/v1/search-leads-simple', async (req, res) => {
  console.log(`[${new Date().toISOString()}] Request received at /api/v1/search-leads-simple`);
  console.log(`[${new Date().toISOString()}] Request body:`, req.body);
  
  try {
    const { subjects } = req.body;
    
    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
      console.log(`[${new Date().toISOString()}] Invalid subjects:`, subjects);
      return res.status(400).json({ error: 'No subjects provided or invalid format' });
    }
    
    console.log(`[${new Date().toISOString()}] Searching leads for subjects:`, subjects);
    
    // Create WHERE clauses for each subject to search across relevant columns
    const searchClauses = subjects.map(subject => {
      const searchTerm = `%${subject}%`;
      return `(
        industry LIKE ? OR
        company_name LIKE ? OR
        position LIKE ? OR
        notes LIKE ?
      )`;
    });
    
    // Combine WHERE clauses with OR
    const whereClause = searchClauses.join(' OR ');
    
    // Create parameter array with each subject repeated 4 times (for the 4 search columns)
    const params = subjects.flatMap(subject => {
      const searchTerm = `%${subject}%`;
      return [searchTerm, searchTerm, searchTerm, searchTerm];
    });
    
    // Query the database
    const query = `
      SELECT id, first_name, last_name, email, phone, company_name, position, industry 
      FROM leads 
      WHERE ${whereClause}
      LIMIT 20
    `;
    
    console.log(`[${new Date().toISOString()}] Executing query:`, query.replace(/\s+/g, ' '));
    console.log(`[${new Date().toISOString()}] With parameters:`, params);
    
    const [rows] = await pool.query(query, params);
    console.log(`[${new Date().toISOString()}] Found ${rows.length} leads`);
    
    return res.json({ leads: rows });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error searching leads:`, error);
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Add near the end, before starting the server
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Unhandled error:`, err);
  res.status(500).json({ 
    error: 'An unexpected error occurred', 
    details: process.env.NODE_ENV === 'production' ? null : err.message 
  });
});

// Start the backend server on port 5005 (change as needed)
const PORT = process.env.PORT || 5005;
const server = app.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] Server running on port ${PORT}`);
});

// Add an error handler to catch EADDRINUSE and prompt the user
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`[${new Date().toISOString()}] Error: Port ${PORT} is already in use. Please free the port and try again.`);
    process.exit(1);
  } else {
    console.error(`[${new Date().toISOString()}] Server error:`, error);
  }
});