const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const app = express();

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

// POST endpoint for analyzing SEO articles using AI for theme extraction
app.post('/api/v1/analyze', async (req, res) => {
  console.log(`[${new Date().toISOString()}] Request received at /api/v1/analyze`);
  console.log(`[${new Date().toISOString()}] Request body:`, req.body);

  const { article } = req.body;

  if (!article || article.trim() === '') {
    console.error(`[${new Date().toISOString()}] Error: No article provided`);
    return res.status(400).json({ error: 'No article provided' });
  }

  console.log(`[${new Date().toISOString()}] Raw article: ${article}`);

  try {
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
    const fetchResponse = await fetch(aiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtZXphaW5tem5AZ21haWwuY29tIiwiaWF0IjoxNzM1NDAwMTA1fQ.gWCenzKcIrmd_3lvSpCPokbP6siW8DnnPH0BVfPAwCo'
      },
      body: JSON.stringify(dataLLM)
    });
    const jsonResponse = await fetchResponse.json();
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
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtZXphaW5tem5AZ21haWwuY29tIiwiaWF0IjoxNzM1NDAwMTA1fQ.gWCenzKcIrmd_3lvSpCPokbP6siW8DnnPH0BVfPAwCo"
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
    res.json({
      subjects,
      websites: scrapedWebsites,
      emails: scrapedEmails
    });
  } catch (error) {
    const detailedError = error.response ? error.response.data : error.message;
    console.error(`[${new Date().toISOString()}] Error calling Hyperbolic API:`, detailedError);
    res.status(500).json({ error: 'Failed to analyze article using AI', details: detailedError });
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

    const deepseekResponse = await axios.post("http://localhost:5001/v1/chat/completions", dataTL, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtZXphaW5tem5AZ21haWwuY29tIiwiaWF0IjoxNzM1NDAwMTA1fQ.gWCenzKcIrmd_3lvSpCPokbP6siW8DnnPH0BVfPAwCo"
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
      await driver.quit();
    }
  }
});
// --- End of new endpoint -----------------------------------------------------

// Start the backend server on port 5001 (change as needed)
const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] Backend server running on port ${PORT}`);
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