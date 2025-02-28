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

import { getAccountFromToken, validateAdminAccount } from "@/components/backendUtils";
import {PrismaClient} from "@prisma/client";
import {NextApiRequest, NextApiResponse} from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const {token} = req.cookies;

    if (!token) {
        res.status(401).send({
            error: 'Unauthorized'
        });
        return;
    }

    if (!await validateAdminAccount(token)) {
        res.status(403).send({
            error: 'Forbidden: Not an admin account'
        });
        return;
    }

    const admin = await getAccountFromToken(token);

    const { userId, elo } = req.body as {userId: string, elo: string};

    if (isNaN(Number(elo))) {
        res.status(400).send({
            error: 'Invalid message content'
        });
        return;
    }

    const prisma = new PrismaClient();
    await prisma.$connect();

    const prevUser = await prisma.user.findFirst({
        where: {
            userId
        }
    });

    if (!prevUser) return res.status(404).send({error: 'User not found'});

    const upd = await prisma.user.update({
        data: {
            elo: Number(elo)
        },
        where: {
            userId
        }
    });

    if (upd) {
    
        await prisma.audit.create({
            data: {
                message: `Hráčovi ${prevUser.username} (${prevUser.email}) bylo změněno elo z ${prevUser.elo} na ${elo}.`,
                sourceUserId: admin!.userId
            }
        });
        
        res.status(200).send({
            status: 'ok'
        });
        return;
    }

    res.status(404).send({
        error: 'User not found'
    });
}
