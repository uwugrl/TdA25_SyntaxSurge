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

import { validateAdminAccount } from "@/components/backendUtils";
import {PrismaClient} from "@prisma/client";
import {NextApiRequest, NextApiResponse} from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const {token} = req.cookies;
    if (!token) return res.status(401).send({ error: 'Unauthorized' });
    if (!await validateAdminAccount(token)) return res.status(403).send({ error: 'Forbidden: Not an admin account' });

    const { userId, reason } = req.body as {userId: string, reason: string };

    if (!reason || !userId) return res.status(400).send({ error: 'Missing parameters' });

    const prisma = new PrismaClient();
    await prisma.$connect();

    const acc = await prisma.user.findFirst({
        where: {
            userId
        }
    });
    if (!acc) return res.status(404).send({error: 'User not found.'});
    if (acc.administrator) return res.status(400).send({error: 'Can\'t ban administrator account'});

    const upd = await prisma.user.update({
        data: {
            banned: true,
            banReason: reason
        },
        where: {
            userId
        }
    });

    // Revoke all sessions
    await prisma.userTokens.deleteMany({
        where: {
            userId
        }
    });

    if (upd) {
        res.status(200).send({
            status: 'ok'
        });
        return;
    }

    res.status(404).send({
        error: 'User not found'
    });
}
