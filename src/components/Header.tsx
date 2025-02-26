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

import Image from "next/image";

import tda from '../Logo2.png';
import localFont from "next/font/local";
import { apiGet } from "./frontendUtils";
import React, { ReactNode } from "react";
import { Avatar, Button, Divider, Dropdown, Menu, MenuButton, MenuItem, Stack } from "@mui/joy";
import LoginDialog from "./Accounts/LoginDialog";
import RegisterDialog from "./Accounts/RegisterDialog";
import { useRouter } from "next/router";

const dosis = localFont({ src: '../pages/fonts/Dosis-VariableFont_wght.ttf' });

function LinkButton(props:{href: string, children: ReactNode | ReactNode[]}) {
    const router = useRouter();

    const navigate = () => {
        router.push(props.href);
    }

    return <Button onClick={navigate} variant="plain">
        {props.children}
    </Button>
}

export default function Header(props: {
    forceOpenRegisterDialog?: boolean,
    closeRegisterDialog?: () => void
}) {

    const [loggedIn, setLoggedIn] = React.useState(false);
    const [loggedInUser, setLoggedInUser] = React.useState('');
    const [loggedInUserID, setLoggedInUserID] = React.useState('');

    const [showLoginDialog, setShowLoginDialog] = React.useState(false);
    const [showRegisterDialog, setShowRegisterDialog] = React.useState(false);

    const router = useRouter();

    React.useEffect(() => {
        refreshUserInformation();
    }, []);

    const signOut = () => {
        apiGet('/auth/logout').then(() => {
            setLoggedIn(false);
            setLoggedInUser("");
        });
    }

    const refreshUserInformation = () => {
        apiGet('/auth/status').then(x => {
            const y = x as { user: string, status: string, uuid: string }

            if (y.status === 'ok') {
                setLoggedIn(true);
                setLoggedInUser(y.user);
                setLoggedInUserID(y.uuid);
            }
        })
    }

    const navigateToHome = () => {
        router.push('/');
    }

    const navigateToProfile = () => {
        router.push(`/account/${loggedInUserID}`);
    }
    const navigateToSettings = () => {
        router.push('/settings');
    }

    return <div className={`${dosis.className} fixed flex flex-row justify-between gap-6 w-5/6 left-1/2 top-4 bg-[#080808ee] -translate-x-1/2 p-3 px-3 rounded-xl drop-shadow-xl`}>
        <Stack direction='row' gap={2}>
            <Image onClick={navigateToHome} src={tda} alt={'Think different Academy logo'} className="cursor-pointer" width={173} height={144} />

            <LinkButton href="/">Hry</LinkButton>
            <LinkButton href="/accounts">Účty</LinkButton>
        </Stack>

        <div className="flex flex-row items-center gap-6">
            {loggedIn ? (
                <>
                    <Dropdown>
                        <MenuButton variant="plain">
                            <Avatar>{loggedInUser[0]}</Avatar>
                        </MenuButton>
                        <Menu>
                            <MenuItem onClick={navigateToProfile}>Profil</MenuItem>
                            <MenuItem onClick={navigateToSettings}>Nastavení</MenuItem>
                            <Divider />
                            <MenuItem color="danger" onClick={signOut}>Odhlásit se</MenuItem>
                        </Menu>
                    </Dropdown>
                </>
            ) : (
                <>
                    <Button onClick={() => setShowLoginDialog(true)} variant="plain">Přihlásit se</Button>
                    <Button onClick={() => setShowRegisterDialog(true)} variant="plain">Registrovat</Button>
                </>
            )}
        </div>

        <LoginDialog show={showLoginDialog} hide={() => { setShowLoginDialog(false); refreshUserInformation(); }} />
        <RegisterDialog show={showRegisterDialog || (props.forceOpenRegisterDialog ?? false)} hide={() => { setShowRegisterDialog(false); refreshUserInformation(); if (props.closeRegisterDialog) props.closeRegisterDialog(); }} />
    </div>
}
