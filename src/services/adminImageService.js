import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL;

export const adminImageService = {
  /**
   * Get image URL by key
   * @param {string} key - Image identifier (logo, hero, about, programs, projects, etc)
   */
  getImageByKey: async (key) => {
    const response = await axios.get(`${API_BASE_URL}/admin/images`, {
      params: { key },
      // Penting: Cache di browser untuk reduce flicker
      headers: {
        'Cache-Control': 'max-age=300' // 5 menit cache
      }
    });
    return response.data;
  },

  /**
   * Get multiple images sekaligus (untuk page load optimization)
   * @param {string[]} keys - Array of image keys
   */
  getMultipleImages: async (keys) => {
    const response = await axios.post(`${API_BASE_URL}/admin/images/batch`, {
      keys
    });
    return response.data;
  }
};