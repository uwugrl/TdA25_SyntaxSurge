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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const {token} = req.cookies;

    if (!token) {
        res.status(401).json({
            error: "No token provided"
        });
        return;
    }

    const client = new PrismaClient();
    await client.$connect();
    await client.userTokens.deleteMany({
        where: {
            token
        }
    });
    await client.$disconnect();

    res.setHeader('Set-Cookie', 'token=; Max-Age=0');
    res.status(200).json({
        status: "ok"
    });
}