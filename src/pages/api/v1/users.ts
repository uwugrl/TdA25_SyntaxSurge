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

import {NextApiRequest, NextApiResponse} from "next";
import {hash} from "argon2";
import {v4} from "uuid";
import {PrismaClient} from "@prisma/client";
import {validateUser} from "@/components/backendValidation";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {


    switch (req.method) {
        case 'GET':

            const client = new PrismaClient();
            await client.$connect();
            const users = await client.user.findMany();
            await client.$disconnect();

            res.status(200).send(users.map(x => {
                return {
                    uuid: x.userId,
                    createdAt: x.createDate.toISOString(),
                    username: x.username,
                    email: x.email,
                    elo: x.elo,
                    wins: x.wins,
                    draws: x.draws,
                    losses: x.losses
                }
            }))

            break;
        case 'POST':

            if (req.headers["content-type"] !== "application/json") {
                res.status(400).send({
                    code: 400,
                    message: 'Invalid content-type',
                });
                return;
            }

            const {username, email, password, elo} = req.body;

            const valResult = validateUser(username, email, password, elo);

            if (typeof valResult === "string") {
                res.status(400).send({
                    code: 400,
                    message: valResult
                });
                return;
            }

            const hashedPassword = await hash(password);
            const userId = v4();

            const prisma = new PrismaClient();

            await prisma.$connect();

            const result = await prisma.user.create({
                data: {
                    username,
                    password: hashedPassword,
                    userId,
                    email,
                    elo,
                    wins: 0,
                    draws: 0,
                    losses: 0,
                }
            });

            await prisma.$disconnect();

            res.status(200).send({
                uuid: userId,
                createdAt: result.createDate.toISOString(),
                username,
                email,
                elo,
                wins: 0,
                draws: 0,
                losses: 0
            });

            break;
    }

}

