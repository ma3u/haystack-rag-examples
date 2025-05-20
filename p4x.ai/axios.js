const axios = require('axios');

async function fetchAgentConfigurationsDirect() {
  try {
    const response = await axios({
      method: 'GET',
      url: 'https://dust.tt/api/v1/0b534a6130/assistant/agent_configurations',
      headers: {
        'Authorization': `Bearer sk-99bb04dbab84196ca5d8b63993b9d6ae`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch agent configurations: ${error.message}`);
    console.error(error.response?.data || error.stack);
  }
}

fetchAgentConfigurationsDirect()
  .then(agents => {
    if (agents) {
      console.log(`Successfully retrieved ${agents.length} active agents`);
    }
  })
  .catch(err => {
    console.error("Top level error handler:", err);
  });
