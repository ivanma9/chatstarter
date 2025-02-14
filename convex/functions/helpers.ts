import {
	customCtx,
	customMutation,
	customQuery,
} from "convex-helpers/server/customFunctions";
import { mutation, query, QueryCtx } from "../_generated/server";
import { getCurrentUser } from "./user";
import { Doc, Id } from "../_generated/dataModel";

export interface AuthenticatedQueryCtx extends QueryCtx {
	user: Doc<"users">;
}

export const authenticatedQuery = customQuery(
	query,
	customCtx(async (ctx) => {
		const user = await getCurrentUser(ctx);
		if (!user) {
			throw new Error("Unauthorized");
		}
		return { user };
	})
);

export const authenticatedMutation = customMutation(
	mutation,
	customCtx(async (ctx) => {
		const user = await getCurrentUser(ctx);
		if (!user) {
			throw new Error("Unauthorized");
		}
		return { user };
	})
);

export const assertServerMember = async (
	ctx: AuthenticatedQueryCtx,
	serverId: Id<"servers">
) => {
	const serverMember = await ctx.db
		.query("serverMembers")
		.withIndex("by_serverId_userId", (q) =>
			q.eq("serverId", serverId).eq("userId", ctx.user._id)
		)
		.unique();
	if (!serverMember) {
		throw new Error("You are not a member of this server");
	}
};

export const assertChannelMember = async (
	ctx: AuthenticatedQueryCtx,
	dmOrChannelId: Id<"directMessages" | "channels">
) => {
	console.log("assertChannelMember dmOrChannelId", dmOrChannelId);
	const dmOrChannel = await ctx.db.get(dmOrChannelId);
	console.log("assertChannelMember dmOrChannel", dmOrChannel);
	if (!dmOrChannel) {
		throw new Error("DM or channel not found");
	}
	if ("serverId" in dmOrChannel) {
		// this is a channel, so we need to check if theyre a part of the server
		console.log(" assertChannelMember serverId", dmOrChannel.serverId);
		const serverMember = await ctx.db
			.query("serverMembers")
			.withIndex("by_serverId_userId", (q) =>
				q.eq("serverId", dmOrChannel.serverId).eq("userId", ctx.user._id)
			)
			.unique();
		if (!serverMember) {
			throw new Error("You are not a member of this server");
		}
	} else {
		// this is a direct message, so we need to check if theyre a part of the direct message
		const directMessageMember = await ctx.db
			.query("directMessageMembers")
			.withIndex("by_direct_message_user", (q) =>
				q.eq("directMessage", dmOrChannel._id).eq("user", ctx.user._id)
			)
			.unique();
		if (!directMessageMember) {
			throw new Error("You are not a member of this direct message");
		}
	}
};

export const assertServerOwner = async (
	ctx: AuthenticatedQueryCtx,
	serverId: Id<"servers">
) => {
	const server = await ctx.db.get(serverId);
	if (!server) {
		throw new Error("Server not found");
	}
	if (server.ownerId !== ctx.user._id) {
		throw new Error("You are not the owner of this server");
	}
};
