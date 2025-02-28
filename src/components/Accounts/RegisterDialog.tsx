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
import {ChangeEvent, useState} from "react";
import {apiGet, apiPost} from "@/components/frontendUtils";
import {passwordStrength} from "check-password-strength";

import React from "react";

export default function RegisterDialog(props: {
    show: boolean, hide: () => void
}) {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [showRegistered, setShowRegistered] = useState(false);

    const [passwordStrengthVal, setPasswordStrengthVal] = useState("");
    const [passwordColor, setPasswordColor] = useState<'red' | 'yellow' | 'orange' | 'green'>('red');

    const hide = () => {
        if (!loading) {
            props.hide();
        }
    }

    const catchError = (x: unknown) => {
        setLoading(false);
        setErrorMessage(`${x}`);
    }

    const startRegister = () => {
        setLoading(true);

        apiPost('/auth/register', {username, email, password}).then(() => {
            apiPost('/auth/login', {username, password}).then(() => {
                apiGet('/auth/status').then(x => {
                    const y = x as {user: string}
                    setUsername(y.user);
                    setShowRegistered(true);

                    setTimeout(() => {
                        location.reload();
                    }, 1000);
                }).catch(catchError)
            }).catch(catchError);
        }).catch(catchError);
    }

    const recalculatePasswordStrength = (x: ChangeEvent<HTMLInputElement>) => {
        setPassword(x.currentTarget.value);

        const passwordStrengthValue = passwordStrength(x.currentTarget.value).value;

        switch (passwordStrengthValue) {
            case 'Too weak':
                setPasswordColor('red');
                setPasswordStrengthVal('Příliš slabé')
                break;
            case 'Weak':
                setPasswordColor('orange');
                setPasswordStrengthVal("Slabé")
                break;
            case 'Medium':
                setPasswordColor('yellow');
                setPasswordStrengthVal("Dobré");
                break;
            case 'Strong':
                setPasswordColor('green');
                setPasswordStrengthVal("Silné");
                break;
        }
    }

    const validation = loading || passwordStrengthVal === 'Příliš slabé' || email.length === 0 || password.length === 0 || username.length === 0;

    return <Modal open={props.show} onClose={() => hide()}>
        <ModalDialog>
            {loading || <ModalClose onClick={() => hide()}/>}
            <DialogTitle>Registrace</DialogTitle>
            {showRegistered ? (
                <Stack spacing={1}>
                    <Typography fontWeight="bold">{`Vítejte v Think different Academy, ${username}!`}</Typography>
                </Stack>
            ) : (
                <Stack spacing={1}>
                    <Typography fontSize="sm">Uživatelské jméno</Typography>
                    <Input type="text" placeholder="" disabled={loading} value={username}
                           onChange={x => setUsername(x.currentTarget.value)}></Input>
                    <Typography fontSize="sm">E-mail</Typography>
                    <Input type="text" placeholder="" disabled={loading} value={email}
                           onChange={x => setEmail(x.currentTarget.value)}></Input>
                    <Typography fontSize="sm">Heslo</Typography>
                    <Input type="password" placeholder="" disabled={loading} value={password}
                           onChange={recalculatePasswordStrength}></Input>
                    <Typography sx={{
                        color: passwordColor
                    }}>{passwordStrengthVal}</Typography>
                    {errorMessage && <Typography color="danger">{errorMessage}</Typography>}
                    <Button disabled={validation} onClick={startRegister}>Registrovat</Button>
                </Stack>
            )}
        </ModalDialog>
    </Modal>
}
