import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import cors from 'cors';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
    console.error('Token do github não encontrado em .env');
    process.exit(1);
}

app.get('/', (req, res) => {
    res.send('Servidor Proxy ativo. Use /repos/:username ou /repos/:username/:repo/portfolio');
});

app.get('/users/:username/repos', async (req, res) => {
    const { username } = req.params;
    const url = `https://api.github.com/users/${username}/repos`;

    try {
        const response = await fetch(url, {
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`,
            },
        });

        if (!response.ok) {
            return res.status(response.status).json({ error: 'erro na requisição ao Github' });
        }

        const data = await response.json();
        res.json(data);

    } catch (err) {
        res.status(500).json({ error: 'Erro interno no servidor', details: err.message });
    }

});

app.get('/repos/:username/:repo/portfolio', async (req, res) => {
    const { username, repo } = req.params;
    const url = `https://api.github.com/repos/${username}/${repo}/contents/portfolio.json?ref=master`;

    try {
        const response = await fetch(url, {
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`,
            },
        });

        if (!response.ok) {
            return res.status(response.status).json({ error: 'Arquivo não encontrado ou outro erro' });
        }

        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Erro interno no servidor', details: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`API proxy rodando em http://localhost:${PORT}`);
});