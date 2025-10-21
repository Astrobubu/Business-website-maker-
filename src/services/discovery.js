const axios = require('axios');
const db = require('../database/db');

class DiscoveryService {
  constructor() {
    this.googleApiKey = process.env.GOOGLE_MAPS_API_KEY;
  }

  /**
   * Discover businesses in a specific location
   * @param {Object} options - Search options
   * @param {string} options.location - Location to search (e.g., "New York, NY")
   * @param {number} options.radius - Search radius in miles
   * @param {string} options.industry - Industry type (restaurant, salon, etc.)
   * @param {number} options.limit - Max number of results
   */
  async discoverBusinesses(options) {
    const { location, radius = 5, industry = 'restaurant', limit = 50 } = options;

    try {
      // First, geocode the location
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${this.googleApiKey}`;
      const geocodeResponse = await axios.get(geocodeUrl);

      if (!geocodeResponse.data.results.length) {
        throw new Error('Location not found');
      }

      const { lat, lng } = geocodeResponse.data.results[0].geometry.location;

      // Search for businesses using Places API
      const radiusMeters = radius * 1609.34; // Convert miles to meters
      const searchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radiusMeters}&type=${this.getPlaceType(industry)}&key=${this.googleApiKey}`;

      const searchResponse = await axios.get(searchUrl);
      const businesses = searchResponse.data.results.slice(0, limit);

      // Save businesses to database
      const savedBusinesses = [];
      for (const place of businesses) {
        const business = await this.saveBusiness(place, industry);
        savedBusinesses.push(business);
      }

      return {
        count: savedBusinesses.length,
        businesses: savedBusinesses
      };

    } catch (error) {
      console.error('Discovery error:', error.message);
      throw error;
    }
  }

  /**
   * Get detailed information about a business
   */
  async getBusinessDetails(placeId) {
    try {
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,geometry,opening_hours&key=${this.googleApiKey}`;

      const response = await axios.get(detailsUrl);
      return response.data.result;
    } catch (error) {
      console.error('Error fetching business details:', error.message);
      throw error;
    }
  }

  /**
   * Save business to database
   */
  async saveBusiness(place, industry) {
    try {
      // Check if business already exists
      const existing = await db.get(
        'SELECT * FROM businesses WHERE google_place_id = ?',
        [place.place_id]
      );

      if (existing) {
        return existing;
      }

      // Get detailed information
      const details = await this.getBusinessDetails(place.place_id);

      // Insert new business
      const result = await db.run(
        `INSERT INTO businesses (
          google_place_id, name, industry, address, phone, website_url,
          latitude, longitude, google_rating, google_reviews_count
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          place.place_id,
          place.name,
          industry,
          details.formatted_address || place.vicinity,
          details.formatted_phone_number || null,
          details.website || null,
          place.geometry.location.lat,
          place.geometry.location.lng,
          place.rating || 0,
          place.user_ratings_total || 0
        ]
      );

      return await db.get('SELECT * FROM businesses WHERE id = ?', [result.id]);

    } catch (error) {
      console.error('Error saving business:', error.message);
      throw error;
    }
  }

  /**
   * Map industry to Google Places type
   */
  getPlaceType(industry) {
    const typeMap = {
      'restaurant': 'restaurant',
      'salon': 'beauty_salon',
      'plumber': 'plumber',
      'lawyer': 'lawyer',
      'dentist': 'dentist',
      'doctor': 'doctor',
      'gym': 'gym',
      'cafe': 'cafe',
      'bar': 'bar',
      'bakery': 'bakery'
    };

    return typeMap[industry.toLowerCase()] || 'establishment';
  }

  /**
   * Get all discovered businesses
   */
  async getBusinesses(filters = {}) {
    let query = 'SELECT * FROM businesses WHERE 1=1';
    const params = [];

    if (filters.industry) {
      query += ' AND industry = ?';
      params.push(filters.industry);
    }

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.hasWebsite !== undefined) {
      if (filters.hasWebsite) {
        query += ' AND website_url IS NOT NULL';
      } else {
        query += ' AND website_url IS NULL';
      }
    }

    query += ' ORDER BY discovered_at DESC';

    if (filters.limit) {
      query += ` LIMIT ${parseInt(filters.limit)}`;
    }

    return await db.all(query, params);
  }

  /**
   * Get business by ID
   */
  async getBusinessById(id) {
    return await db.get('SELECT * FROM businesses WHERE id = ?', [id]);
  }
}

module.exports = new DiscoveryService();
