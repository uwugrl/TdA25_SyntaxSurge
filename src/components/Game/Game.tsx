import GameBoard from "@/components/Game/GameBoard";
import {useRef, useState} from "react";
import {evalWinner, getNextSymbol} from "@/components/gameUtils";
import Image from "next/image";
import {useRouter} from "next/router";
import Link from "next/link";

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

    function handleInteraction(x: number, y: number) {
        if (game[x][y] !== "") {
            console.log(`Skipping element at ${x}, ${y}: "${game[y][x]}" is not ""`);
            return;
        }

        if (evalWinner(gameRef.current, 5) !== "") {
            console.log(`Game was already won by ${evalWinner(gameRef.current, 5)}`);
            return;
        }

        setIsLoaded(false);

        const next = [...gameRef.current];
        next[y][x] = getNextSymbol(game);
        setNextMove(getNextSymbol(next));
        setWinner(evalWinner(next, 5));
        fetch(`/api/v1/games/${params.gameId}`, {
            method: "PUT", headers: {
                "Content-Type": "application/json"
            }, body: JSON.stringify({
                name: params.gameTitle, difficulty: params.gameDifficulty, board: next
            })
        }).then(() => {
            setIsLoaded(true);
        })

        gameRef.current = next;
        setGame(next);
    }

    const getWinnerImage = () => {
        const winner = evalWinner(gameRef.current, 5);

        switch (winner) {
            case "X":
                return <Image src={'/Icon/X_cervene.svg'} alt={'X'} width={24} height={24}/>;
            case "O":
                return <Image src={'/Icon/O_modre.svg'} alt={'O'} width={24} height={24}/>;
            case "":
                return null;
        }
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

        {[0, 1].map((x) => <br key={x}/>)}

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
                        <Typography level="h3" alignSelf="center">Hru vyhráli </Typography>
                        {getWinnerImage()}
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
