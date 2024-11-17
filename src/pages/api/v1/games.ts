import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

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

        let difficulty = -1;
        if (data.difficulty == "beginner") {
            difficulty = 0;
        } else if (data.difficulty == "easy") {
            difficulty = 1;
        } else if (data.difficulty == "medium") {
            difficulty = 2;
        } else if (data.difficulty == "hard") {
            difficulty = 3;
        } else if (data.difficulty == "extreme") {
            difficulty = 4;
        }

        if (difficulty == -1) {
            res.status(400).json({ error: `Invalid difficulty ${data.difficulty}` });
            return;
        }

        let board = [];

        for (let i in data.board) {
            for (let j in data.board[i]) {
                const tile = data.board[i][j];
                if (tile != "X" && tile != "O" && tile != "") {
                    res.status(422).json({ error: `Invalid tile ${i}/${j}: ${tile}` });
                    return;
                }

                let tileInt = -1;
                if (tile == "X") {
                    tileInt = 1;
                } else if (tile == "O") {
                    tileInt = 2;
                } else {
                    tileInt = 0;
                }

                board.push({
                    x: parseInt(i),
                    y: parseInt(j),
                    state: tileInt
                })
            }
        }

        const prisma = new PrismaClient();
        await prisma.$connect();

        const create = await prisma.game.create({
            data: {
                name: data.name,
                difficulty: difficulty,
                gameBoardData: {
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
                gameBoardData: true
            }
        });

        await prisma.$disconnect();

        res.status(200).json(games);
    }
}
