import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { createConfigurations, createZip } from './configGenerator.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json({ limit: '1mb' }));
app.use(cors());
app.use(morgan('dev'));

// static public
app.use(express.static(path.join(__dirname, 'public')));

app.post('/generate', async (req, res) => {
  try {
    const cfg = createConfigurations(req.body || {});
    const zipBase64 = await createZip(cfg.serverConf, cfg.peers);
    res.json({ ...cfg, zipBase64 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
