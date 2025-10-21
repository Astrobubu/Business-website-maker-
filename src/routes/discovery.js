const express = require('express');
const router = express.Router();
const discoveryService = require('../services/discovery');

// Discover businesses
router.post('/search', async (req, res) => {
  try {
    const { location, radius, industry, limit } = req.body;

    if (!location) {
      return res.status(400).json({ error: 'Location is required' });
    }

    const results = await discoveryService.discoverBusinesses({
      location,
      radius: radius || 5,
      industry: industry || 'restaurant',
      limit: limit || 20
    });

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all businesses
router.get('/businesses', async (req, res) => {
  try {
    const filters = {
      industry: req.query.industry,
      status: req.query.status,
      hasWebsite: req.query.hasWebsite === 'true' ? true : req.query.hasWebsite === 'false' ? false : undefined,
      limit: req.query.limit || 100
    };

    const businesses = await discoveryService.getBusinesses(filters);
    res.json({ count: businesses.length, businesses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get business by ID
router.get('/businesses/:id', async (req, res) => {
  try {
    const business = await discoveryService.getBusinessById(req.params.id);

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    res.json(business);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
