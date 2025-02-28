
import React, { useState } from "react";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import localFont from "next/font/local";
import { Stack, Tab, Table, TabList, TabPanel, Tabs, Typography } from "@mui/joy";
import { getUserList, validateAdminAccount } from "@/components/backendUtils";
import UserCard from "@/components/AdminPanel/UserCard";
import { fromDbBoard, fromDbDifficulty } from "@/components/fromDB";
import { determineGameState } from "@/components/gameUtils";
import { PrismaClient } from "@prisma/client";
import { formatDate } from "@/components/base";
import Pagination from "@/components/Pagination";
import { GameManagement } from "@/components/AdminPanel/GameManagement";

const dosis = localFont({src: './fonts/Dosis-VariableFont_wght.ttf'});

const prisma = new PrismaClient();

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    const {token} = ctx.req.cookies as {token: string | undefined};
    if (!token) return { notFound: true };
    if (!await validateAdminAccount(token)) return {notFound:true};

    const users = await getUserList();

    const games = (await prisma.game.findMany({
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
            }));

    const audit = (await prisma.audit.findMany({
        orderBy: {
            createdAt: 'asc'
        },
        include: {
            sourceUser: true
        }
    })).map(x => ({
        message: x.message,
        author: `${x.sourceUser.username} (${x.sourceUser.email})`,
        created: x.createdAt.toISOString()
    }));

    return {
        props: {
            users,
            games,
            audit
        }
    }
}

export function AuditLog(props: {
    auditLog: {
        message: string,
        author: string,
        created: string
    }[]
}) {

    const [page, setPage] = useState(1);
    const lastPage = Math.ceil(props.auditLog.length / 10);

    return <>
        <Pagination {...props} page={page} lastPage={lastPage} setPage={x => setPage(x)} />
        <Table>
            <thead>
                <tr>
                    <th>Zpráva</th>
                    <th>Datum</th>
                    <th>Administrátor</th>
                </tr>
            </thead>
            <tbody>
                {props.auditLog
                    .slice((page - 1) * 10, page * 10)
                    .map((x, i) => {

                    return <tr key={i}>
                        <td>{x.message}</td>
                        <td>{formatDate(new Date(x.created))}</td>
                        <td>{x.author}</td>
                    </tr>
                })}
            </tbody>
        </Table>
        <Pagination {...props} page={page} lastPage={lastPage} setPage={x => setPage(x)} />
    </>
}

export default function AdminPanel(props: InferGetServerSidePropsType<typeof getServerSideProps>) {

    const [users, setUsers] = React.useState(props.users);
    const [games, setGames] = useState(props.games);

    const markUserBanned = (id: string, reason: string) => {
        setUsers(
            users.map(x => {
                
                if (x.id !== id) return x;

                return {
                    ...x,
                    banned: true,
                    banReason: reason
                }
            })
        );
    }
    const markUserUnbanned = (id: string) => {
        setUsers(
            users.map(x => {
                
                if (x.id !== id) return x;

                return {
                    ...x,
                    banned: false
                }
            })
        );
    }

    return <main className={`w-3/4 m-auto ${dosis.className}`}>
        <a href='/'>
            <Typography color="primary">Zpět</Typography>
        </a>
        <Typography level="h1">Admin Panel</Typography>
        <Tabs>
            <TabList>
                <Tab>Uživatelé</Tab>
                <Tab>Zabanovaní Uživatelé</Tab>
                <Tab>Hry</Tab>
                <Tab>Audit Log</Tab>
            </TabList>

            <TabPanel value={0}>
                <Stack gap={1}>
                    {users.filter(x => !x.banned).map(x => (
                        <UserCard user={x} key={x.id} userBanned={(y) => markUserBanned(x.id, y)} userUnbanned={() => markUserUnbanned(x.id)}  />
                    ))}
                </Stack>
            </TabPanel>

            <TabPanel value={1}>
                <Stack gap={1}>
                    {users.filter(x => x.banned).map(x => (
                        <UserCard user={x} key={x.id} userBanned={(y) => markUserBanned(x.id, y)} userUnbanned={() => markUserUnbanned(x.id)} />
                    ))}
                </Stack>
            </TabPanel>

            <TabPanel value={2}>
                <GameManagement games={games} setGames={setGames}/>
            </TabPanel>

            <TabPanel value={3}>
                <AuditLog auditLog={props.audit}/> 
            </TabPanel>
        </Tabs>
    </main>
}