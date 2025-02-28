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

import { PrismaClient } from "@prisma/client";
import { v4 } from "uuid";
import { NextApiRequest, NextApiResponse } from "next";
import moment from "moment";

function generateToken(): string {
    const characters = '123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST' || req.headers["content-type"] !== 'application/json') {
        return res.status(400).send({error: 'Bad status'});
    }

    const { gameName } = req.body as { gameName: string };

    const prisma = new PrismaClient();
    await prisma.$connect();
    
    await prisma.freeGameBoard.deleteMany({
        where: {
            game: {
                expires: {
                    gt: moment().toDate()
                }
            }
        }
    });

    await prisma.freeGame.deleteMany({
        where: {
            expires: {
                gt: moment().toDate()
            }
        }
    });

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

    const gameCode = generateToken();

    await prisma.freeGame.create({
        data: {
            id: v4(),
            name: gameName,
            board: { createMany: { data: board } },
            gameCode,
            expires: moment().add('30', 'minute').toDate()
        },
    });

    res.status(200).send({
        status: "gameCreated",
        code: gameCode
    });
}
