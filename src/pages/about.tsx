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

import Metadata from "@/components/Metadata";
import React from "react";
import localFont from "next/font/local";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Stack, Typography } from "@mui/joy";

const dosis = localFont({src: './fonts/Dosis-VariableFont_wght.ttf'});

export default function About() {
    return (
        <>
            <Metadata title={'O aplikaci'} description={'O aplikaci Think different Academy!'}/>
            <main className={`w-3/4 m-auto ${dosis.className}`}>
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>

                <Link href={'/'} className={'text-[#0070BB]'}>
                    Zpět do aplikace
                </Link>

                <Stack gap={2}>
                    <Typography level="h1" textAlign="center">O naší aplikaci</Typography>

                    <Typography>Aplikace Think different Academy vám umožňuje hrát piškvorky.</Typography>

                <p className={'my-2'}>
                    Tento program je svobodný software: můžete jej šířit a/nebo upravovat za podmínek licence GNU Affero
                    General Public License, jak je uvedeno níže, vydané Free Software Foundation, a to buď ve verzi 3,
                    nebo ve verzi 2, nebo jakoukoli pozdější verzi.
                </p>
                <p className={'my-2'}>
                    Tento program je šířen v naději, že bude užitečný, ale BEZ JAKÉKOLI ZÁRUKY; dokonce ani bez
                    předpokládané záruky PRODEJNOSTI nebo VHODNOSTI PRO KONKRÉTNÍ ÚČEL. Viz. GNU Affero General Public
                    License, kde najdete další podrobnosti.
                </p>
                <p className={'my-2'}>
                    Měli jste obdržet kopii GNU Affero General Public License spolu s tímto programem. Pokud ne,
                    podívejte se na &lt;https://www.gnu.org/licenses/&gt;.
                </p>
                <Link href={'https://code.mldchan.dev/mld/tda25_syntaxsurge'} className={'text-[#0070BB]'}>Zobrazit
                    zdrojový kód</Link>
                <p>Tuto aplikaci vytvořili mldchan a krystof.</p>
                <ul className={'list-disc ml-4'}>
                    <li className={'flex flex-row gap-2'}>
                        {`mldchan - `}
                        <Link href={'https://social.mldchan.dev/@mld'} className={'text-[#0070BB]'}>Fediverse</Link>
                        <Link href={'https://code.mldchan.dev/mld'} className={'text-[#0070BB]'}>GitLab</Link>
                        <Link href={'https://github.com/mldchan'} className={'text-[#0070BB]'}>GitHub</Link>
                        <Link href={'https://youtube.com/@mldchan'} className={'text-[#0070BB]'}>YouTube</Link>
                    </li>
                    <li className={'flex flex-row gap-2'}>
                        {`krystof - `}
                        <Link href={'https://social.mldchan.dev/@Krysunka'} className={'text-[#0070BB]'}>Fediverse</Link>
                        <Link href={'https://code.mldchan.dev/Krysunka'} className={'text-[#0070BB]'}>GitLab</Link>
                    </li>
                </ul>
            </main>
        </>
    )


}
