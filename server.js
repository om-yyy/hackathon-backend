// 1. Get all parcels
app.get('/api/parcels', (req, res) => {
  db.all('SELECT * FROM parcels', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const formattedRows = rows.map(row => {
      let parsedCoords = row.coordinates;
      try {
        if (typeof row.coordinates === 'string') {
          parsedCoords = JSON.parse(row.coordinates);
        }
      } catch (e) {
        parsedCoords = [];
      }
      return { ...row, coordinates: parsedCoords };
    });

    // Directly send array [] instead of { parcels: [] }
    res.json(formattedRows);
  });
});