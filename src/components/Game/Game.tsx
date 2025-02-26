import GameBoard from "@/components/Game/GameBoard";
import {useEffect, useRef, useState} from "react";
import {evalWinner} from "@/components/gameUtils";
import {useRouter} from "next/router";
import Link from "next/link";
import { apiGet, apiPost } from "../frontendUtils";

import React from "react";
import { Avatar, Button, Stack, Typography } from "@mui/joy";

export default function Game(params: {
    gameId: string, gameTitle: string, board: ("X" | "O" | "")[][], gameDifficulty: string
}) {

    const gameRef = useRef<("X" | "O" | "")[][]>(params.board); //nesnasim react

    const [game, setGame] = useState(params.board);
    const [winner, setWinner] = useState<("X" | "O" | "")>(evalWinner(gameRef.current, 5));

    const [isLoaded, setIsLoaded] = useState(true);
    const [error, setError] = useState("");

    const [onMove, setOnMove] = useState(false);
    const [hasWon, setHasWon] = useState(false);

    const [player1Name, setPlayer1Name] = useState('');
    const [player2Name, setPlayer2Name] = useState('');

    const hasRan = useRef(false);

    useEffect(() => {
        if (!hasRan.current) {
            hasRan.current = true;

            setInterval(() => {
                apiGet('/game/board').then(z => {
                    const game = z as { status: string, gameId: string, name: string, createdAt: string, updatedAt: string, board: ("X" | "O" | "")[][], difficulty: string, onMove: boolean, winner: boolean, player1: string, player2: string };
                    console.log(game.status);

                    setGame(game.board);
                    gameRef.current = game.board;
                    setWinner(evalWinner(game.board, 5));
                    setOnMove(game.onMove);
                    setHasWon(game.winner);
                    setPlayer1Name(game.player1);
                    setPlayer2Name(game.player2);
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
        location.href = '/game';
    }

    const mainMenu = () => {
        localStorage.removeItem("game");
        router.push('/');
    }

    return (<>
        <div className="m-auto">
            <Typography level="h1">
                <Stack direction="row" gap={1} alignItems="center">
                    <Avatar>{player1Name[0]}</Avatar>
                    <Typography>{player1Name}</Typography>
                    vs
                    <Avatar>{player2Name[0]}</Avatar>
                    <Typography>{player2Name}</Typography>
                </Stack>
            </Typography>
        </div>

        {winner === "" && (
            <>
                {onMove ? <Typography fontSize="20px" color="success">Hraješ!</Typography> : <Typography fontSize="20px">Hraje protihráč...</Typography>}
            </>
        )}
        {winner === "" || (
            <>
                <Stack gap={1}>
                    <Stack direction="row" gap={1}>
                        <Typography level="h3" alignSelf="center">{hasWon ? 'Vyhrál jsi!' : 'Prohrál jsi.'}</Typography>
                    </Stack>
                    <Stack direction="row" gap={1}>
                        <Button onClick={newGame}>Nová hra</Button>
                        <Button onClick={mainMenu}>Hlavní menu</Button>
                    </Stack>
                </Stack>
            </>
        )}

        {error && <Typography color="danger">{error}</Typography>}

        <GameBoard allowInteract={isLoaded} board={game} interact={handleInteraction}/>

        {[0, 1].map((x) => <br key={x}/>)}

        <br/>

        <Link href={'/'}>
            <Button>Zpět do menu</Button>
        </Link>

        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((x) => <br key={x}/>)}
    </>)
}
