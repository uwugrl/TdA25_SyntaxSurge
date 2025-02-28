import { NextApiRequest, NextApiResponse } from "next";
import { elo, getAccountFromToken } from "@/components/backendUtils";
import { PrismaClient } from "@prisma/client";
import { fromDbBoard } from "@/components/fromDB";
import { evalWinner, isGameFull } from "@/components/gameUtils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { token } = req.cookies;

    if (!token) return res.status(403).send({ error: "Unauthorized" });
    const player = await getAccountFromToken(token);
    if (!player) return res.status(403).send({ error: "Unauthorized" });

    const prisma = new PrismaClient();

    await prisma.$connect();

    if (await prisma.matchmaking.findFirst({ where: { player1ID: player.userId } })) {
        return res.status(400).send({
            error: "Can't get game during matchmaking",
        });
    }

    const games = await prisma.game.findMany({
        where: {
            OR: [{ player1ID: player.userId }, { player2ID: player.userId }],
        },
        include: {board: true, player1: true, player2: true}
    });

    const game = games.find((x, i) => {
        if (i + 1 === games.length) return true;
        const board = fromDbBoard(x.board);
        if (evalWinner(board) === "" && !isGameFull(board) && x.explicitWinner === 0) return true; 
        return false;
    });

    if (!game) {
        return res.status(400).send({
            error: "Not in a game",
        });
    }

    if (!game.player1ID || !game.player2ID) return res.status(500).send({error: 'Game is invalid.'});

    switch (req.method) {
        case 'POST': {

            const { reqType } = req.body as { reqType: 'suggest' | 'accept' | 'decline' | 'cancel' };

            switch (reqType) {
                case 'suggest':
                    await prisma.game.update({
                        where:{
                            id: game.id
                        },
                        data: {
                            suggestDraw: true
                        }
                    });
                    break;
                case 'accept':
                    await prisma.game.update({
                        where: {
                            id: game.id
                        },
                        data: {
                            suggestDraw: false,
                            explicitWinner: 3
                        }
                    });
                    await prisma.user.update({
                        where: {
                            userId: game.player1ID
                        },
                        data: {
                            draws: { increment: 1 }
                        }
                    });
                    await prisma.user.update({
                        where: {
                            userId: game.player2ID
                        },
                        data: {
                            draws: { increment: 1 }
                        }
                    });
                    await elo(game.player1ID, game.player2ID, 'd');
                    break;
                case 'decline':
                case 'cancel':
                    await prisma.game.update({
                        where: {
                            id: game.id
                        },
                        data: {
                            suggestDraw: false
                        }
                    });
                    break;
    
                default:
                    return res.status(400).send({error: 'Bad reqType'});
            }

            return res.status(200).send({status: 'ok'});
        }
    }
}
