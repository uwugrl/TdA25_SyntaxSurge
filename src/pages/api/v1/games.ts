import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { v4 as uuidv4 } from 'uuid';
import { fromDbDifficulty, fromDbBoard } from "@/components/fromDB";
import { toDbBoard, toDbDifficulty } from "@/components/toDB";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if (req.method == "POST") {
        if (!req.headers["content-type"] || req.headers["content-type"] !== "application/json") {
            res.status(400).json({ error: "We only handle application/json" });
            return
        }
        const data = req.body;
        if (!data.name || !data.difficulty || !data.board) {
            res.status(400).json({ error: "Missing fields" });
            return;
        }

        let difficulty = toDbDifficulty(data.difficulty);
        if (difficulty == "Invalid value") {
            res.status(400).json({ error: `Invalid difficulty ${data.difficulty}` });
            return;
        }

        let board = toDbBoard(data.board);
        if (board == "Semantic error") {
            res.status(400).json({ error: "Semantic error" });
            return;
        }

        const prisma = new PrismaClient();
        await prisma.$connect();

        const create = await prisma.game.create({
            data: {
                id: uuidv4(),
                name: data.name,
                difficulty: difficulty,
                board: {
                    createMany: {
                        data: board
                    }
                }
            }
        })

        await prisma.$disconnect();

        res.status(201).json({ id: create.id });
    }
    else if (req.method == "GET") {
        const prisma = new PrismaClient();
        await prisma.$connect();

        const games = await prisma.game.findMany({
            include: {
                board: true
            }
        });

        const parsedGames = [];
        for (let game of games) {
            const board: ("X" | "O" | "")[][] = fromDbBoard(game.board);
            let difficulty = fromDbDifficulty(game.difficulty);
            
            parsedGames.push({
                id: game.id,
                name: game.name,
                difficulty: difficulty,
                board: board
            })
        }

        await prisma.$disconnect();

        res.status(200).json(parsedGames);
    }
}
