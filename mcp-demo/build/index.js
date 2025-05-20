"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const zod_1 = require("zod");
// Create an MCP server
const server = new mcp_js_1.McpServer({
    name: "Demo Server from Mabu",
    version: "1.0.0",
    capabilities: {
        tools: {
            listTools: true,
            callTool: true
        },
        resources: {
            listResources: true,
            readResource: true
        },
        prompts: {
            listPrompts: true,
            getPrompt: true
        }
    }
});
// Add an addition tool
server.tool("add", { a: zod_1.z.number(), b: zod_1.z.number() }, async ({ a, b }) => ({
    content: [{ type: "text", text: String(a + b) }]
}));
// Add a poem prompt
server.tool("create-poem", { topic: zod_1.z.string().describe("Topic for the poem") }, async ({ topic }) => ({
    content: [{
            type: "text",
            text: `Here's a poem about ${topic}:\n\nGentle ${topic} sways,\nWhispering ancient secrets,\nNature's pure beauty.`
        }]
}));
// Add a dynamic greeting resource
server.resource("greeting", new mcp_js_1.ResourceTemplate("greeting://{name}", { list: undefined }), async (uri, { name }) => ({
    contents: [{
            uri: uri.href,
            text: `Hello, ${name}!`
        }]
}));
// Start receiving messages on stdin and sending messages on stdout
const transport = new stdio_js_1.StdioServerTransport();
// Wrap in an async function to handle top-level await
async function startServer() {
    try {
        await server.connect(transport);
        console.error('Server ready for MCP connections');
    }
    catch (error) {
        console.error('Failed to start server:', error);
    }
}
// Start the server
startServer();
//# sourceMappingURL=index.js.map