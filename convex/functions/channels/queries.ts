import { query } from "../../_generated/server";

export const getChannels = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("channels").collect();
  },
});
