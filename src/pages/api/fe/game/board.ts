import { NextApiRequest, NextApiResponse } from "next";
import { elo, getAccountFromToken } from "@/components/backendUtils";
import { PrismaClient } from "@prisma/client";
import { fromDbBoard, fromDbDifficulty } from "@/components/fromDB";
import { evalWinner, getNextSymbol, isGameFull } from "@/components/gameUtils";
import moment from "moment";

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

            let p1LeftTime = game.player1Timer;
            let p2LeftTime = game.player2Timer;
            
            if (playing === 'X') {
                p1LeftTime -= moment().diff(game.player1TimerStart, 's');
            }
            if (playing === 'O') {
                p2LeftTime -= moment().diff(game.player2TimerStart, 's');
            }

            if (p1LeftTime < 0) {
                game.explicitWinner = 2;
                await prisma.game.update({
                    where: {
                        id: game.id
                    },
                    data: {
                        explicitWinner: 2
                    }
                });
            }
            
            if (p2LeftTime < 0) {
                game.explicitWinner = 1;
                await prisma.game.update({
                    where: {
                        id: game.id
                    },
                    data: {
                        explicitWinner: 1
                    }
                });
            }

            let winner = false;
            if ((playing === 'O' && player.userId === game.player1ID) || (player.userId === game.player1ID && game.explicitWinner === 1)) {
                winner = true;
            }
            if ((playing === 'X' && player.userId === game.player2ID) || (player.userId === game.player2ID && game.explicitWinner === 2)) {
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
                winner,
                player1: game.player1?.username ?? 'Unknown',
                player2: game.player2?.username ?? 'Unknown',
                p1LeftTime,
                p2LeftTime,
                explicitEnd: p1LeftTime < 0 || p2LeftTime < 0 || game.explicitWinner !== 0
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

                await prisma.game.update({
                    where: {
                        id: game.id
                    },
                    data: {
                        player2TimerStart: moment().toDate(),
                        player1Timer: {
                            decrement: moment().diff(game.player1TimerStart, 'second')
                        }
                    }
                });

                if (evalWinner(board) === "X") {
                    await prisma.user.update({
                        where: { userId: game.player1ID },
                        data: {
                            wins: { increment: 1 }
                        }
                    });
                    await prisma.user.update({
                        where: { userId: game.player2ID },
                        data: {
                            losses: { increment: 1 }
                        }
                    })
                    await elo(game.player1ID, game.player2ID, "w");
                }
            }

            if (nextPlaying === "O" && game.player2ID === player.userId) {
                board[y][x] = "O";

                await prisma.game.update({
                    where: {
                        id: game.id
                    },
                    data: {
                        player1TimerStart: moment().toDate(),
                        player2Timer: {
                            decrement: moment().diff(game.player2TimerStart, 'second')
                        }
                    }
                });

                if (evalWinner(board) === "O") {
                    await prisma.user.update({
                        where: { userId: game.player1ID },
                        data: {
                            losses: { increment: 1 }
                        }
                    });
                    await prisma.user.update({
                        where: { userId: game.player2ID },
                        data: {
                            wins: { increment: 1 }
                        }
                    })
                    await elo(game.player2ID, game.player1ID, 'w');
                }
            }

            if (isGameFull(board)) {
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
            }

            if (game.explicitWinner !== 0) {
                return res.status(400).send({error: 'Tato hra je už dohraná.'});
            }

            if ((nextPlaying === "X" && game.player2ID === player.userId) || (nextPlaying === "O" && game.player1ID === player.userId)) {
                return res.status(400).send({error: 'Nejsi na tahu!'});
            }

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
