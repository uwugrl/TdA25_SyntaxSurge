import {PrismaClient} from "@prisma/client";
import {NextApiRequest, NextApiResponse} from "next";
import {v4 as uuidv4} from "uuid";
import {fromDbBoard, fromDbDifficulty} from "@/components/fromDB";
import {toDbBoard, toDbDifficulty} from "@/components/toDB";
import {checkCorrectGameSize, checkCorrectStartingPlayer, determineGameState} from "@/components/gameUtils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method == "POST") {
        if (!req.headers["content-type"] || req.headers["content-type"] !== "application/json") {
            res.status(400).json({error: "We only handle application/json"});
            return;
        }
        const data = req.body;
        if (!data.name || !data.difficulty || !data.board) {
            res.status(400).json({error: "Missing fields"});
            return;
        }

        if (!checkCorrectStartingPlayer(data.board)) {
            res.status(422).json({error: "Incorrect starting player"});
            return;
        }

        if (!checkCorrectGameSize(data.board)) {
            res.status(422).json({error: "Incorrect size"});
            return;
        }

        const difficulty = toDbDifficulty(data.difficulty);
        if (difficulty == "Invalid value") {
            res.status(422).json({error: `Invalid difficulty ${data.difficulty}`});
            return;
        }

        const board = toDbBoard(data.board);
        if (board == "Semantic error") {
            res.status(422).json({error: "Semantic error"});
            return;
        }

        const prisma = new PrismaClient();
        await prisma.$connect();

        const id = uuidv4();

        await prisma.game.create({
            data: {
                id, name: data.name, difficulty, board: {
                    createMany: {
                        data: board,
                    },
                }
            },
        });

        const create = await prisma.game.findFirstOrThrow({
            where: {
                id,
            },
        });

        await prisma.$disconnect();

        res.status(201).json({
            uuid: create.id,
            createdAt: create.createdAt,
            updatedAt: create.updatedAt,
            name: create.name,
            difficulty: data.difficulty,
            board: data.board,
            gameState: determineGameState(data.board)
        });
    } else if (req.method == "GET") {
        const prisma = new PrismaClient();
        await prisma.$connect();

        const games = await prisma.game.findMany({
            include: {
                board: true,
            },
        });

        const parsedGames = [];
        for (const game of games) {
            const board: ("X" | "O" | "")[][] = fromDbBoard(game.board),
             difficulty = fromDbDifficulty(game.difficulty);

            parsedGames.push({
                uuid: game.id,
                createdAt: game.createdAt.toISOString(),
                updatedAt: game.updatedAt.toISOString(),
                name: game.name,
                difficulty,
                board,
                gameState: determineGameState(board)
            });
        }

        await prisma.$disconnect();

        res.status(200).json(parsedGames);
    }
}
