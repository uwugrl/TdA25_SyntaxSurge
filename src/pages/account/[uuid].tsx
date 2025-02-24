
import React from "react";
import Header from "@/components/Header";
import Metadata from "@/components/Metadata";
import { Typography } from "@mui/joy";
import { PrismaClient } from "@prisma/client";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";


export async function getServerSideProps(ctx:GetServerSidePropsContext) {
    const { uuid } = ctx.params as {uuid: string};

    const prisma = new PrismaClient();
    await prisma.$connect();

    const user = await prisma.user.findFirst({ where: {userId: uuid} });
    if (!user) return { notFound: true };

    return {
        props: {
            name: user.username,
            wins: user.wins,
            losses: user.losses,
            draws: user.draws,
            elo: user.elo
        }
    }
}

export default function Profile(props: InferGetServerSidePropsType<typeof getServerSideProps>) {


    return <>
        <Metadata title={'Účet'} description={'Profil uživatele'}/>
        <main className={`w-3/4 m-auto`}>
            <br/>
            <br/>
            <br/>
            <br/>
            <br/>

            <Typography level="h1" textAlign="center">{props.name}</Typography>
            <Typography>{`ELO: ${props.elo}`}</Typography>
            <Typography>{`${props.wins} výher, ${props.losses} proher a ${props.draws} remíz`}</Typography>

            <Header />
        </main>
    </>
}