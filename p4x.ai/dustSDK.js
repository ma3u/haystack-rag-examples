import { DustAPI } from "@dust-tt/client";
import { createRequire } from 'module';
const require = createRequire(import.meta.url);


async function fetchAgentConfigurations() {
  try {
    // Remove the console parameter which might be causing issues
    const dustAPI = new DustAPI(
      {
        url: "https://dust.tt",
      },
      {
        workspaceId: "0b534a6130",
        apiKey: "sk-99bb04dbab84196ca5d8b63993b9d6ae",
      }
    );

    console.log("Dust installed version: "+require('@dust-tt/client/package.json').version);
    
    // Add more detailed logging

    const response = await dustAPI.getAgentConfigurations();
    console.log("Raw response received:", JSON.stringify(response, null, 2));
    
    if (!response) {
      throw new Error("Response is undefined");
    }
    
    if (response.isErr()) {
      throw new Error(`API Error: ${response.error.message}`);
    } 
    
    if (!response.value) {
      throw new Error("Response value is undefined");
    }
    
    const agents = response.value.filter((agent) => agent.status === "active");
    console.log("Active agents:", agents);
    return agents;
  } catch (error) {
    // HERE I get the error: Cannot read properties of undefined (reading 'view')
    console.error(`Failed to fetch agent configurations: ${error.message}`);
    console.error(error.stack);
  }
}

// Execute and log the result properly
fetchAgentConfigurations()
  .then(agents => {
    if (agents) {
      console.log(`Successfully retrieved ${agents.length} active agents`);
    }
  })
  .catch(err => {
    console.error("Top level error handler:", err);
  });