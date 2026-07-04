const axios = require('axios');
const apiConfig = require('./config');

const apiClient = {};

apiClient.getWeather = async () => {
  const response = await axios.get(apiConfig.weatherApi.endpoint, {
    params: {
      q: 'London',
      units: 'metric'
    },
    headers: {
      'x-api-key': apiConfig.weatherApi.apiKey
    }
  });
  return response.data;
};

module.exports = apiClient;