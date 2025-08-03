import type { Context } from "hono";
import { SharedService } from "../../services/shared.service";

const sharedService = new SharedService();

export const getSharedNote = async (c: Context) => {
	const shareToken = c.req.param("shareToken");
	const note = await sharedService.findSharedNote(shareToken);

	return c.json({ note });
};