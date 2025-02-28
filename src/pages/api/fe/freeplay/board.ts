import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { fromDbBoard } from "@/components/fromDB";
import { getNextSymbol } from "@/components/gameUtils";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { gameCode } = req.query as { gameCode: string };

    const game = await prisma.freeGame.findFirst({
        where: {
            gameCode
        },
        include: {
            board: true
        }
    });

    if (!game) {
        return res.status(400).send({
            error: "Not in a game",
        });
    }

    const board = fromDbBoard(game.board);

    switch (req.method) {
        case 'GET': {
            // GET the current game for the user
            return res.status(200).send({
                gameId: game.id,
                name: game.name,
                board
            });
        }

        case 'POST': {
            const { x, y } = req.body as { x: number, y: number };

            if (typeof x !== "number" || typeof y !== "number") {
                return res.status(400).send({error: 'Invalid parameters'});
            }

            const nextPlaying = getNextSymbol(fromDbBoard(game.board));

            console.log(board[y][x]);
            if (board[y][x] !== "") return res.status(400).send({error: 'Políčko není prázdné!'});

            const state = nextPlaying === "X" ? 1 : 2;

            console.log('write', state, y, x);
            await prisma.freeGameBoard.updateMany({
                where: {
                    gameId: game.id,
                    x: y,
                    y: x
                },
                data: {
                    state
                }
            });

            board[y][x] = nextPlaying;

            return res.status(200).send({status: 'ok', board});
        }
    }
}
