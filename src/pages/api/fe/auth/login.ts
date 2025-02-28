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
import {hash, verify} from 'argon2';
import {v4 as uuidv4} from "uuid";

function generateToken(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.status(405).send({
            status: 'error',
            error: 'Invalid method'
        });
        return;
    }
    if (req.headers['content-type'] !== 'application/json') {
        res.status(415).send({
            status: 'error',
            error: 'Invalid content-type'
        });
        return;
    }

    const {username, password} = req.body;

    const client = new PrismaClient();
    await client.$connect();

    if (await client.user.count() === 0) {
        const userId = uuidv4();

        const u = await client.user.create({
            data: {
                userId,
                username: "TdA",
                email: "tda@scg.cz",
                password: await hash("StudentCyberGames25!"),
                administrator: true
            }
        });

        await client.audit.create({
            data: {
                message: 'Systém byl připraven k prvnímu použití. Byl vytvořen výchozí účet.',
                sourceUserId: u.userId
            }
        });
    }

    const user = await client.user.findFirst({
        where: {
            OR: [
                {email: username},
                {username}
            ]
        }
    });

    if (!user) {
        res.status(404).send({
            status: 'error',
            error: 'Uživatel nenalezen'
        });
        await client.$disconnect();
        return;
    }

    if (user.banned) {
        await client.$disconnect();
        return res.status(403).send({
            error: `Uživatel je zabanován: ${user.banReason}`
        });
    }

    const validateResult = await verify(user.password, password);

    if (!validateResult) {
        res.status(403).send({
            status: 'error',
            error: 'Nesprávné heslo'
        });
        await client.$disconnect();
        return;
    }

    const randomToken = generateToken();

    await client.userTokens.create({
        data: {
            userId: user.userId,
            token: randomToken
        }
    });

    await client.$disconnect();

    res.setHeader('Set-Cookie', `token=${randomToken}; Path=/; HttpOnly; Max-Age=34560000`);
    res.status(200).send({
        status: 'ok'
    });
}