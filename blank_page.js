const puppeteer = require('puppeteer');
const axios = require('axios');

const teamsWebhookUrl = 'https://prod-05.westus.logic.azure.com:443/workflows/13167b57b66840b99fc8a954bbd04c35/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=oERk_ZOvXfBPXZlU_FZRSy7SXUbtYoMnJl5gEQtpvMo'; // Replace with your Microsoft Teams webhook URL

async function sendTeamsAlert(text) {
    const htmlMessage="<h1 style='color:red'>"+text+"</h1>";
    const message = {"type": "message",
        "attachments": [{
        "contentType": "text",
        "content": htmlMessage
    }]};

    
    try {
        // Send the alert to the Teams channel
        await axios.post(teamsWebhookUrl, message,{
            headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'axios/0.21.1'
            }
        });
        console.log('Teams alert sent successfully!');
    } catch (error) {
        console.error('Error sending Teams alert:', error);
    }
}

async function checkBlankPage(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
        // Set the timeout for the page to load
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 5000 });
        const content = await page.content();

        // Check if the content of the page is essentially blank
        if (!content.trim()) {
            await sendTeamsAlert(`Blank webpage detected after 5 seconds for URL: ${url}`);
        } else {
            console.log('Page loaded successfully with content.');
        }
    } catch (error) {
        console.error('Error checking webpage:', error);
        await sendTeamsAlert(`Blank webpage detected after 5 seconds for URL: ${url}`);
    } finally {
        await browser.close();
    }
}

// URL of the page you want to check
const url = 'http://localhost:3000'; // Replace with your target URL

checkBlankPage(url);
