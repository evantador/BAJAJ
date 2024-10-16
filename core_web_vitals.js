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
    const lighthouseData = data.lighthouseResult.categories;

    // Safeguards: Check if the category exists before trying to access its score
    const performanceScore = lighthouseData.performance ? (lighthouseData.performance.score * 100).toFixed(2) : 'N/A';
    const accessibilityScore = lighthouseData.accessibility ? (lighthouseData.accessibility.score * 100).toFixed(2) : 'N/A';
    const bestPracticesScore = lighthouseData['best-practices'] ? (lighthouseData['best-practices'].score * 100).toFixed(2) : 'N/A';
    const seoScore = lighthouseData.seo ? (lighthouseData.seo.score * 100).toFixed(2) : 'N/A';
    const pwaScore = lighthouseData.pwa && lighthouseData.pwa.score !== null ? (lighthouseData.pwa.score * 100).toFixed(2) : 'N/A';

    const tableRows = `
        <tr>
            <th>Category</th>
            <th>Score</th>
        </tr>
        <tr>
            <td>Performance</td>
            <td>${(performanceScore * 100).toFixed(2)}</td>
        </tr>
        <tr>
            <td>Accessibility</td>
            <td>${(accessibilityScore * 100).toFixed(2)}</td>
        </tr>
        <tr>
            <td>Best Practices</td>
            <td>${(bestPracticesScore * 100).toFixed(2)}</td>
        </tr>
        <tr>
            <td>SEO</td>
            <td>${(seoScore * 100).toFixed(2)}</td>
        </tr>
        <tr>
            <td>PWA</td>
            <td>${(pwaScore * 100 )}</td>
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
        console.log('Report sent to Teams successfully.');
    } catch (error) {
        console.error('Error sending report to Teams:', error);
    }
}

(async () => {
    const pageSpeedData = await fetchPageSpeedData();
    if (pageSpeedData) {
        await sendToTeams(pageSpeedData);
    }
})();
