import { NextApiRequest, NextApiResponse } from "next";
import { getAccountFromToken } from "@/components/backendUtils";
import { PrismaClient } from "@prisma/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { token } = req.cookies;

    if (!token) return res.status(403).send({ error: "Unauthorized" });
    const player = await getAccountFromToken(token);
    if (!player) return res.status(403).send({ error: "Unauthorized" });

    const prisma = new PrismaClient();

    await prisma.$connect();

    if (await prisma.matchmaking.findFirst({ where: { player1ID: player.userId } })) {
        return res.status(200).send({
            status: "searching",
        });
    }

    if (
        await prisma.game.findFirst({
            where: {
                OR: [{ player1ID: player.userId }, { player2ID: player.userId }],
            },
        })
    ) {
        return res.status(200).send({
            status: "playing",
        });
    }

    return res.status(200).send({ status: "idle" });
}
