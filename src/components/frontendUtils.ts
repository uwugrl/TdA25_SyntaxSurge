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

export async function apiGet(route: string): Promise<any> {

    return new Promise((resolve, reject) => {
        fetch(`/api/fe${route}`, {
            method: 'GET'
        }).then(x => {
            x.json().then(data => {
                if (x.ok) {
                    resolve(data);
                } else {
                    if (data.hasOwnProperty('error')) {
                        reject(`Error: ${x.statusText}: ${data.error}`);
                    } else {
                        reject(`Error: ${x.statusText}: ${data}`);
                    }
                }
            }).catch(y => {
                reject(`Error: ${x.statusText}: ${y}`);
            });
        }).catch(x => {
            reject(`Error: ${x}`);
        })
    });

}

export async function apiPost(route: string, obj: any): Promise<any> {
    return new Promise((resolve, reject) => {
        fetch(`/api/fe${route}`, {
            method: 'POST',
            body: JSON.stringify(obj),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(x => {
            x.json().then(data => {
                if (x.ok) {
                    resolve(data);
                } else {
                    if (data.hasOwnProperty('error')) {
                        reject(`Error: ${x.statusText}: ${data.error}`);
                    } else {
                        reject(`Error: ${x.statusText}: ${data}`);
                    }
                }
            }).catch(y => {
                reject(`Error: ${x.statusText}: ${y}`);
            });
        }).catch(x => {
            reject(`Error: ${x}`);
        })
    })
}
