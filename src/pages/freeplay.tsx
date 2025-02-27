import React from "react";
import Metadata from "@/components/Metadata";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { PrismaClient } from "@prisma/client";
import { Button, Input, Stack, Typography } from "@mui/joy";
import Header from "@/components/Header";
import { apiPost } from "@/components/frontendUtils";

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    const { game } = ctx.query as {game: string};

    const prisma = new PrismaClient();
    const gameCode = await prisma.matchmaking.findFirst({where: { 
        code: game
    }, include: {
        player1: true
    }});

    if (gameCode) {
        return {
            props: {
                friendGame: true,
                friendCode: gameCode.code,
                otherPlayerName: gameCode.player1.username
            }
        }
    }

    return {
        notFound: true
    }
}

export default function Freeplay(props: InferGetServerSidePropsType<typeof getServerSideProps>) {

    const [username, setUsername] = React.useState('');
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [isCorrect, setIsCorrect] = React.useState(false);

    const submit = () => {
        setLoading(true);
        apiPost('/game/tempgame', {
            username
        }).then(() => {
            apiPost('/game/find', {
                code: props.friendCode
            }).then(() => {
                location.href = '/game';
                setLoading(false);
            }).catch(x => {
                setError(x);
                setLoading(false);
            });
        }).catch(x => {
            setError(x);
            setLoading(false);
        });
    }

    const validate = () => {
        setIsCorrect(username.length > 4 && username.length < 16);
    }
    

    return <>
        <Metadata title={`${props.otherPlayerName} tě vyzval na hru piškvorek!`} description={'Zahrajte si hru piškvorek v Think different Academy dnes se svým kamarádem!'}/>
        <main className={`w-3/4 m-auto`}>
            <Header />
            {[1,2,3,4,5].map(x => <br key={x}/>)}

            <Stack gap={1}>
                <Typography level="h1">{`${props.otherPlayerName} tě vyzval na hru piškvorek!`}</Typography>
                <Typography>Uživatelské jméno</Typography>
                <Input disabled={loading} type="text" value={username} onChange={x => {setUsername(x.currentTarget.value); validate()}} placeholder="Uživatelské jméno..."/>
                
                <Button onClick={submit} disabled={loading || !isCorrect}>Spustit hru!</Button>
                {error && <Typography color="danger">{error}</Typography>}
            </Stack>

            {[1,2,3].map(x => <br key={x}/>)}
        </main>
    </>
}
