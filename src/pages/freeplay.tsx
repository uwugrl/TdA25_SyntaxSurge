import React from "react";
import Metadata from "@/components/Metadata";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { Button, Input, Stack, Typography } from "@mui/joy";
import Header from "@/components/Header";
import { apiGet, apiPost } from "@/components/frontendUtils";
import Footer from "@/components/Footer";
import GameBoard from "@/components/Game/GameBoard";
import { evalWinner, getNextSymbol } from "@/components/gameUtils";

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    const { game } = ctx.query as {game: string};

    let placing = 'X';
    if (game) placing = 'O'; 

    return {
        props: {
            placing,
            game: game ?? ''
        }
    }
}

function CreateGame(props: {
    loading: boolean,
    gameName: string,
    gameCode: string,
    setGameName: (value: string) => void,
    setGameCode: (value: string) => void,
    error: string,
    createGame: () => void,
    joinGame: () => void
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
                <Button color="success" disabled={props.loading} onClick={props.createGame}>Založit</Button>
            </Stack>
            <Stack gap={1}>
                <Typography level="h1" fontSize={"60px"}>Připoj!</Typography>
                <br />
                <Typography>Kód hry</Typography>
                <br />
                <Input disabled={props.loading} type="text" value={props.gameCode} onChange={x => {props.setGameCode(x.currentTarget.value)}} placeholder="Zadejte kód hry..."/>
                
                <br />
                <Button color="success" disabled={props.loading} onClick={props.joinGame}>Připojit</Button>
            </Stack>
        </div>
        {props.error && <Typography color="danger">{props.error}</Typography>}
    </Stack>
}

export default function Freeplay(props: InferGetServerSidePropsType<typeof getServerSideProps>) {

    const whoIsPlaying = React.useRef(props.placing);

    const [board, setBoard] = React.useState([] as ("X" | "O" | "")[][]);
    const boardRef = React.useRef<("X" | "O" | "")[][]>([]);

    const [gameName, setGameName] = React.useState('');
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const [gameCode, setGameCode] = React.useState('');

    const [isplaying, setIsplaying] = React.useState(props.placing === 'O');

    const [isCurrentlyPlaying, setIsCurrentlyPlaying] = React.useState(false);

    const createGame = () => {
        setLoading(true);
        apiPost('/freeplay/create', {
            gameName
        }).then(x => {
            const { code } = x as { code: string };
            
            setInterval(() => {
                apiGet(`/freeplay/board?gameCode=${code}`).then(x => {
                    const y = x as { board: ("X" | "O" | "")[][], name: string}
                    setBoard(y.board);
                    boardRef.current = y.board;
                    setGameName(y.name);
                    setIsplaying(true);
                    setGameCode(code);
                    setLoading(false);
                    setIsCurrentlyPlaying(getNextSymbol(boardRef.current) === whoIsPlaying.current);
                }).catch(x => {
                    setError(x);
                    setLoading(false);
                });
            }, 100);
        }).catch(x => {
            setError(x);
            setLoading(false);
        });
    }

    const joinGame = () =>{
        setError("");
        apiGet(`/freeplay/board?gameCode=${gameCode}`).then(x => {            
            const y = x as { board: ("X" | "O" | "")[][], name: string}

            setBoard(y.board);
            boardRef.current = y.board;
            setIsplaying(true);
            setLoading(false);
            whoIsPlaying.current = 'O';

            setInterval(() => {
                apiGet(`/freeplay/board?gameCode=${gameCode}`).then(x => {
                    const y = x as { board: ("X" | "O" | "")[][], name: string}
                    setBoard(y.board);
                    boardRef.current = y.board;
                    setGameName(y.name);
                    setIsplaying(true);
                    setGameCode(gameCode);
                    setLoading(false);
                }).catch(x => {
                    setError(x);
                    setLoading(false);
                });
            }, 100);
        }).catch(x => {
            setError(x);
        })
    }

    function handleInteraction(x: number, y: number) {
        setError("");
        console.log(boardRef.current, x, y);
          
        if (boardRef.current[y][x] !== "") {
            setError("Toto políčko není prázdné!");
            return;
        }

        if (evalWinner(boardRef.current, 5) !== "") {
            setError("Hra už byla dohrána!");
            return;
        }

        console.log(getNextSymbol(boardRef.current), whoIsPlaying.current);
        if (getNextSymbol(boardRef.current) !== whoIsPlaying.current) {
            setError("Nehraješ!");
            return;
        }

        setError("");
        setLoading(true);

        apiPost(`/freeplay/board?gameCode=${gameCode}`, {
            x,
            y
        }).then(() => {
            setLoading(false);
        }).catch(e => {
            setLoading(false);
            setError(e);
        })
    }

    return <>
        <Metadata title={`Volná hra`} description={'Zahrajte si hru piškvorek bez účtu!'}/>
        <main className={`w-2/3 m-auto`}>
            <Header />
            {[1,2,3,4,5].map(x => <br key={x}/>)}

            {isplaying || <CreateGame gameName={gameName} setGameName={setGameName} createGame={createGame} joinGame={joinGame}
            error={error} loading={loading} gameCode={gameCode} setGameCode={setGameCode} />}

            {(isplaying && board.length !== 0) && <div className="text-center">
                <Typography level="h1">{gameName}</Typography>
                <Typography>Kód hry: {gameCode}</Typography>
                <Typography color={isCurrentlyPlaying ? "success" : "neutral"}>{isCurrentlyPlaying ? 'Hraješ!' : "Hraje protihráč..."}</Typography>
                {evalWinner(board, 5) === '' || <>
                    {evalWinner(board, 5) === whoIsPlaying.current && <Typography fontSize={"60px"} color="success">Vyhrál jsi!</Typography>}
                    {evalWinner(board, 5) !== whoIsPlaying.current && <Typography fontSize={"60px"} color="danger">Prohrál jsi!</Typography>}
                </>}
                <br />
                {error && <Typography color="danger">{error}</Typography>}
                <GameBoard board={board} allowInteract={!loading} interact={handleInteraction} />
            </div>}

            <br />
            <br />

            <Footer />

            {[1,2,3].map(x => <br key={x}/>)}
        </main>
    </>
}
