# Kwicky AI Hyper-Local Search MCP Server

Model Context Protocol (MCP) server for **Kwicky AI** — a real-time, proximity-based tool layer connecting AI assistants (ChatGPT, Claude, Gemini, Cursor) directly to local small businesses, tradespeople (plumbers, electricians), fresh rural farmers, and neighborhood product listings.

## Tools Exposed

### `kwicky_find_nearby`
Find real-time verified local businesses, tradespeople, fresh farm produce, and neighborhood inventory within walking or driving distance using GPS coordinates or neighborhood names.

**Parameters:**
- `query` (string, required): Item or service needed (e.g. "emergency plumber", "fresh Alphonso mangoes", "electrician").
- `latitude` (number, optional): User's GPS latitude.
- `longitude` (number, optional): User's GPS longitude.
- `location` (string, optional): Neighborhood or city name (e.g. "Indiranagar, Bangalore", "T. Nagar, Chennai").
- `radius_km` (number, default: 5): Distance radius in kilometers.
- `category` (string, optional): Filter by category (`services`, `groceries`, `food`, etc.).
- `available_now_only` (boolean, default: true): Only return merchants on duty or in stock right now.

## Running Locally

```bash
npm install
npm run build
node dist/index.js
```

## Running with Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "kwicky": {
      "command": "node",
      "args": ["/PATH_TO/packages/kwicky-mcp-server/dist/index.js"],
      "env": {
        "KWICKY_API_URL": "https://mhyxplkuzgwnoxphjvgt.supabase.co/functions/v1/kwicky-ai-tool"
      }
    }
  }
}
```

## License
MIT
