import GameBoard from "@/components/Game/GameBoard";
import {useEffect, useRef, useState} from "react";
import {evalWinner, getNextSymbol} from "@/components/gameUtils";
import {useRouter} from "next/router";
import Link from "next/link";
import { apiGet, apiPost } from "../frontendUtils";

import React from "react";
import { Button, Card, Stack, Typography } from "@mui/joy";

export default function Game(params: {
    gameId: string, gameTitle: string, board: ("X" | "O" | "")[][], gameDifficulty: string
}) {

    const gameRef = useRef<("X" | "O" | "")[][]>(params.board); //nesnasim react

    const [game, setGame] = useState(params.board);
    const [nextMove, setNextMove] = useState<("X" | "O" | "")>(getNextSymbol(gameRef.current));
    const [winner, setWinner] = useState<("X" | "O" | "")>(evalWinner(gameRef.current, 5));

    const [isLoaded, setIsLoaded] = useState(true);
    const [error, setError] = useState("");

    const [onMove, setOnMove] = useState(false);
    const [hasWon, setHasWon] = useState(false);

    const hasRan = useRef(false);

    useEffect(() => {
        if (!hasRan.current) {
            hasRan.current = true;

            setInterval(() => {
                apiGet('/game/board').then(z => {
                    const game = z as { status: string, gameId: string, name: string, createdAt: string, updatedAt: string, board: ("X" | "O" | "")[][], difficulty: string, onMove: boolean, winner: boolean };
                    console.log(game.status);

                    setGame(game.board);
                    gameRef.current = game.board;
                    setNextMove(getNextSymbol(game.board));
                    setWinner(evalWinner(game.board, 5));
                    setOnMove(game.onMove);
                    setHasWon(game.winner);
                });
            }, 200);
        }
    })

    function handleInteraction(x: number, y: number) {
        if (game[y][x] !== "") {
            console.log(`Skipping element at ${x}, ${y}: "${game[y][x]}" is not ""`);
            return;
        }

        if (evalWinner(gameRef.current, 5) !== "") {
            console.log(`Game was already won by ${evalWinner(gameRef.current, 5)}`);
            return;
        }

        setError("");
        setIsLoaded(false);

        apiPost('/game/board', {
            x,
            y
        }).then(() => {
            setIsLoaded(false);
        }).catch(e => {
            setIsLoaded(false);
            setError(e);
        })
    }

    const router = useRouter();

    const newGame = () => {
        localStorage.removeItem("game");
        router.reload();
    }

    const mainMenu = () => {
        localStorage.removeItem("game");
        router.push('/');
    }

    return (<>
        <h1 className={'text-3xl text-center font-bold'}>{params.gameTitle}</h1>
        <GameBoard allowInteract={isLoaded} board={game} interact={handleInteraction}/>
        {error && <Typography color="danger">{error}</Typography>}

        {[0, 1].map((x) => <br key={x}/>)}

        {onMove && <Typography>Hraješ!</Typography>}

        {winner === "" && (
            <>
                <Card>
                    <Stack direction='row' gap={1}>
                        <Typography level="h3">Na tahu je:</Typography>
                        {nextMove === "X" && <img src='/Icon/X_cervene.svg' alt='X' width={32} height={32}/>}
                        {nextMove === "O" && <img src='/Icon/O_modre.svg' alt='O' width={32} height={32}/>}
                    </Stack>
                </Card>
            </>
        )}
        {winner === "" || (
            <>
                <Card>
                    <Stack direction="row" gap={1}>
                        <Typography level="h3" alignSelf="center">{hasWon ? 'Vyhrál jsi!' : 'Prohrál jsi.'}</Typography>
                    </Stack>
                    <Stack direction="row" gap={1}>
                        <Button onClick={newGame}>Nová hra</Button>
                        <Button onClick={mainMenu}>Hlavní menu</Button>
                    </Stack>
                </Card>
            </>
        )}


        <br/>

        <Link href={'/'}>
            <Button>Zpět do menu</Button>
        </Link>

        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((x) => <br key={x}/>)}
    </>)
}
