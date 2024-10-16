const puppeteer = require('puppeteer');
const axios = require('axios');

// Replace with your Google PageSpeed Insights API key and website URL
const API_KEY = 'AIzaSyBZS37wba8ZAYim6KOjMr-sNb5gdrZ6zZM';
const WEBSITE_URL = 'https://www.marutisuzukitruevalue.com/';
const TEAMS_WEBHOOK_URL = 'https://prod-05.westus.logic.azure.com:443/workflows/13167b57b66840b99fc8a954bbd04c35/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=oERk_ZOvXfBPXZlU_FZRSy7SXUbtYoMnJl5gEQtpvMo';

async function fetchPageSpeedData() {
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${WEBSITE_URL}&key=${API_KEY}`;
    try {
        const response = await axios.get(apiUrl);
        return response.data;
    } catch (error) {
        console.error('Error fetching PageSpeed data:', error);
    }
}

async function sendToTeams(data) {
    const audits = data.lighthouseResult.audits;

    // Safeguards: Check if the engagement metrics exist before trying to access them
    const fcp = audits['first-contentful-paint'] ? (audits['first-contentful-paint'].displayValue) : 'N/A';
    const lcp = audits['largest-contentful-paint'] ? (audits['largest-contentful-paint'].displayValue) : 'N/A';
    const cls = audits['cumulative-layout-shift'] ? (audits['cumulative-layout-shift'].displayValue) : 'N/A';
    const inp = audits['interaction-to-next-paint'] ? (audits['interaction-to-next-paint'].displayValue) : 'N/A';
    const tbt = audits['total-blocking-time'] ? (audits['total-blocking-time'].displayValue) : 'N/A';

    const tableRows = `
        <tr>
            <th>Metric</th>
            <th>Value</th>
        </tr>
        <tr>
            <td>First Contentful Paint (FCP)</td>
            <td>${fcp}</td>
        </tr>
        <tr>
            <td>Largest Contentful Paint (LCP)</td>
            <td>${lcp}</td>
        </tr>
        <tr>
            <td>Cumulative Layout Shift (CLS)</td>
            <td>${cls}</td>
        </tr>
        <tr>
            <td>Interaction to Next Paint (INP)</td>
            <td>${inp}</td>
        </tr>
        <tr>
            <td>Total Blocking Time (TBT)</td>
            <td>${tbt}</td>
        </tr>
    `;

    const htmlTable = `
        <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse;">
            ${tableRows}
        </table>
    `;

    try {
        const message = {"type": "message",
            "attachments": [{
            "contentType": "text",
            "content": htmlTable
        }]};

        // Send the alert to the Teams channel
        await axios.post(TEAMS_WEBHOOK_URL, message,{
            headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'axios/0.21.1'
            }
        });
        console.log('User Engagement Report sent to Teams successfully.');
    } catch (error) {
        console.error('Error sending user engagement report to Teams:', error);
    }
}

(async () => {
    const pageSpeedData = await fetchPageSpeedData();
    if (pageSpeedData) {
        await sendToTeams(pageSpeedData);
    }
})();
