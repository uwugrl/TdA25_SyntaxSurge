import GameBoard from "@/components/Game/GameBoard";
import {useEffect, useRef, useState} from "react";
import {evalWinner} from "@/components/gameUtils";
import Link from "next/link";
import { apiGet, apiPost } from "../frontendUtils";

import React from "react";
import { Button, Stack, Typography } from "@mui/joy";

export default function Game(params: {
    gameId: string, gameTitle: string, board: ("X" | "O" | "")[][], gameDifficulty: string
}) {

    const [gameName, setGameName] = useState('');

    const gameRef = useRef<("X" | "O" | "")[][]>(params.board); //nesnasim react
    const gameId = useRef('');

    const [game, setGame] = useState(params.board);
    const [winner, setWinner] = useState<("X" | "O" | "")>(evalWinner(gameRef.current, 5));

    const [isLoaded, setIsLoaded] = useState(true);
    const [error, setError] = useState("");

    const [onMove, setOnMove] = useState(false);
    const [hasWon, setHasWon] = useState(false);

    const [player1Time, setPlayer1Time] = useState('');
    const [player2Time, setPlayer2Time] = useState('');

    const [explicitWin, setExplicitWin] = useState(false);

    const hasRan = useRef(false);

    const formatPlayerTime = (time: number) => {
        const minutes = (Math.floor(time / 60)).toString();
        const seconds = (~~(time % 60)).toString();

        if (seconds.length === 1) {
            return `${minutes}:0${seconds}`;
        }
        return `${minutes}:${seconds}`;
    }

    useEffect(() => {
        if (!hasRan.current) {
            hasRan.current = true;

            setInterval(() => {
                apiGet('/game/board').then(z => {
                    const game = z as { 
                        status: string, 
                        gameId: string, 
                        name: string, 
                        createdAt: string, 
                        updatedAt: string, 
                        board: ("X" | "O" | "")[][], 
                        difficulty: string, 
                        onMove: boolean, 
                        winner: boolean,
                        p1LeftTime: number,
                        p2LeftTime: number,
                        explicitEnd: boolean
                    };
                    console.log(game.status);

                    setGame(game.board);
                    setGameName(game.name);
                    gameRef.current = game.board;
                    gameId.current = game.gameId;
                    setWinner(evalWinner(game.board, 5));
                    setOnMove(game.onMove);
                    setHasWon(game.winner);
                    setPlayer1Time(formatPlayerTime(game.p1LeftTime));
                    setPlayer2Time(formatPlayerTime(game.p2LeftTime));
                    setExplicitWin(game.explicitEnd);
                });
            }, 200);
        }
    });

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

    const newGame = () => {
        localStorage.removeItem("game");
        apiPost('/game/find', {
            code: gameId.current
        }).then(() => {
            location.href = '/game';
        });
    }

    const mainMenu = () => {
        localStorage.removeItem("game");
        location.href = '/';
    }

    return (<>
        <div className="m-auto">
            <Typography level="h1" textAlign="center">
                {gameName}
            </Typography>
        </div>

        {(winner === "" && !explicitWin) && (
            <>
                <div className="flex flex-row justify-between">
                    <Typography fontSize={'24px'} fontWeight={'bold'}>{player1Time}</Typography>
                    <Typography fontSize={'24px'} fontWeight={'bold'}>{player2Time}</Typography>
                </div>
                {onMove ? <Typography fontSize="20px" color="success">Hraješ!</Typography> : <Typography fontSize="20px">Hraje protihráč...</Typography>}
            </>
        )}
        {(winner === "" && !explicitWin) || (
            <>
                <Stack gap={1}>
                    <Stack direction="row" gap={1}>
                        <Typography level="h3" alignSelf="center">{hasWon ? 'Vyhrál jsi!' : 'Prohrál jsi.'}</Typography>
                    </Stack>
                    <Stack direction="row" gap={1}>
                        <Button size="lg" onClick={newGame}>Hrát znovu s aktuálním hráčem</Button>
                        <Button size="lg" onClick={mainMenu}>Hlavní menu</Button>
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
