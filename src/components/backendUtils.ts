import { PrismaClient } from "@prisma/client";

export async function validateAccount(token:string) {
    const prisma = new PrismaClient();
    await prisma.$connect();

    const tokenRecord = await prisma.user.findFirst({
        where: {
            userTokens: {
                some: {
                    token
                }
            }
        }
    });

    if (!tokenRecord) {
        await prisma.$disconnect();
        return false;
    }

    await prisma.$disconnect();
    return true;
}

export async function validateAdminAccount(token:string) {
    if (!await validateAccount(token)) return false;

    const client = new PrismaClient();
    await client.$connect();

    const record = await client.user.findFirstOrThrow({where: {userTokens: {some: {token}}}});

    await client.$disconnect();
    return record.administrator;
}

export async function getUserList() {
    const client = new PrismaClient();
    await client.$connect();
    const users = await client.user.findMany({});
    await client.$disconnect();
    return users.map(x => ({
        id: x.userId,
        username: x.username,
        email: x.email,
        elo: x.elo,
        wins: x.wins,
        losses: x.losses,
        draws: x.draws
    }));
}
