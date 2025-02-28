
import React, { useState } from "react";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import localFont from "next/font/local";
import { Button, DialogTitle, Input, Modal, ModalClose, ModalDialog, Stack, Tab, Table, TabList, TabPanel, Tabs, Typography } from "@mui/joy";
import { getUserList, validateAdminAccount } from "@/components/backendUtils";
import UserCard from "@/components/AdminPanel/UserCard";
import { fromDbBoard, fromDbDifficulty } from "@/components/fromDB";
import { determineGameState } from "@/components/gameUtils";
import { PrismaClient } from "@prisma/client";
import { formatDate } from "@/components/base";
import Pagination from "@/components/Pagination";
import FilterOptions from "@/components/FilterOptions";
import { apiPost } from "@/components/frontendUtils";

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
            }))

    return {
        props: {
            users,
            games
        }
    }
}

export default function AdminPanel(props: InferGetServerSidePropsType<typeof getServerSideProps>) {

    const [users, setUsers] = React.useState(props.users);
    const [games, setGames] = useState(props.games);

    const [fulltextFilter, setFulltextFilter] = useState<string | undefined>(undefined);
    const [gamestateFilter, setGamestateFilter] = useState<string | undefined>(undefined);

    const [lastMoveAfter, setLastMoveAfter] = useState<Date | undefined>(undefined);
    const [lastMoveBefore, setLastMoveBefore] = useState<Date | undefined>(undefined);

    const [createdAfter, setCreatedAfter] = useState<Date | undefined>(undefined);
    const [createdBefore, setCreatedBefore] = useState<Date | undefined>(undefined);

    const [page, setPage] = useState(1);
    const lastPage = Math.ceil(games.length / 10);

    const [editGameID, setEditGameID] = useState("");

    const [currentGameEditName, setCurrentGameEditName] = useState('');

    const [loading, setLoading] = useState(false);

    const startEditGame = (id: string) => {
        const target = games.find(x => x.uuid === id);
        if (!target) return;

        setEditGameID(id);
        setCurrentGameEditName(target.name);
    }

    const stopEditGame = () => {
        setEditGameID("");
        setCurrentGameEditName("");
    }
    
    const save = () => {
        setLoading(true);
        apiPost("/admin/edit", {
            id: editGameID,
            name: currentGameEditName
        }).then(() => {
            setGames(
                games.map(x => {
                    if (x.uuid === editGameID) return {
                        ...x,
                        name: currentGameEditName
                    }

                    return x;
                })
            );

            setLoading(false);
            stopEditGame();
        });
    }

    const markUserBanned = (id: string) => {
        setUsers(
            users.map(x => {
                
                if (x.id !== id) return x;

                return {
                    ...x,
                    banned: true,
                    banReason: ''
                }
            })
        );
    }

    return <main className={`w-3/4 m-auto ${dosis.className}`}>
        <Typography level="h1">Admin Panel</Typography>
        <Tabs>
            <TabList>
                <Tab>Uživatelé</Tab>
                <Tab>Zabanovaní Uživatelé</Tab>
                <Tab>Hry</Tab>
            </TabList>

            <TabPanel value={0}>
                <Stack gap={1}>
                    {props.users.filter(x => !x.banned).map(x => (
                        <UserCard user={x} key={x.id} userBanned={() => markUserBanned(x.id)} />
                    ))}
                </Stack>
            </TabPanel>

            <TabPanel value={1}>
                <Stack gap={1}>
                    {props.users.filter(x => x.banned).map(x => (
                        <UserCard user={x} key={x.id} userBanned={() => markUserBanned(x.id)} />
                    ))}
                </Stack>
            </TabPanel>

            <TabPanel value={2}>
                <Stack gap={1}>
                    <Pagination {...props} page={page} lastPage={lastPage} setPage={x => setPage(x)} />
                    <FilterOptions setFulltextFilter={setFulltextFilter} setGamestateFilter={setGamestateFilter} setLastMoveAfter={setLastMoveAfter} setLastMoveBefore={setLastMoveBefore} setCreatedAfter={setCreatedAfter} setCreatedBefore={setCreatedBefore} />

                    <Table>
                        <thead>
                            <tr>
                                <th>Název</th>
                                <th>Hráno</th>
                                <th>Akce</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...(games.filter(x => x.gameState !== "endgame")), ...(games.filter(x => x.gameState === "endgame"))]
                                .filter(x => fulltextFilter ? x.name.toLowerCase().includes(fulltextFilter.toLowerCase()) : true)
                                .filter(x => gamestateFilter ? gamestateFilter === x.gameState : true)
                                .filter(x => lastMoveAfter ? Date.parse(x.updatedAt) > lastMoveAfter.getTime() : true)
                                .filter(x => lastMoveBefore ? Date.parse(x.updatedAt) < lastMoveBefore.getTime() : true)
                                .filter(x => createdAfter ? Date.parse(x.createdAt) > createdAfter.getTime() : true)
                                .filter(x => createdBefore ? Date.parse(x.createdAt) < createdBefore.getTime() : true)
                                .slice((page - 1) * 10, page * 10)
                                .map(x => {
                                if (!x.difficulty) {return null;}

                                const deleteGame = () => {
                                    apiPost('/admin/delete', {
                                        id: x.uuid
                                    }).then(() => {
                                        setGames(games.filter(y => y.uuid !== x.uuid));
                                    });
                                }

                                return <tr key={x.uuid}>
                                    <td>{x.name}</td>
                                    <td>{formatDate(new Date(x.createdAt))}</td>
                                    <td>
                                        <Button variant="plain" onClick={() => startEditGame(x.uuid)}>Upravit</Button>
                                        <Button variant="plain" color="danger" onClick={() => deleteGame()}>Smazat</Button>
                                    </td>
                                </tr>
                            })}
                        </tbody>
                    </Table>
                    <Pagination {...props} page={page} lastPage={lastPage} setPage={x => setPage(x)} />
                </Stack>

                <Modal open={editGameID !== ""} onClose={() => {
                    if (!loading) stopEditGame();
                }}>
                    <ModalDialog>
                        <DialogTitle>Upravit hru</DialogTitle>
                        <ModalClose disabled={loading} />
                        <Stack gap={1}>
                            <Typography>Název hry</Typography>
                            <Input type="text" value={currentGameEditName} onChange={x => setCurrentGameEditName(x.currentTarget.value)} />

                            <Stack direction="row" gap={1}>
                                <Button disabled={loading} onClick={save}>Uložit</Button>
                                <Button disabled={loading} onClick={stopEditGame}>Zrušit</Button>
                            </Stack>
                        </Stack>
                    </ModalDialog>
                </Modal>
            </TabPanel>
        </Tabs>
    </main>
}