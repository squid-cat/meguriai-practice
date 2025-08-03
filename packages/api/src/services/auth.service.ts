import { PrismaClient } from "@prisma/client";
import { NotFoundError } from "../utils/errors";

const prisma = new PrismaClient();

export interface CreateUserData {
	firebaseUid: string;
	name: string;
	email: string;
}

export interface UpdateUserProfileData {
	name?: string;
}

export class AuthService {
	async findUserByFirebaseUid(firebaseUid: string) {
		return await prisma.user.findUnique({
			where: { firebaseUid },
			select: {
				id: true,
				firebaseUid: true,
				name: true,
				email: true,
				createdAt: true,
				updatedAt: true,
			},
		});
	}

	async createUser(data: CreateUserData) {
		return await prisma.user.create({
			data: {
				firebaseUid: data.firebaseUid,
				name: data.name,
				email: data.email,
			},
			select: {
				id: true,
				firebaseUid: true,
				name: true,
				email: true,
				createdAt: true,
				updatedAt: true,
			},
		});
	}

	async findOrCreateUser(data: CreateUserData) {
		let user = await this.findUserByFirebaseUid(data.firebaseUid);

		if (!user) {
			user = await this.createUser(data);
		}

		return user;
	}

	async updateUserProfile(userId: string, data: UpdateUserProfileData) {
		const user = await prisma.user.findUnique({
			where: { id: userId },
		});

		if (!user) {
			throw new NotFoundError("ユーザーが見つかりません");
		}

		return await prisma.user.update({
			where: { id: userId },
			data: {
				...(data.name && { name: data.name }),
			},
			select: {
				id: true,
				firebaseUid: true,
				name: true,
				email: true,
				createdAt: true,
				updatedAt: true,
			},
		});
	}
}