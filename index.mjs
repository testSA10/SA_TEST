import express from 'express';
import fetch from 'node-fetch';
import axios from 'axios';

const app = express();
const port = 3000;

// Middleware to enable CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    next();
});

// API endpoint to fetch news headlines from BBC and perform sentiment analysis
app.get('/news', async (req, res) => {
    try {
        const apiKey = '8299ddae71074acd8232edcfef9b7fb8';
        const response = await fetch(`https://newsapi.org/v1/articles?source=bbc-news&sortBy=top&apiKey=${apiKey}`);
        const data = await response.json();

        if (data.status === 'ok') {
            const articles = data.articles;
            const newsHeadlines = await Promise.all(articles.map(async article => {
                const title = article.title;
                const link = article.url;
                const sentiment = await getSentiment(title);
                return { title, link, sentiment };
            }));
            res.json(newsHeadlines);
        } else {
            throw new Error('Failed to fetch news headlines from BBC');
        }
    } catch (error) {
        console.error('Error fetching news headlines:', error);
        res.status(500).json({ error: 'Failed to fetch news headlines' });
    }
});

// Function to perform sentiment analysis
async function getSentiment(title) {
    try {
        const sentimentAPI = 'https://c6a7zwwwyj.execute-api.us-east-1.amazonaws.com/devv';
        const response = await axios.post(sentimentAPI, { text: title });
        const sentiment = response.data.sentiment;
        return sentiment;
    } catch (error) {
        console.error('Error fetching sentiment:', error);
        return 'N/A';
    }
}

app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
});

