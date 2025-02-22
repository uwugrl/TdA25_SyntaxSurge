import { PrismaClient } from "@prisma/client";
import { passwordStrength } from "check-password-strength";

export async function validateAccount(token: string) {
    const prisma = new PrismaClient();
    await prisma.$connect();

    const tokenRecord = await prisma.user.findFirst({
        where: {
            userTokens: {
                some: {
                    token,
                },
            },
        },
    });

    if (!tokenRecord) {
        await prisma.$disconnect();
        return false;
    }

    await prisma.$disconnect();
    return true;
}

export async function validateAdminAccount(token: string) {
    if (!(await validateAccount(token))) return false;

    const client = new PrismaClient();
    await client.$connect();

    const record = await client.user.findFirstOrThrow({
        where: { userTokens: { some: { token } } },
    });

    await client.$disconnect();
    return record.administrator;
}


export async function getAccountFromToken(token: string) {
    const prisma = new PrismaClient();
    await prisma.$connect();

    const userAcc = await prisma.user.findFirst({
        where: {
            userTokens: {
                some: {
                    token,
                },
            },
        },
    });

    if (!userAcc) {
        await prisma.$disconnect();
        return null;
    }

    await prisma.$disconnect();
    return userAcc;
}

export async function getAccountFromID(userId: string) {
    const prisma = new PrismaClient();
    await prisma.$connect();

    const userAcc = await prisma.user.findFirst({
        where: {
            userId: userId
        },
    });

    await prisma.$disconnect();
    return userAcc;
}

export async function getUserList() {
    const client = new PrismaClient();
    await client.$connect();
    const users = await client.user.findMany({});
    await client.$disconnect();
    return users.map((x) => ({
        id: x.userId,
        username: x.username,
        email: x.email,
        elo: x.elo,
        wins: x.wins,
        losses: x.losses,
        draws: x.draws,
        banned: x.banned,
        banReason: x.banReason,
        admin: x.administrator,
    }));
}

export function validateUser(username: string, email: string, password: string, elo: string): true | string {
    if (!username || !email || !password || !elo) return "Parameters are missing";
    if (username.length < 2 || username.length > 16) return "Username must be at least 2 characters and at most 16 characters long";
    if (!email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) return "Invalid e-mail address";
    if (password.length < 4) return "Password must be at least 4 characters long";
    if (passwordStrength(password).value === "Too weak") return "Password check failed.";
    if (isNaN(Number(elo))) return "ELO is not a number";
    return true;
}
