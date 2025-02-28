import {GetServerSidePropsContext, InferGetServerSidePropsType} from "next";
import {PrismaClient} from "@prisma/client";
import {fromDbBoard, fromDbDifficulty} from "@/components/fromDB";
import React, { useState } from "react";
import Metadata from "@/components/Metadata";
import {Button, Stack, Table, Typography} from "@mui/joy";
import Header from "@/components/Header";
import { determineGameState } from "@/components/gameUtils";
import { validateAccount } from "@/components/backendUtils";
import Pagination from "@/components/Pagination";
import Footer from "@/components/Footer";
import { apiGet } from "@/components/frontendUtils";
import Image from "next/image";
import piskvorky from '../pages/image/piskvorky.png';
import moment from "moment";
import { formatDate } from "@/components/base";
import FilterOptions from "@/components/FilterOptions";

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    const client = new PrismaClient();
    await client.$connect();

    const games = (await client.game.findMany({
        include: {
            board: true
        }, orderBy: {
            updatedAt: 'desc'
        }
    })).map(x => ({
            uuid: x.id,
            name: x.name,
            difficulty: fromDbDifficulty(x.difficulty),
            board: fromDbBoard(x.board),
            createdAt: x.createdAt.toISOString(),
            updatedAt: x.updatedAt.toISOString(),
            gameState: determineGameState(fromDbBoard(x.board)),
            explicitWinner: x.explicitWinner
        })), users = await client.user.count(), gamesCount = await client.game.count(),
        gamesToday = await client.game.count({where: {
            createdAt: {
                gt: moment().subtract(1, 'd').toDate()
            }
        }});

    await client.$disconnect();

    const { token } = ctx.req.cookies;
    const loggedIn = await validateAccount(token ?? '');

    return {
        props: {
            games,
            loggedIn,
            users,
            gamesCount,
            gamesToday
        }
    }
}



export default function Home(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const [fulltextFilter, setFulltextFilter] = useState<string | undefined>(undefined);
    const [gamestateFilter, setGamestateFilter] = useState<string | undefined>(undefined);

    const [lastMoveAfter, setLastMoveAfter] = useState<Date | undefined>(undefined);
    const [lastMoveBefore, setLastMoveBefore] = useState<Date | undefined>(undefined);

    const [createdAfter, setCreatedAfter] = useState<Date | undefined>(undefined);
    const [createdBefore, setCreatedBefore] = useState<Date | undefined>(undefined);
    
    const [openRegisterDialog, setOpenRegisterDialog] = useState(false);

    const [page, setPage] = React.useState(1);
    const lastPage = Math.ceil(props.games.length / 10);

    const play = () => {
        apiGet('/auth/status').then(() => {
            location.href = '/game';
        }).catch(() => {
            setOpenRegisterDialog(true);
        });
    }

    const playFree = () => {
        location.href = '/freeplay';
    }

    return (<>
        <Metadata title={'Úvodní stránka'} description={'Vítejte v Think different Academy!'}/>
        <main className={`w-3/4 m-auto`}>
        
            <br/>
            <br/>
            <br/>
            <br/>
            <br/>
            <br/>

            <Stack spacing={1}>
                <div className="text-center">
                </div>

                <div className="grid gric-cols-1 lg:grid-cols-2 place-items-start">
                    <Image alt="Hra sachy" src={piskvorky} width={600} height={600} className="ml-[5%] 2xl:ml-[20%]" />
                    <Stack gap={1} alignItems={"center"} width={"100%"}>
                        <Typography fontSize={'80px'} fontWeight={'bold'}>Piškvorky!</Typography>
                        <Typography textAlign={'center'}>{`Registrovaní hráči: ${props.users}`}</Typography>
                        <Typography textAlign={'center'}>{`Hry: ${props.gamesCount}`}</Typography>
                        <Typography textAlign={'center'}>{`Hry dnes: ${props.gamesToday}`}</Typography>
                        <br />
                        <Button style={{
                            width: '350px',
                            height: '100px',
                            fontSize: '200%'
                        }} size="lg" onClick={play}>Hrát hodnocené</Button>
                        <br />
                        <Button style={{
                            width: '350px',
                            height: '100px',
                            fontSize: '200%'
                        }} size="lg" onClick={playFree}>Hrát přáteláčky</Button>
                    </Stack>
                </div>

                <br />
                <br />
                <br />
                <br />

                <Typography level="h2">Seznam her</Typography>

                <Pagination {...props} page={page} lastPage={lastPage} setPage={x => setPage(x)} />
                <FilterOptions setFulltextFilter={setFulltextFilter} setGamestateFilter={setGamestateFilter}
                setLastMoveAfter={setLastMoveAfter} setLastMoveBefore={setLastMoveBefore} setCreatedAfter={setCreatedAfter} setCreatedBefore={setCreatedBefore} />

                <Table>
                    <thead>
                        <tr>
                            <th>Název</th>
                            <th>Hráno</th>
                            <th>Akce</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...(props.games.filter(x => x.gameState !== "endgame")), ...(props.games.filter(x => x.gameState === "endgame"))]
                            .filter(x => fulltextFilter ? x.name.toLowerCase().includes(fulltextFilter.toLowerCase()) : true)
                            .filter(x => gamestateFilter ? gamestateFilter === x.gameState : true)
                            .filter(x => lastMoveAfter ? Date.parse(x.updatedAt) > lastMoveAfter.getTime() : true)
                            .filter(x => lastMoveBefore ? Date.parse(x.updatedAt) < lastMoveBefore.getTime() : true)
                            .filter(x => createdAfter ? Date.parse(x.createdAt) > createdAfter.getTime() : true)
                            .filter(x => createdBefore ? Date.parse(x.createdAt) < createdBefore.getTime() : true)
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

            <br/>
            <br/>
            <br/>
            <br/>
            <br/>
            
            <Footer />
            <Header forceOpenRegisterDialog={openRegisterDialog} closeRegisterDialog={() => setOpenRegisterDialog(false)} />
        </main>
    </>);
}
