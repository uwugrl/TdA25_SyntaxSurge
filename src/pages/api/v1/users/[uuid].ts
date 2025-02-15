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

import {PrismaClient} from "@prisma/client";
import {NextApiRequest, NextApiResponse} from "next";
import {passwordStrength} from "check-password-strength";
import {hash} from "argon2";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const prisma = new PrismaClient();
    await prisma.$connect();
    const {uuid} = req.query as { uuid: string };

    switch (req.method) {
        case "GET":

            await prisma.$connect();
            const user = await prisma.user.findFirst({
                where: {
                    userId: uuid
                }
            });

            if (!user) {
                res.status(404).json({
                    code: 404,
                    error: 'Resource not found'
                });
                break;
            }

            res.status(200).send({
                uuid: user.userId,
                createdAt: user.createDate.toISOString(),
                username: user.username,
                email: user.email,
                elo: user.elo,
                wins: user.wins,
                draws: user.draws,
                losses: user.losses
            });
            break;
        case "PUT":
            const {username, email, password, elo} = req.body;

            const existingUser = await prisma.user.findFirst({
                where: {
                    userId: uuid
                }
            });

            if (!existingUser) {
                res.status(404).json({
                    code: 404,
                    error: 'Resource not found'
                });
                break;
            }

            let shouldUpdate = false;

            if (username && username.length >= 2 && username.length <= 16) {
                existingUser.username = username;
                shouldUpdate = true;
            }

            if (email && email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
                existingUser.email = email;
                shouldUpdate = true;
            }

            if (password && password.length >= 4 && passwordStrength(password).value !== 'Too weak') {
                existingUser.password = await hash(password);
                shouldUpdate = true;
            }

            if (elo && !isNaN(Number(elo)) && elo > 0) {
                existingUser.elo = Number(elo);
                shouldUpdate = true;
            }

            if (!shouldUpdate) {
                res.status(400).json({
                    error: 400,
                    message: 'Bad request: Nothing updated'
                });
            }

            await prisma.user.update({
                where: {
                    userId: uuid
                },
                data: {
                    username: existingUser.username,
                    password: existingUser.password,
                    elo: existingUser.elo,
                    email: existingUser.email,
                }
            });

            res.status(200).send({
                uuid,
                createdAt: existingUser.createDate.toISOString(),
                username: existingUser.username,
                email: existingUser.email,
                elo: existingUser.elo,
                wins: existingUser.wins,
                losses: existingUser.losses,
                draws: existingUser.draws,
            });

            break;
        case "DELETE":

            try {
                await prisma.user.delete({
                    where: {
                        userId: uuid
                    }
                });
                res.status(204).end();
            } catch (e) {
                res.status(404).json({
                    code: 404,
                    message: 'Resource not found'
                });
            }
            break;
    }

    await prisma.$disconnect();
}
