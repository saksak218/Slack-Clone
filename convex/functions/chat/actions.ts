import { v } from "convex/values";
import { action } from "../../_generated/server";

export const generateUploadUrl = action({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
export const unfurlLink = action({
  args: { url: v.string() },
  handler: async (ctx, args) => {
    try {
      const response = await fetch(args.url);
      const html = await response.text();

      const getMeta = (property: string) => {
        const propertyRegex = new RegExp(
          `<meta[^>]*property=["']og:${property}["'][^>]*content=["']([^"']*)["']`,
          "i",
        );
        const propertyMatch = html.match(propertyRegex);
        if (propertyMatch) return propertyMatch[1];

        const nameRegex = new RegExp(
          `<meta[^>]*name=["'](?:og:)?${property}["'][^>]*content=["']([^"']*)["']`,
          "i",
        );
        const nameMatch = html.match(nameRegex);
        if (nameMatch) return nameMatch[1];

        if (property === "title") {
          const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
          if (titleMatch) return titleMatch[1];
        }

        return undefined;
      };

      return {
        url: args.url,
        title: getMeta("title"),
        description: getMeta("description"),
        image: getMeta("image"),
      };
    } catch (error) {
      console.error("Unfurl failed:", error);
      return null;
    }
  },
});
