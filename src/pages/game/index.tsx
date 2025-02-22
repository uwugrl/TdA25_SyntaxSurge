import {useEffect, useRef, useState} from "react";
import localFont from "next/font/local";
import GameComponent from '@/components/Game/Game';
import React from "react";
import Header from "@/components/Header";
import { apiGet } from "@/components/frontendUtils";
import { Typography } from "@mui/joy";

const dosis = localFont({src: '../fonts/Dosis-VariableFont_wght.ttf'});

export default function Game() {
    const [gameId, setGameId] = useState("");
    const [title, setTitle] = useState("");
    const [board, setBoard] = useState([] as ("X" | "O" | "")[][]);
    const [difficulty, setDifficulty] = useState("medium");

    const [error, setError] = useState("");

    const secondsPassedRef = useRef(0);
    const hasRan = useRef(false);
    const [secondsPassed, setSecondsPassed] = useState(0);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!hasRan.current) {
            hasRan.current = true;
            intervalRef.current = setInterval(() => {
                secondsPassedRef.current = secondsPassedRef.current + 1;
                setSecondsPassed(secondsPassedRef.current);

                apiGet('/game/find').then(x => {
                    const y = x as {status: string};
                    if (y.status === 'matchmaking_game_found') {
                        if (intervalRef.current) clearInterval(intervalRef.current);
                        apiGet('/game/board').then(z => {
                            const game = z as { status: string, gameId: string, name: string, createdAt: string, updatedAt: string, board: ("X" | "O" | "")[][], difficulty: string };
                            console.log(game.status);
        
                            setGameId(game.gameId);
                            setBoard(game.board);
                            setTitle(game.name);
                            setDifficulty(game.difficulty);
                        }).catch(setError);
                    }
                }).catch(setError);
            }, 1000);
        }
    }, []);

    const formatSeconds = () => {
        let minutes = `${Math.floor(secondsPassed / 60)}`;
        if (minutes.length === 1) minutes = `0${minutes}`;
        let seconds = `${secondsPassed % 60}`;
        if (seconds.length === 1) seconds = `0${seconds}`;

        return `${minutes}:${seconds}`;
    }

    return (<>
        <div className={`w-3/4 m-auto ${dosis.className}`}>
            <br/>
            <br/>
            <br/>
            <br/>
            {gameId === "" && <div className="text-center">
                <Typography level="h3">Hledání hry... {formatSeconds()}</Typography>
            </div>}
            {gameId === "" ||
                <GameComponent gameId={gameId} gameTitle={title} board={board} gameDifficulty={difficulty}/>}

            {error && <Typography color="danger">{error}</Typography>}
            <Header />
        </div>
    </>)
}
