

// server.js
const express = require('express');
const app = express();
const mariadb = require('mariadb');
const cors = require('cors');
const compression = require('compression');
 
app.use(cors({
  origin: 'https://papaya-puffpuff-cfc312.netlify.app/',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));
app.use(express.json());
app.use(compression());

const pool = mariadb.createPool({
  host: 'railway',
  user: 'root',
  password: 'ZzPuNtDLOqxBEnEyaUfLPfbsmHDYucRk',
  database: 'railway',
  connectionLimit: 5
});

// Existing /api/items endpoint
app.get('/api/items', async (req, res) => {
  try {
    const search = req.query.search || '';
    let query = "SELECT PERSONID, latitude, longitude, FNAME, NAME, LNAME, LIVEPLACE, BIRTHDATE_STR FROM persons_leningrad_cleaned";
    let params = [];

    if (search.trim() !== '') {
      query += " WHERE FNAME LIKE ? OR NAME LIKE ? OR LNAME LIKE ?";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const conn = await pool.getConnection();
    const rows = await conn.query(query, params);
    conn.release();
    res.json(rows);
  } catch (err) {
    console.error("Error in /api/items:", err.stack);
    res.status(500).send(err.toString());
  }
});

// New endpoint to get a single person by PERSONID
app.get('/api/persons/:id', async (req, res) => {
  try {
    const personId = req.params.id;
    const query = `
      SELECT 
        FNAME, 
        NAME, 
        LNAME, 
        BIRTHDATE_STR, 
        BIRTHPLACE, 
        NATION, 
        AWORK, 
        LIVEPLACE, 
        ARESTDATE_STR, 
        SUDDATE_STR, 
        STAT, 
        PRIGOVOR, 
        MORTDATE_STR, 
        REABDATE_STR 
      FROM 
        persons_leningrad_cleaned 
      WHERE 
        PERSONID = ?
      LIMIT 1
    `;
    const conn = await pool.getConnection();
    const rows = await conn.query(query, [personId]);
    conn.release();

    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ error: 'Person not found' });
    }
  } catch (err) {
    console.error("Error in /api/persons/:id:", err.stack);
    res.status(500).send(err.toString());
  }
});

// Start the server
const PORT = process.env.PORT || 3306;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
