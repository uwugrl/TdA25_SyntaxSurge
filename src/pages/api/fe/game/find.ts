/*
 * Think different Academy je aplikace umožnující hrát piškvorky.
 * Copyright (C) 2024-2025 mldchan
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import { getAccountFromID, getAccountFromToken } from "@/components/backendUtils";
import { PrismaClient } from "@prisma/client";
import { v4 } from "uuid";
import { NextApiRequest, NextApiResponse } from "next";
import { determineGameState, evalWinner } from "@/components/gameUtils";
import { fromDbBoard } from "@/components/fromDB";
import moment from "moment";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { token } = req.cookies;

    if (!token) return res.status(403).send({ error: "Unauthorized" });
    const player2 = await getAccountFromToken(token);
    if (!player2) return res.status(403).send({ error: "Unauthorized" });

    const prisma = new PrismaClient();
    await prisma.$connect();

    await prisma.matchmaking.deleteMany({
        where: {
            expires: {
                gt: moment().toDate()
            }
        }
    });

    const existingGames = await prisma.game.findMany({where: {OR: [{player1ID: player2.userId}, {player2ID: player2.userId}]}, include: {board: true}});
    const existingGame = existingGames.find(x => {
        if (evalWinner(fromDbBoard(x.board)) === "") return true;
        return false;
    })

    if (existingGame && determineGameState(fromDbBoard(existingGame.board)) !== "endgame") {
        await prisma.matchmaking.deleteMany({where: {player1ID: player2.userId}});
        return res.status(200).send({
            status: 'matchmaking_game_found'
        });
    }

    const game = await prisma.matchmaking.findFirst({where: {NOT: {player1ID: player2.userId}}});

    if (game) {
        await prisma.matchmaking.update({
            where: {
                id: game.id
            },
            data: {
                expires: moment().add(1, 'minute').toDate()
            }
        });
        const player1 = await getAccountFromID(game.player1ID);
        if (!player1) return res.status(400).send({ error: "Invalid game" });
        const board: { x: number; y: number; state: number }[] = [];
        for (let i = 0; i < 15; i++) {
            for (let j = 0; j < 15; j++) {
                board.push({
                    x: i,
                    y: j,
                    state: 0,
                });
            }
        }
        await prisma.matchmaking.delete({ where: { id: game.id } });
        await prisma.game.create({
            data: {
                id: v4(),
                name: `${player1.username} vs ${player2.username}`,
                difficulty: game.difficulty,
                board: { createMany: { data: board } },
                player1ID: game.player1ID,
                player2ID: player2.userId,
            },
        });

        return res.status(200).send({
            status: "matchmaking_game_found",
        });
    }

    if (await prisma.matchmaking.count({where: {player1ID: player2.userId}}) === 0) {
        await prisma.matchmaking.create({
            data: {
                difficulty: 3,
                player1ID: player2.userId,
                expires: moment().add(1, 'minute').toDate()
            },
        });
    }

    res.status(200).send({
        status: "matchmaking_start",
    });
}
