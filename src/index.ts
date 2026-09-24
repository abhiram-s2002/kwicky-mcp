#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const KWICKY_GATEWAY_URL =
  process.env.KWICKY_API_URL ||
  "https://mhyxplkuzgwnoxphjvgt.supabase.co/functions/v1/kwicky-ai-tool";

// Initialize MCP Server
const server = new McpServer({
  name: "kwicky-hyperlocal-mcp",
  version: "1.0.0",
});

// Tool 1: kwicky_find_nearby
server.registerTool(
  "kwicky_find_nearby",
  {
    description:
      "Find real-time nearby verified local merchants, tradespeople (plumbers, electricians, mechanics), fresh farm produce, and neighborhood items within walking or driving distance.",
    inputSchema: z.object({
      query: z
        .string()
        .describe(
          "What the user is searching for, e.g. 'emergency plumber', 'fresh Alphonso mangoes', 'electrician for AC repair'"
        ),
      latitude: z
        .number()
        .optional()
        .describe("User's GPS latitude coordinate."),
      longitude: z
        .number()
        .optional()
        .describe("User's GPS longitude coordinate."),
      location: z
        .string()
        .optional()
        .describe(
          "Neighborhood or city name if GPS is unavailable (e.g. 'Indiranagar, Bangalore' or 'T. Nagar, Chennai')."
        ),
      radius_km: z
        .number()
        .optional()
        .default(5.0)
        .describe("Proximity search radius in kilometers (default 5km)."),
      category: z
        .string()
        .optional()
        .describe("Optional category: services, groceries, food, fashion, digital, vehicles, rental, pets."),
      available_now_only: z
        .boolean()
        .optional()
        .default(true)
        .describe("Only return merchants currently on-duty or items in stock right now."),
      limit: z
        .number()
        .optional()
        .default(5)
        .describe("Maximum results to return (1-10)."),
    }),
  },
  async ({ query, latitude, longitude, location, radius_km, category, available_now_only, limit }: any) => {
    try {
      const response = await fetch(KWICKY_GATEWAY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          latitude,
          longitude,
          location,
          radius_km: radius_km ?? 5.0,
          category,
          available_only: available_now_only ?? true,
          limit: limit ?? 5,
          platform: "claude_mcp",
        }),
      });

      if (!response.ok) {
        return {
          content: [
            {
              type: "text",
              text: `Kwicky AI Gateway returned error status ${response.status}`,
            },
          ],
        };
      }

      const data = await response.json();
      const results = data.results || [];

      if (results.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: data.search_summary || `No active local listings found for "${query}" nearby right now.`,
            },
          ],
        };
      }

      let markdown = `### 📍 Kwicky Hyper-Local Discovery: ${data.search_summary}\n\n`;

      results.forEach((item: any, idx: number) => {
        markdown += `**${idx + 1}. ${item.title}**\n`;
        markdown += `• 🏷️ **Price:** ${item.price_formatted}\n`;
        markdown += `• 📍 **Distance & Area:** ${item.distance_display} • ${item.location_name}\n`;
        markdown += `• 🟢 **Status:** ${item.availability} ${item.is_verified_seller ? "• 🛡️ Verified Seller" : ""}\n`;
        if (item.description) {
          markdown += `• 📝 ${item.description}\n`;
        }
        if (item.contact?.whatsapp_url) {
          markdown += `• 💬 **WhatsApp Direct:** [Chat with Seller](${item.contact.whatsapp_url})\n`;
        }
        if (item.contact?.phone) {
          markdown += `• 📞 **Phone:** ${item.contact.phone}\n`;
        }
        markdown += `• 🔗 [View on Kwicky](${item.kwicky_web_url})\n\n`;
      });

      return {
        content: [{ type: "text", text: markdown }],
      };
    } catch (err: any) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to connect to Kwicky AI Gateway: ${err.message}`,
          },
        ],
      };
    }
  }
);

// Start MCP Server over stdio
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Kwicky Hyper-Local MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error starting MCP Server:", error);
  process.exit(1);
});
