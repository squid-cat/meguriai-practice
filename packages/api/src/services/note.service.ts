import { NoteStatus, PrismaClient } from "@prisma/client";
import { v4 as uuid } from "uuid";
import {
	AuthorizationError,
	BusinessRuleError,
	NotFoundError,
} from "../utils/errors";

const prisma = new PrismaClient();

export interface CreateNoteData {
	title: string;
	destination: string;
	departureDate: Date;
	returnDate: Date;
	description?: string;
	checklistItems?: Array<{
		text: string;
		sortOrder: number;
	}>;
	emergencyContacts?: Array<{
		name: string;
		relationship: string;
		phone?: string;
		email?: string;
		sortOrder: number;
	}>;
	requests?: Array<{
		person: string;
		request: string;
		priority: "high" | "medium" | "low";
		sortOrder: number;
	}>;
}

export interface UpdateNoteData extends Partial<CreateNoteData> {}

export interface NoteListQuery {
	status?: NoteStatus;
	page?: number;
	limit?: number;
	sort?: "created_at_desc" | "created_at_asc" | "departure_date_desc" | "departure_date_asc";
}

export class NoteService {
	async findNotesByUserId(userId: string, query: NoteListQuery = {}) {
		const {
			status,
			page = 1,
			limit = 10,
			sort = "created_at_desc",
		} = query;

		const where = {
			userId,
			...(status && { status }),
		};

		const orderBy = this.getOrderBy(sort);

		const skip = (page - 1) * limit;
		const take = Math.min(limit, 50);

		const [notes, total] = await Promise.all([
			prisma.note.findMany({
				where,
				include: {
					checklistItems: {
						select: {
							id: true,
							completed: true,
						},
					},
					_count: {
						select: {
							checklistItems: true,
						},
					},
				},
				orderBy,
				skip,
				take,
			}),
			prisma.note.count({ where }),
		]);

		const notesWithProgress = notes.map((note) => ({
			...note,
			checklistProgress: {
				completed: note.checklistItems.filter(item => item.completed).length,
				total: note._count.checklistItems,
				percentage: note._count.checklistItems > 0 
					? Math.round((note.checklistItems.filter(item => item.completed).length / note._count.checklistItems) * 100)
					: 0,
			},
			checklistItems: undefined,
			_count: undefined,
		}));

		return {
			notes: notesWithProgress,
			pagination: {
				page,
				limit: take,
				total,
				totalPages: Math.ceil(total / take),
			},
		};
	}

	async findNoteById(noteId: string, userId: string) {
		const note = await prisma.note.findUnique({
			where: { id: noteId },
			include: {
				checklistItems: {
					orderBy: { sortOrder: "asc" },
				},
				emergencyContacts: {
					orderBy: { sortOrder: "asc" },
				},
				requests: {
					orderBy: { sortOrder: "asc" },
				},
				reflection: true,
			},
		});

		if (!note) {
			throw new NotFoundError("ノートが見つかりません");
		}

		if (note.userId !== userId) {
			throw new AuthorizationError("このノートにアクセスする権限がありません");
		}

		return note;
	}

	async createNote(userId: string, data: CreateNoteData) {
		// バリデーション
		this.validateNoteDates(data.departureDate, data.returnDate);

		return await prisma.$transaction(async (tx) => {
			const note = await tx.note.create({
				data: {
					title: data.title,
					destination: data.destination,
					departureDate: data.departureDate,
					returnDate: data.returnDate,
					description: data.description,
					userId,
				},
			});

			// チェックリスト項目を作成
			if (data.checklistItems && data.checklistItems.length > 0) {
				await tx.checklistItem.createMany({
					data: data.checklistItems.map((item) => ({
						...item,
						noteId: note.id,
					})),
				});
			}

			// 緊急連絡先を作成
			if (data.emergencyContacts && data.emergencyContacts.length > 0) {
				await tx.emergencyContact.createMany({
					data: data.emergencyContacts.map((contact) => ({
						...contact,
						noteId: note.id,
					})),
				});
			}

			// お願いメモを作成
			if (data.requests && data.requests.length > 0) {
				await tx.request.createMany({
					data: data.requests.map((request) => ({
						...request,
						noteId: note.id,
					})),
				});
			}

			return note;
		});
	}

	async updateNote(noteId: string, userId: string, data: UpdateNoteData) {
		const existingNote = await this.findNoteById(noteId, userId);

		// バリデーション
		if (data.departureDate && data.returnDate) {
			this.validateNoteDates(data.departureDate, data.returnDate);
		} else if (data.departureDate && existingNote.returnDate) {
			this.validateNoteDates(data.departureDate, existingNote.returnDate);
		} else if (data.returnDate && existingNote.departureDate) {
			this.validateNoteDates(existingNote.departureDate, data.returnDate);
		}

		return await prisma.note.update({
			where: { id: noteId },
			data: {
				...(data.title && { title: data.title }),
				...(data.destination && { destination: data.destination }),
				...(data.departureDate && { departureDate: data.departureDate }),
				...(data.returnDate && { returnDate: data.returnDate }),
				...(data.description !== undefined && { description: data.description }),
			},
			include: {
				checklistItems: {
					orderBy: { sortOrder: "asc" },
				},
				emergencyContacts: {
					orderBy: { sortOrder: "asc" },
				},
				requests: {
					orderBy: { sortOrder: "asc" },
				},
				reflection: true,
			},
		});
	}

	async deleteNote(noteId: string, userId: string) {
		const note = await this.findNoteById(noteId, userId);

		if (note.status === "active") {
			throw new BusinessRuleError(
				"アクティブ状態のノートは削除前に確認が必要です",
			);
		}

		await prisma.note.delete({
			where: { id: noteId },
		});
	}

	async updateNoteStatus(noteId: string, userId: string, status: NoteStatus) {
		await this.findNoteById(noteId, userId);

		return await prisma.note.update({
			where: { id: noteId },
			data: { status },
		});
	}

	async generateShareToken(noteId: string, userId: string) {
		await this.findNoteById(noteId, userId);

		const shareToken = uuid();

		const note = await prisma.note.update({
			where: { id: noteId },
			data: {
				isShared: true,
				shareToken,
			},
		});

		return {
			shareUrl: `https://leavenote.app/shared/${shareToken}`,
			shareToken,
			isShared: true,
		};
	}

	async disableSharing(noteId: string, userId: string) {
		await this.findNoteById(noteId, userId);

		await prisma.note.update({
			where: { id: noteId },
			data: {
				isShared: false,
				shareToken: null,
			},
		});
	}

	private validateNoteDates(departureDate: Date, returnDate: Date) {
		if (departureDate >= returnDate) {
			throw new BusinessRuleError(
				"出発日は帰宅日よりも前である必要があります",
			);
		}
	}

	private getOrderBy(sort: string) {
		switch (sort) {
			case "created_at_asc":
				return { createdAt: "asc" as const };
			case "departure_date_desc":
				return { departureDate: "desc" as const };
			case "departure_date_asc":
				return { departureDate: "asc" as const };
			case "created_at_desc":
			default:
				return { createdAt: "desc" as const };
		}
	}
}