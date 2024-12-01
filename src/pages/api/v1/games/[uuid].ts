import {fromDbBoard, fromDbDifficulty} from "@/components/fromDB";
import {toDbBoard, toDbDifficulty} from "@/components/toDB";
import {PrismaClient} from "@prisma/client";
import {NextApiRequest, NextApiResponse} from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if (req.method == "GET") {
        if (!req.query.uuid) {
            res.status(400).json({error: "Missing UUID"});
            return;
        }

        const prisma = new PrismaClient();
        const game = await prisma.game.findUnique({
            where: {
                id: req.query.uuid as string
            }, include: {
                board: true
            }
        });

        // game: {id, x, y, state, gameID}[]

        if (!game) {
            res.status(404).json({error: "Game not found"});
            return;
        }

        const board: ("X" | "O" | "")[][] = fromDbBoard(game.board);
        const difficulty = fromDbDifficulty(game.difficulty);

        await prisma.$disconnect();
        res.status(200).json({
            uuid: game.id,
            name: game.name,
            createdAt: game.createdAt.toISOString(),
            updatedAt: game.updatedAt.toISOString(),
            difficulty: difficulty,
            board: board,
            gameState: 'unknown' // FIXME
        });
    } else if (req.method == "PUT") {
        if (!req.query.uuid) {
            res.status(400).json({error: "Missing UUID"});
            return;
        }

        if (!req.headers["content-type"] || req.headers["content-type"] !== "application/json") {
            res.status(400).json({error: "We only handle application/json"});
            return
        }
        const data = req.body;
        if (!data.name || !data.difficulty || !data.board) {
            res.status(400).json({error: "Missing fields"});
            return;
        }

        let difficulty = toDbDifficulty(data.difficulty);
        if (difficulty == "Invalid value") {
            res.status(400).json({error: `Invalid difficulty ${data.difficulty}`});
            return;
        }

        let board = toDbBoard(data.board);
        if (board == "Semantic error") {
            res.status(400).json({error: "Semantic error"});
            return;
        }

        const prisma = new PrismaClient();
        await prisma.$connect();

        await prisma.game.update({
            where: {
                id: req.query.uuid as string
            }, data: {
                name: data.name, difficulty: difficulty
            }
        });

        for (let i in board) {
            await prisma.gameBoard.updateMany({
                where: {
                    gameId: req.query.uuid as string, x: board[i].x, y: board[i].y
                }, data: {
                    state: board[i].state
                }
            })
        }

        const updResult = await prisma.game.findFirst({
            where:{
                id: req.query.uuid as string
            },
            include: {
                board: true
            }
        })

        if (!updResult) {
            res.status(404).json({error: "Not found"});
            return;
        }

        await prisma.$disconnect();

        if (!updResult) {
            res.status(404).json({error: "Game not found"});
            return;
        }
        res.status(200).json({
            uuid: updResult.id,
            name: updResult.name,
            createdAt: updResult.createdAt.toISOString(),
            updatedAt: updResult.updatedAt.toISOString(),
            difficulty: fromDbDifficulty(updResult.difficulty),
            board: fromDbBoard(updResult.board),
            gameState: 'unknown' // FIXME
        });
    } else if (req.method == "DELETE") {
        if (!req.query.uuid) {
            res.status(400).json({error: "Missing UUID"});
            return;
        }

        const prisma = new PrismaClient();
        await prisma.$connect();

        const game = await prisma.game.findUnique({
            where: {
                id: req.query.uuid as string
            }
        })

        if (!game) {
            res.status(404).json({error: "Game not found"});
            return;
        }

        await prisma.gameBoard.deleteMany({
            where: {
                gameId: req.query.uuid as string
            }
        });
        await prisma.game.delete({
            where: {
                id: req.query.uuid as string
            }
        });

        await prisma.$disconnect();
        res.status(204).end();
    } else {
        res.status(405).json({error: "Method not allowed"});
    }
}
