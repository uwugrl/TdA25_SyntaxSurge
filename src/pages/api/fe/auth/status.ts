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
        res.status(403).send({
            error: 'Unauthorized'
        });
        return;
    }

    const prisma = new PrismaClient();
    await prisma.$connect();

    const tokenRecord = await prisma.user.findFirst({
        where: {
            userTokens: {
                some: {
                    token
                }
            }
        }
    });

    if (!tokenRecord) {
        res.status(403).send({
            error: "Unauthorized"
        });
        return;
    }

    if (tokenRecord.banned) {
        return res.status(403).send({
            error: `Uživatel je zabanován`
        })
    }

    res.status(200).send({
        status: 'ok',
        uuid: tokenRecord.userId,
        user: tokenRecord.username,
        email: tokenRecord.email
    });
}
