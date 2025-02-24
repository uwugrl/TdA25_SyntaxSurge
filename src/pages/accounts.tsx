
import React from "react";
import Header from "@/components/Header";
import Metadata from "@/components/Metadata";
import { Button, Card, Link, Stack, Typography } from "@mui/joy";
import { PrismaClient } from "@prisma/client";
import { InferGetServerSidePropsType } from "next";
import { useState } from "react";
import Pagination from '@/components/Pagination';


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

    return <>
        <Metadata title={'List účtů'} description={'List účtů ve službě Think different Academy.'} />
        <main className={`w-3/4 m-auto`}>
            <br />
            <br />
            <br />
            <br />
            <br />

            <Pagination {...props} page={page} lastPage={lastPage} setPage={x => setPage(x)} />

            <Stack gap={1}>
                {props.users
                    .slice((page - 1) * 10, page * 10)
                    .map((x, i) => (
                    <Card key={i}>
                        <Typography level='h2'>{x.name}</Typography>
                        <Link href={`/account/${x.uuid}`}>
                            <Button variant="outlined" color="neutral">
                                Zobrazit profil
                            </Button>
                        </Link>
                    </Card>
                ))}
            </Stack>

            <Pagination {...props} page={page} lastPage={lastPage} setPage={x => setPage(x)} />

            <Header />
        </main>
    </>
}