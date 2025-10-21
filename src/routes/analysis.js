const express = require('express');
const router = express.Router();
const analyzerService = require('../services/analyzer');

// Analyze a business
router.post('/:businessId', async (req, res) => {
  try {
    const analysis = await analyzerService.analyzeBusiness(req.params.businessId);
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get analysis results
router.get('/:businessId', async (req, res) => {
  try {
    const analysis = await analyzerService.getAnalysis(req.params.businessId);

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
