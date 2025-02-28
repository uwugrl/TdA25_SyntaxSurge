
import React, { useState } from "react";
import Header from "@/components/Header";
import Metadata from "@/components/Metadata";
import { Button, Stack, Table, Typography } from "@mui/joy";
import { PrismaClient } from "@prisma/client";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { getAccountFromToken, validateAccount } from "@/components/backendUtils";
import { useRouter } from "next/router";
import { fromDbBoard, fromDbDifficulty } from "@/components/fromDB";
import { determineGameState } from "@/components/gameUtils";
import { formatDate } from "@/components/base";
import Pagination from "@/components/Pagination";


export async function getServerSideProps(ctx:GetServerSidePropsContext) {
    const { uuid } = ctx.params as {uuid: string};

    const prisma = new PrismaClient();
    await prisma.$connect();

    const user = await prisma.user.findFirst({ where: {userId: uuid} });
    if (!user) return { notFound: true };

    const games = await prisma.game.findMany({ where: { OR: [ {player1ID: user.userId}, {player2ID: user.userId} ] }, include: {board: true} });

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
            isSelf,
            games: games.map(x => ({
                uuid: x.id,
                name: x.name,
                difficulty: fromDbDifficulty(x.difficulty),
                board: fromDbBoard(x.board),
                createdAt: x.createdAt.toISOString(),
                updatedAt: x.updatedAt.toISOString(),
                gameState: determineGameState(fromDbBoard(x.board)),
                explicitWinner: x.explicitWinner
            })),
            joined: user.createDate.toISOString()
        }
    }
}

export default function Profile(props: InferGetServerSidePropsType<typeof getServerSideProps>) {

    const [page, setPage] = useState(1);
    const lastPage = Math.ceil(props.games.length / 10);

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
                    <Typography>{`Připojil/a se ${formatDate(new Date(props.joined))}`}</Typography>
                </div>

                <Stack gap={1}>
                    <Typography level="h1">Historie her</Typography>

                    <Pagination {...props} page={page} lastPage={lastPage} setPage={x => setPage(x)} />
                    <Table>
                        <thead>
                            <tr>
                                <th><Typography>Název</Typography></th>
                                <th><Typography>Datum hry</Typography></th>
                                <th><Typography>Akce</Typography></th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...(props.games.filter(x => x.gameState !== "endgame")), ...(props.games.filter(x => x.gameState === "endgame"))]
                                .slice((page - 1) * 10, page * 10)
                                .map(x => {
                                if (!x.difficulty) {return null;}
    
                                const show = () => {
                                    location.href = `/game/${x.uuid}`;
                                }
    
                                return <tr key={x.uuid}>
                                    <td>{x.name}</td>
                                    <td>{formatDate(new Date(x.createdAt))}</td>
                                    <td><Button variant="plain" onClick={show}>Zobrazit</Button></td>
                                </tr>
                            })}
                        </tbody>
                    </Table>
                    <Pagination {...props} page={page} lastPage={lastPage} setPage={x => setPage(x)} />
                </Stack>
                    
                {props.isSelf && <Button onClick={settings}>Upravit profil</Button>}
            </Stack>
            
            <Header />
        </main>
    </>
}