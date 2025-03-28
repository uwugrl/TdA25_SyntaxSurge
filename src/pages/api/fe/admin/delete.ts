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


const prisma = new PrismaClient();

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

    const { id } = req.body as { id: string, name: string};

    if (!id) {
        return res.status(400).send({
            error: 'Invalid parameters'
        });
    }

    const game = await prisma.game.findFirst({
        where: {
            id
        }
    });

    if (!game) return res.status(404).send({error: 'Game not found'});

    await prisma.gameBoard.deleteMany({
        where: {
            gameId: id
        }
    });

    await prisma.game.delete({
        where: {
            id
        }
    });

    await prisma.audit.create({
        data: {
            message: `Hra jménem "${game.name}" byla smazána.`,
            sourceUserId: admin!.userId
        }
    });

    res.status(200).send({
        success: 'Deleted'
    });
}
