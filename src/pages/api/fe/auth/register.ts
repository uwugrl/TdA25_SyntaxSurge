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
import {hash} from 'argon2';
import {v4} from "uuid";

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

    const {username, email, password} = req.body;

    if (!username || !email || !password) {
        res.status(400).send({
            status: 'error',
            error: 'Neplatné údaje'
        });
    }

    const client = new PrismaClient();
    await client.$connect();

    const user = await client.user.findFirst({
        where: {
            OR: [
                {username},
                {email}
            ]
        }
    });

    if (user) {
        res.status(400).send({
            status: 'error',
            error: 'Uživatel s tímto uživatelským jménem nebo emailem již existuje'
        });
        await client.$disconnect();
        return;
    }

    const hashPassword = await hash(password);
    const randomID = v4();

    await client.user.create({
        data: {
            userId: randomID,
            username,
            password: hashPassword,
            email
        }
    });

    await client.$disconnect();

    res.status(200).send({
        status: 'ok'
    });
}