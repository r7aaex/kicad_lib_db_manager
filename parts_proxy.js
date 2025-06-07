const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * Simple proxy to Mouser and DigiKey search APIs.
 * Requires environment variables MOUSER_API_KEY and DIGIKEY_CLIENT_ID.
 */

async function searchMouser(query) {
  const apiKey = process.env.MOUSER_API_KEY;
  if (!apiKey) throw new Error('MOUSER_API_KEY not set');
  const url = 'https://api.mouser.com/api/v1/search/keyword';
  const payload = {
    SearchByKeywordRequest: {
      keyword: query,
      records: 1
    }
  };
  const { data } = await axios.post(`${url}?apiKey=${apiKey}`, payload);
  const item = data?.SearchResults?.Parts?.[0];
  if (!item) return null;
  return {
    manufacturer: item.Manufacturer,
    mpn: item.ManufacturerPartNumber,
    description: item.Description,
    price: item.PriceBreaks?.[0]?.Price,
    availability: item.Availability,
    datasheet: item.DataSheetUrl
  };
}

app.get('/searchMouser', async (req, res) => {
  try {
    const result = await searchMouser(req.query.q);
    res.json(result || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`parts-proxy listening on port ${PORT}`);
});
