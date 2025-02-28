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

import {Button, DialogTitle, Input, Modal, ModalClose, ModalDialog, Stack, Typography} from "@mui/joy";
import {useState} from "react";
import {apiGet, apiPost} from "@/components/frontendUtils";
import React from "react";

export default function LoginDialog(props: {
    show: boolean, hide: () => void
}) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [showLoggedIn, setShowLoggedIn] = useState(false);

    const hide = () => {
        if (!loading) {
            props.hide();
        }
    }

    const startLogin = () => {
        setLoading(true);

        apiPost('/auth/login', {username, password}).then(() => {
            apiGet('/auth/status').then(x => {
                const y = x as {user: string}
                setUsername(y.user);
                setShowLoggedIn(true);

                setTimeout(() => {
                    location.reload();
                }, 1000);
            }).catch(x => {
                setLoading(false);
                setErrorMessage(x);
            })
        }).catch(y => {
            setLoading(false);
            setErrorMessage(y);
        });
    }

    return <Modal open={props.show} onClose={() => hide()}>
        <ModalDialog>
            {loading || <ModalClose onClick={() => hide()}/>}
            <DialogTitle>Přihlásit se</DialogTitle>
            {showLoggedIn ? (
                <Stack spacing={1}>
                    <Typography fontWeight="bold">{`Vítejte zpět, ${username}!`}</Typography>
                </Stack>
            ) : (
                <Stack spacing={1}>
                    <Typography fontSize="sm">Uživatelské jméno nebo e-mail</Typography>
                    <Input type="text" placeholder="" disabled={loading} value={username}
                           onChange={x => setUsername(x.currentTarget.value)}></Input>
                    <Typography fontSize="sm">Heslo</Typography>
                    <Input type="password" placeholder="" disabled={loading} value={password}
                           onChange={x => setPassword(x.currentTarget.value)}></Input>
                    {errorMessage && <Typography color="danger">{errorMessage}</Typography>}
                    <Button disabled={loading} onClick={startLogin}>Přihlásit se</Button>
                </Stack>
            )}
        </ModalDialog>
    </Modal>
}
