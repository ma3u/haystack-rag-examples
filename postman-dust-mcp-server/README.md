# Postman MCP Generator

Welcome to your generated MCP server! 🚀 This project was created with the [Postman MCP Generator](https://postman.com/explore/mcp-generator), configured to [Model Context Provider (MCP)](https://modelcontextprotocol.io/introduction) Server output mode. It provides you with:

- ✅ An MCP-compatible server (`mcpServer.js`)
- ✅ Automatically generated JavaScript tools for each selected Postman API request

Let's set things up!

## 🚦 Getting Started

### ⚙️ Prerequisites

Before starting, please ensure you have:

- [Node.js (v18+ required, v20+ recommended)](https://nodejs.org/)
- [npm](https://www.npmjs.com/) (included with Node)

Warning: if you run with a lower version of Node, `fetch` won't be present. Tools use `fetch` to make HTTP calls. To work around this, you can modify the tools to use `node-fetch` instead. Make sure that `node-fetch` is installed as a dependency and then import it as `fetch` into each tool file.

### 📥 Installation & Setup

**1. Install dependencies**

Run from your project's root directory:

```sh
npm install
```

### 🔐 Set tool environment variables

This project uses a `.env` file to manage environment-specific variables, such as API keys. To get started:

1. **Create your environment file**: Copy the example environment file to a new file named `.env`:

   ```sh
   cp .env.example .env
   ```

2. **Update API Keys**: Open the newly created `.env` file. You'll see placeholder environment variables for the Dust API:

   ```env
   DUST_API_KEY=
   DUST_WORKSPACE_ID=
   DUST_AGENT_ID=
   ```

   Update these lines with your actual Dust API Key, Workspace ID, and Agent ID. These environment variables are used by the tools to interact with the Dust API. You can inspect the files in the `tools` directory to see how they are used.

```javascript
// environment variables are used inside of each tool file
const apiKey = process.env.DUST_API_KEY;
const workspaceId = process.env.DUST_WORKSPACE_ID;
// etc.
```

**Note:** The generated tools will need to be configured to use these specific environment variables (`DUST_API_KEY`, `DUST_WORKSPACE_ID`, `DUST_AGENT_ID`). If the tools were generated for a different API or expect different environment variable names, you will need to manually update the JavaScript files in the `tools/` directory to use these variables correctly for authentication and API calls.

## 🌐 Test the MCP Server with Postman

The MCP Server (`mcpServer.js`) exposes your automated API tools to MCP-compatible clients, such as Claude Desktop or the Postman Desktop Application. We recommend that you test the server with Postman first and then move on to using it with an LLM.

The Postman Desktop Application is the easiest way to run and test MCP servers. Testing the downloaded server first is optional but recommended.

**Step 1**: Download the latest Postman Desktop Application from [https://www.postman.com/downloads/](https://www.postman.com/downloads/).

**Step 2**: Read out the documentation article [here](https://learning.postman.com/docs/postman-ai-agent-builder/mcp-requests/create/) and see how to create an MCP request inside the Postman app.

**Step 3**: Set the type of the MCP request to `STDIO` and set the command to `node </absolute/path/to/mcpServer.js>`. If you have issues with using only `node` (e.g. an old version is used), supply an absolute path instead to a node version 18+. You can get the full path to node by running:

```sh
which node
```

To check the node version, run:

```sh
node --version
```

To get the absolute path to `mcpServer.js`, run:

```sh
realpath mcpServer.js
```

Use the node command followed by the full path to `mcpServer.js` as the command for your new Postman MCP Request. Then click the **Connect** button. You should see a list of tools that you selected before generating the server. You can test that each tool works here before connecting the MCP server to an LLM.

## 👩‍💻 Connect the MCP Server to Claude

You can connect your MCP server to any MCP client. Here we provide instructions for connecting it to Claude Desktop.

**Step 1**: Note the full path to node and the `mcpServer.js` from the previous step.

**Step 2**. Open Claude Desktop → **Settings** → **Developers** → **Edit Config** and add a new MCP server:

```json
{
  "mcpServers": {
    "<server_name>": {
      "command": "<absolute/path/to/node>",
      "args": ["<absolute/path/to/mcpServer.js>"]
    }
  }
}
```

Restart Claude Desktop to activate this change. Make sure the new MCP is turned on and has a green circle next to it. If so, you're ready to begin a chat session that can use the tools you've connected.

**Warning**: If you don't supply an absolute path to a `node` version that is v18+, Claude (and other MCP clients) may fall back to another `node` version on the system of a previous version. In this case, the `fetch` API won't be present and tool calls will not work. If that happens, you can a) install a newer version of node and point to it in the command, or b) import `node-fetch` into each tool as `fetch`, making sure to also add the `node-fetch` dependency to your package.json.

### Additional Options

#### 🐳 Docker Deployment (Production)

For production deployments, you can use Docker:

**1. Build Docker image**

```sh
docker build -t <your_server_name> .
```

**2. Claude Desktop Integration**

Add Docker server configuration to Claude Desktop (Settings → Developers → Edit Config):

```json
{
  "mcpServers": {
    "<your_server_name>": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "--env-file=.env", "<your_server_name>"]
    }
  }
}
```

> Add your environment variables (API keys, etc.) inside the `.env` file.

The project comes bundled with the following minimal Docker setup:

```dockerfile
FROM node:22.12-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

COPY . .

ENTRYPOINT ["node", "mcpServer.js"]
```

#### 🌐 Server-Sent Events (SSE)

To run the server with Server-Sent Events (SSE) support, use the `--sse` flag:

```sh
node mcpServer.js --sse
```

## 🛠️ Additional CLI commands

#### List tools

List descriptions and parameters from all generated tools with:

```sh
node index.js tools
```

Example:

```
Available Tools:

Workspace: acme-workspace
  Collection: useful-api
    list_all_customers
      Description: Retrieve a list of useful things.
      Parameters:
        - magic: The required magic power
        - limit: Number of results returned
        [...additional parameters...]
```

## ➕ Adding New Tools

Extend your MCP server with more tools easily:

1. Visit [Postman MCP Generator](https://postman.com/explore/mcp-generator).
2. Pick new API request(s), generate a new MCP server, and download it.
3. Copy new generated tool(s) into your existing project's `tools/` folder.
4. Update your `tools/paths.js` file to include new tool references.

## 💬 Questions & Support

Visit the [Postman MCP Generator](https://postman.com/explore/mcp-generator) page for updates and new capabilities.

Join the `#mcp-lab` channel in the [Postman Discord](https://discord.gg/HQJWM8YF) to share what you've built and get help.
