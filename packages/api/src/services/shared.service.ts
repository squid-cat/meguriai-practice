import { PrismaClient } from "@prisma/client";
import { NotFoundError } from "../utils/errors";

const prisma = new PrismaClient();

export class SharedService {
	async findSharedNote(shareToken: string) {
		const note = await prisma.note.findUnique({
			where: {
				shareToken,
				isShared: true,
			},
			include: {
				user: {
					select: {
						name: true,
					},
				},
				checklistItems: {
					select: {
						text: true,
						completed: true,
					},
					orderBy: { sortOrder: "asc" },
				},
				emergencyContacts: {
					select: {
						name: true,
						relationship: true,
						phone: true,
						email: true,
					},
					orderBy: { sortOrder: "asc" },
				},
				requests: {
					select: {
						person: true,
						request: true,
						priority: true,
					},
					orderBy: { sortOrder: "asc" },
				},
			},
		});

		if (!note) {
			throw new NotFoundError("共有ノートが見つかりません");
		}

		// 共有ページでは機密情報を除外したデータを返す
		return {
			id: note.id,
			title: note.title,
			destination: note.destination,
			departureDate: note.departureDate,
			returnDate: note.returnDate,
			description: note.description,
			status: note.status,
			owner: {
				name: note.user.name,
			},
			checklistItems: note.checklistItems,
			emergencyContacts: note.emergencyContacts,
			requests: note.requests,
		};
	}
}