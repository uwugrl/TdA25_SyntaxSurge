import {fromDbBoard, fromDbDifficulty} from "@/components/fromDB";
import {PrismaClient} from "@prisma/client";
import {GetServerSidePropsContext, InferGetServerSidePropsType} from "next";
import GameBoard from "@/components/Game/GameBoard";
import localFont from "next/font/local";
import {determineGameState, evalWinner} from "@/components/gameUtils";
import Image from "next/image";
import Metadata from "@/components/Metadata";
import {useRouter} from "next/router";
import React from "react";
import Header from "@/components/Header";
import { Button, Card, CardContent, Stack, Typography } from "@mui/joy";


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
                gameState: determineGameState(board)
            }
        }
    }
}

const dosis = localFont({src: '../../fonts/Dosis-VariableFont_wght.ttf'});

export default function ViewSavedGame(props: InferGetServerSidePropsType<typeof getServerSideProps>) {

    const router = useRouter();

    const winner = evalWinner(props.game.board, 5);

    const getWinnerImage = () => {
        switch (winner) {
            case "X":
                return <Image src={'/Icon/X_cervene.svg'} alt={'X'} width={16} height={16}/>;
            case "O":
                return <Image src={'/Icon/O_modre.svg'} alt={'O'} width={16} height={16}/>;
            case "":
                return null;
        }
    }

    const takeOverGame = () => {
        localStorage.setItem("game", props.game.uuid);
        router.push('/game');
    }

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
                            <Typography alignSelf="center">Hra skončila. Hru vyhráli</Typography>
                            {getWinnerImage()}
                        </Stack>}

                        {props.game.gameState !== 'endgame' && <>
                            <Typography color="danger">Převzít hru:</Typography>
                            <Button onClick={takeOverGame} color="danger">Převzít hru</Button>
                            <Typography fontSize="sm">Můžete převzít hru. Kliknutím na tlačítko převzetí hry můžete pokračovat hrát v této konkrétní hře</Typography>
                        </>}
                    </Stack>
                </CardContent>
            </Card>
        </main>
    </>
}
