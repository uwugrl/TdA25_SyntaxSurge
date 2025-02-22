import {fromDbBoard, fromDbDifficulty} from "@/components/fromDB";
import {PrismaClient, User} from "@prisma/client";
import {GetServerSidePropsContext, InferGetServerSidePropsType} from "next";
import GameBoard from "@/components/Game/GameBoard";
import localFont from "next/font/local";
import {determineGameState, evalWinner} from "@/components/gameUtils";
import Metadata from "@/components/Metadata";
import React from "react";
import Header from "@/components/Header";
import { Card, CardContent, Stack, Typography } from "@mui/joy";


export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    const uuid = ctx.params?.uuid as string;
    if (!uuid) {
        return {
            notFound: true
        }
    }

    const prisma = new PrismaClient(),
     game = await prisma.game.findUnique({
        where: {
            id: uuid
        }, include: {
            board: true
        }
    });

    // Game: {id, x, y, state, gameID}[]

    if (!game) {
        return {
            notFound: true
        }
    }

    const board: ("X" | "O" | "")[][] = fromDbBoard(game.board),
     difficulty = fromDbDifficulty(game.difficulty);

    // Identify what symbol should be next for the game

    const winner = evalWinner(fromDbBoard(game.board));
    let winnerUser: User | null = null;
    if (winner === "X") {
        winnerUser = await prisma.user.findFirst({where: {userId: game.player1ID ?? ''}}); 
    } else if (winner === 'O') {
        winnerUser = await prisma.user.findFirst({where: {userId: game.player2ID ?? ''}});
    }

    if (!winnerUser) return { notFound: true }

    await prisma.$disconnect();
    return {
        props: {
            game: {
                uuid: game.id,
                name: game.name,
                createdAt: game.createdAt.toISOString(),
                updatedAt: game.updatedAt.toISOString(),
                difficulty,
                board,
                gameState: determineGameState(board),
                winner: {
                    username: winnerUser.username
                }
            }
        }
    }
}

const dosis = localFont({src: '../../fonts/Dosis-VariableFont_wght.ttf'});

export default function ViewSavedGame(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const winner = evalWinner(props.game.board, 5);

    return <>
        <Metadata title={props.game.name} description={'Hrajte piškvorky na Think different Academy ještě dnes!'}/>
        <main className={`w-3/4 m-auto ${dosis.className}`}>
            <Header />
            {[1,2,3,4,5].map(x => <br key={x}/>)}
            <Typography level="h1">{`Hra: ${props.game.name}`}</Typography>
            <GameBoard board={props.game.board}/>

            {[1,2].map(x => <br key={x} />)}

            <Card>
                <CardContent>
                    <Stack gap={1}>
                        <Typography level="h3">Stav hry</Typography>
                        {props.game.gameState === 'opening' && <Typography>Hra právě začala.</Typography>}
                        {props.game.gameState === 'midgame' && <Typography>Hra probíhá.</Typography>}
                        {winner === "" || <Stack direction="row" gap={1}>
                            <Typography alignSelf="center">{`Hra skončila. Hru vyhrál/a ${props.game.winner.username}`}</Typography>
                        </Stack>}
                    </Stack>
                </CardContent>
            </Card>
        </main>
    </>
}
