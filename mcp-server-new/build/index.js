import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import demo from "./demo.js";
// Initialize server
const server = new McpServer({
    name: ".",
    version: "1.0.0"
});
// === Start server with stdio transport ===
// Initialize the demo component
demo(server);
const transport = new StdioServerTransport();
await server.connect(transport);
