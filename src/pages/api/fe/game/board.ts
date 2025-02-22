import { NextApiRequest, NextApiResponse } from "next";
import { getAccountFromToken } from "@/components/backendUtils";
import { PrismaClient } from "@prisma/client";
import { fromDbBoard, fromDbDifficulty } from "@/components/fromDB";
import { evalWinner, getNextSymbol } from "@/components/gameUtils";

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
        include: {board: true}
    });

    const game = games.find((x, i) => {
        if (i + 1 === games.length) return true;
        if (evalWinner(fromDbBoard(x.board)) === "") return true; 
        return false;
    });

    if (!game) {
        return res.status(400).send({
            error: "Not in a game",
        });
    }

    switch (req.method) {
        case 'GET':{
        
            // GET the current game for the user

            const playing = getNextSymbol(fromDbBoard(game.board));
            let currentPlayer = false;
            if (playing === 'X' && player.userId === game.player1ID) {
                currentPlayer = true;
            }
            if (playing === 'O' && player.userId === game.player2ID) {
                currentPlayer = true;
            }

            currentPlayer = currentPlayer && evalWinner(fromDbBoard(game.board)) === '';

            let winner = false;
            if (playing === 'O' && player.userId === game.player1ID) {
                winner = true;
            }
            if (playing === 'X' && player.userId === game.player2ID) {
                winner = true;
            }

            return res.status(200).send({
                gameId: game.id,
                name: game.name,
                createdAt: game.createdAt.toISOString(),
                updatedAt: game.updatedAt.toISOString(),
                board: fromDbBoard(game.board),
                difficulty: fromDbDifficulty(game.difficulty),
                onMove: currentPlayer,
                winner
            });
        }

        case 'POST': {

            const { x, y } = req.body as { x: number, y: number };

            if (typeof x !== "number" || typeof y !== "number") {
                return res.status(400).send({error: 'Invalid parameters'});
            }

            const board = fromDbBoard(game.board);
            const nextPlaying = getNextSymbol(fromDbBoard(game.board));

            if (board[y][x] !== "") return res.status(400).send({error: 'Políčko není prázdné!'});

            if (nextPlaying === "X" && game.player1ID === player.userId) {
                board[y][x] = "X";
            }

            if (nextPlaying === "O" && game.player2ID === player.userId) {
                board[y][x] = "O";
            }

            if ((nextPlaying === "X" && game.player2ID === player.userId) || (nextPlaying === "O" && game.player1ID === player.userId)) {
                return res.status(400).send({error: 'Nejsi na tahu!'});
            }

            board[y][x] = nextPlaying;

            const state = nextPlaying === "X" ? 1 : 2;

            await prisma.game.update({
                where: {
                    id: game.id
                },
                data: {
                    board: {
                        updateMany: {
                            where: {
                                x:y,
                                y:x
                            },
                            data: {
                                state
                            }
                        }
                    }
                }
            });

            return res.status(200).send({status: 'ok'});
        }
    }
}
