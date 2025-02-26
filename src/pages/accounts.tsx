
import React from "react";
import Header from "@/components/Header";
import Metadata from "@/components/Metadata";
import { Button, Dropdown, Input, Link, ListDivider, Menu, MenuButton, MenuItem, Stack, Table } from "@mui/joy";
import { PrismaClient } from "@prisma/client";
import { InferGetServerSidePropsType } from "next";
import { useState } from "react";
import Pagination from '@/components/Pagination';
import { ArrowDropDown, Search } from "@mui/icons-material";
import Footer from "@/components/Footer";


export async function getServerSideProps() {
    const prisma = new PrismaClient();
    await prisma.$connect();

    const users = await prisma.user.findMany({});

    return {
        props: {
            users: users.map(user => ({
                uuid: user.userId,
                name: user.username,
                wins: user.wins,
                losses: user.losses,
                draws: user.draws,
                elo: user.elo
            }))
        }
    }
}

export default function Profile(props: InferGetServerSidePropsType<typeof getServerSideProps>) {

    const [page, setPage] = useState(1);
    const lastPage = Math.ceil(props.users.length / 10);

    const SORT_BY = [
        {
            id: 'eloDesc',
            val: 'ELO sestupně'
        },
        {
            id: 'eloAsc',
            val: 'ELO vzestupně'
        }
    ]

    const [sortBy, setSortBy] = useState("");
    const [fullText, setFullText] = useState("");

    let users = props.users;

    if (sortBy === "eloDesc") {
        users = users.sort((a, b) => b.elo - a.elo);
    }
    if (sortBy === "eloAsc") {
        users = users.sort((a, b) => a.elo - b.elo);
    }

    if (fullText.length > 0) {
        users = users.filter(x => x.name.toLowerCase().includes(fullText.toLowerCase()));
    }

    users = users.slice((page - 1) * 10, page * 10);

    return <>
        <Metadata title={'List účtů'} description={'List účtů ve službě Think different Academy.'} />
        <main className={`w-3/4 m-auto`}>
            <br />
            <br />
            <br />
            <br />
            <br />

            <Stack gap={1}>
                <Pagination {...props} page={page} lastPage={lastPage} setPage={x => setPage(x)} />

                <Stack direction="row" gap={1}>
                    <Dropdown>
                        <MenuButton endDecorator={<ArrowDropDown />}>{sortBy ? SORT_BY.find(x => x.id === sortBy)?.val : 'Seřadit podle'}</MenuButton>
                        <Menu>
                            {sortBy && <>
                                <MenuItem onClick={() => setSortBy("")}>
                                    Odstranit seřazení
                                </MenuItem>
                                <ListDivider />
                            </>}
                            
                            {SORT_BY.map(x => (
                                <MenuItem key={x.id} onClick={() => setSortBy(x.id)}>{x.val}</MenuItem>
                            ))}
                        </Menu>
                    </Dropdown>
            
                <Input value={fullText} onChange={e => setFullText(e.target.value)} placeholder="Hledat..." startDecorator={<Search />} />
                </Stack>

                <Table>
                    <thead>
                        <tr>
                            <th>Název</th>
                            <th>ELO</th>
                            <th>W/D/L</th>
                            <th>Akce</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(x => (
                            <tr key={x.uuid}>
                                <td>{x.name}</td>
                                <td>{x.elo}</td>
                                <td>{`${x.wins}/${x.draws}/${x.losses}`}</td>
                                <td>
                                    <Link href={`/account/${x.uuid}`}><Button variant="plain">Zobrazit uživatele</Button></Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    
                </Table>
                <Pagination {...props} page={page} lastPage={lastPage} setPage={x => setPage(x)} />
            </Stack>


            <Header />
            <Footer />
        </main>
    </>
}