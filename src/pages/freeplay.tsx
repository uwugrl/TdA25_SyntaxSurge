import React from "react";
import Metadata from "@/components/Metadata";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { Button, Input, Stack, Typography } from "@mui/joy";
import Header from "@/components/Header";
import { apiPost } from "@/components/frontendUtils";
import Footer from "@/components/Footer";

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    // const { game } = ctx.query as {game: string};

    return {
        props: {
            placing: 'X'
        }
    }
}

function CreateGame(props: {
    loading: boolean,
    gameName: string,
    gameCode: string,
    setGameName: (value: string) => void,
    setGameCode: (value: string) => void,
    error: string
}) {
    return <Stack gap={1}>
        <div className="grid grid-cols-2 w-full text-center gap-40 lg:gap-64 mt-24">
            <Stack gap={1}>
                <Typography level="h1" fontSize={"60px"}>Založ!</Typography>
                <br />
                <Typography>Jméno hry</Typography>
                <br />
                <Input disabled={props.loading} type="text" value={props.gameName} onChange={x => {props.setGameName(x.currentTarget.value)}} placeholder="Zadejte jméno hry..."/>
                
                <br />
                <Button disabled={props.loading}>Založit</Button>
            </Stack>
            <Stack gap={1}>
                <Typography level="h1" fontSize={"60px"}>Připoj!</Typography>
                <br />
                <Typography>Kód hry</Typography>
                <br />
                <Input disabled={props.loading} type="text" value={props.gameCode} onChange={x => {props.setGameCode(x.currentTarget.value)}} placeholder="Zadejte kód hry..."/>
                
                <br />
                <Button disabled={props.loading}>Připojit</Button>
            </Stack>
        </div>
        {props.error && <Typography color="danger">{props.error}</Typography>}
    </Stack>
}

export default function Freeplay(props: InferGetServerSidePropsType<typeof getServerSideProps>) {

    const [gameName, setGameName] = React.useState('');
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const [gameCode, setGameCode] = React.useState('');

    const createGame = () => {

    }

    return <>
        <Metadata title={`Volná hra`} description={'Zahrajte si hru piškvorek bez pravidel!'}/>
        <main className={`w-2/3 m-auto`}>
            <Header />
            {[1,2,3,4,5].map(x => <br key={x}/>)}
 
            <CreateGame gameName={gameName} setGameName={setGameName} 
            error={error} loading={loading} gameCode={gameCode} setGameCode={setGameCode} />

            <br />
            <br />

            <Footer />

            {[1,2,3].map(x => <br key={x}/>)}
        </main>
    </>
}
