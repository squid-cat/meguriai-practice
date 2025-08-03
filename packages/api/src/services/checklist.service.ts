import { PrismaClient } from "@prisma/client";
import { AuthorizationError, NotFoundError } from "../utils/errors";

const prisma = new PrismaClient();

export interface CreateChecklistItemData {
	text: string;
	sortOrder: number;
}

export interface UpdateChecklistItemData {
	text?: string;
	completed?: boolean;
	sortOrder?: number;
}

export class ChecklistService {
	async findChecklistItemById(itemId: string, userId: string) {
		const item = await prisma.checklistItem.findUnique({
			where: { id: itemId },
			include: {
				note: {
					select: {
						userId: true,
					},
				},
			},
		});

		if (!item) {
			throw new NotFoundError("チェックリスト項目が見つかりません");
		}

		if (item.note.userId !== userId) {
			throw new AuthorizationError("このチェックリスト項目にアクセスする権限がありません");
		}

		return item;
	}

	async createChecklistItem(
		noteId: string,
		userId: string,
		data: CreateChecklistItemData,
	) {
		// ノートの存在確認と権限チェック
		const note = await prisma.note.findUnique({
			where: { id: noteId },
			select: { userId: true },
		});

		if (!note) {
			throw new NotFoundError("ノートが見つかりません");
		}

		if (note.userId !== userId) {
			throw new AuthorizationError("このノートにアクセスする権限がありません");
		}

		const item = await prisma.checklistItem.create({
			data: {
				text: data.text,
				sortOrder: data.sortOrder,
				noteId,
			},
		});

		return item;
	}

	async updateChecklistItem(
		itemId: string,
		userId: string,
		data: UpdateChecklistItemData,
	) {
		const existingItem = await this.findChecklistItemById(itemId, userId);

		const item = await prisma.checklistItem.update({
			where: { id: itemId },
			data: {
				...(data.text !== undefined && { text: data.text }),
				...(data.completed !== undefined && { completed: data.completed }),
				...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
			},
		});

		return item;
	}

	async deleteChecklistItem(itemId: string, userId: string) {
		await this.findChecklistItemById(itemId, userId);

		await prisma.checklistItem.delete({
			where: { id: itemId },
		});
	}
}