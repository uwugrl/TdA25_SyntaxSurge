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


import {passwordStrength} from "check-password-strength";

export function validateUser(username: any, email: any, password: any, elo: any): true | string {
    if (!username || !email || !password || !elo) {
        return 'Parameters are missing';
    }

    if (username.length < 2 || username.length > 16) {
        return 'Username must be at least 2 characters and at most 16 characters long';
    }

    if (!email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
        return 'Invalid e-mail address';
    }

    if (password.length < 4) {
        return 'Password must be at least 4 characters long';
    }

    if (passwordStrength(password).value === 'Too weak') {
        return 'Password check failed.';
    }

    if (isNaN(Number(elo))) {
        return 'ELO is not a number';
    }

    return true;
}