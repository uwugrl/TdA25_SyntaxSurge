
import React from "react";
import Header from "@/components/Header";
import Metadata from "@/components/Metadata";
import { Button, Stack, Typography } from "@mui/joy";
import { PrismaClient } from "@prisma/client";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { getAccountFromToken, validateAccount } from "@/components/backendUtils";
import { useRouter } from "next/router";


export async function getServerSideProps(ctx:GetServerSidePropsContext) {
    const { uuid } = ctx.params as {uuid: string};

    const prisma = new PrismaClient();
    await prisma.$connect();

    const user = await prisma.user.findFirst({ where: {userId: uuid} });
    if (!user) return { notFound: true };

    let isSelf = false;
    const { token } = ctx.req.cookies;
    if (token && await validateAccount(token)) {
        const userLoggedIn = await getAccountFromToken(token);
        if (userLoggedIn && userLoggedIn.userId === user.userId) {
            isSelf = true;
        }
    }

    return {
        props: {
            name: user.username,
            wins: user.wins,
            losses: user.losses,
            draws: user.draws,
            elo: user.elo,
            about: user.aboutMe,
            isSelf
        }
    }
}

export default function Profile(props: InferGetServerSidePropsType<typeof getServerSideProps>) {

    const router = useRouter();
    
    const settings = () => {
        router.push('/settings');
    }

    const wlRatioFinal = props.wins / props.losses === Infinity ? '0%' : (
        props.wins > props.losses ? `${~~((props.losses / props.wins) * 100)}%` :
                                    `${~~((props.wins / props.losses) * 100)}%`
    );

    return <>
        <Metadata title={'Účet'} description={'Profil uživatele'}/>
        <main className={`w-3/4 m-auto`}>
            <br/>
            <br/>
            <br/>
            <br/>
            <br/>

            <Stack gap={1}>
                <Typography level="h1" textAlign="center">{props.name}</Typography>
                {props.isSelf && <Button onClick={settings}>Upravit profil</Button>}
                <div className="m-auto text-center">
                    <Typography>{props.about || 'Uživatel nic o sobě nenapsal/a.'}</Typography>
                    
                    <Stack gap={1} direction="row" sx={{marginTop: '2em'}}>
                        <Stack gap={1} width="100px" height="100px">
                            <Typography fontWeight="bold">ELO</Typography>
                            <Typography fontSize="24px">{props.elo}</Typography>
                        </Stack>
                        <Stack gap={1} width="100px" height="100px">
                            <Typography fontWeight="bold">Wins</Typography>
                            <Typography fontSize="24px">{props.wins}</Typography>
                        </Stack>
                        <Stack gap={1} width="100px" height="100px">
                            <Typography fontWeight="bold">Losses</Typography>
                            <Typography fontSize="24px">{props.losses}</Typography>
                        </Stack>
                        <Stack gap={1} width="100px" height="100px">
                            <Typography fontWeight="bold">Draws</Typography>
                            <Typography fontSize="24px">{props.draws}</Typography>
                        </Stack>
                        <Stack gap={1} width="100px" height="100px">
                            <Typography fontWeight="bold">W/L ratio</Typography>
                            <Typography fontSize="24px">{wlRatioFinal}</Typography>
                        </Stack>
                    </Stack>
                </div>
            </Stack>
            <Header />
        </main>
    </>
}