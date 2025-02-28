import GameBoard from "@/components/Game/GameBoard";
import {useEffect, useRef, useState} from "react";
import {evalWinner} from "@/components/gameUtils";
import { apiGet, apiPost } from "../frontendUtils";

import React from "react";
import { Button, Stack, Typography } from "@mui/joy";

export default function Game(params: {
    gameId: string, gameTitle: string, board: ("X" | "O" | "")[][], gameDifficulty: string
}) {
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

    const [player1, setPlayer1] = useState('');
    const [player2, setPlayer2] = useState('');

    const [player1ID, setPlayer1ID] = useState('');
    const [player2ID, setPlayer2ID] = useState('');

    const [player1Elo, setPlayer1Elo] = useState(0);
    const [player2Elo, setPlayer2Elo] = useState(0);

    const [explicitWin, setExplicitWin] = useState(0);

    const [suggestDraw, setSuggestDraw] = useState(false);
    const [suggestedDraw, setSuggestedDraw] = useState(false);

    const suggestedDrawState = useRef(false);

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
                        player1: string,
                        player2: string,
                        player1ID: string,
                        player2ID: string,
                        player2Elo: number,
                        player1Elo: number,
                        p1LeftTime: number,
                        p2LeftTime: number,
                        explicit: number,
                        suggestDraw: boolean
                    };
                    console.log(game.status);

                    setGame(game.board);
                    gameRef.current = game.board;
                    gameId.current = game.gameId;
                    setWinner(evalWinner(game.board, 5));
                    setOnMove(game.onMove);
                    setHasWon(game.winner);
                    setPlayer1(game.player1);
                    setPlayer2(game.player2);
                    setPlayer1ID(game.player1ID);
                    setPlayer2ID(game.player2ID);
                    setPlayer1Elo(game.player1Elo);
                    setPlayer2Elo(game.player2Elo);
                    setPlayer1Time(formatPlayerTime(game.p1LeftTime));
                    setPlayer2Time(formatPlayerTime(game.p2LeftTime));
                    setExplicitWin(game.explicit);
                    setSuggestDraw(game.suggestDraw);
                
                    if (suggestedDrawState.current && !game.suggestDraw) {
                        setSuggestedDraw(false);
                        suggestedDrawState.current = false;
                    }
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

    const giveUp = () => {
        if (winner === "" && explicitWin === 0) {
            apiGet('/game/giveup');
        } else {
            location.href = '/';
        }
    }

    const suggestDrawFunc = () => {
        apiPost('/game/draw', {
            reqType: 'suggest'
        }).then(() => {
            setSuggestedDraw(true);
            suggestedDrawState.current = true;
        }).catch(x => {
            setError(x);
        });
    }

    const acceptDraw = () => {
        apiPost('/game/draw', {
            reqType: 'accept'
        });
    }

    const declineDraw = () => {
        apiPost('/game/draw', {
            reqType: 'decline'
        }).then(() => {
            setSuggestDraw(false);
            suggestedDrawState.current = false;
        });
    }

    const cancelDraw = () => {
        apiPost('/game/draw', {
            reqType: 'cancel'
        }).then(() => {
            setSuggestedDraw(false);
            setSuggestDraw(false);
            suggestedDrawState.current = false;
        });
    }

    return (<>
        {(winner === "" && explicitWin === 0) && (
            <>
                <div className="flex flex-row justify-around">
                </div>
                {onMove ? <Typography fontSize="30px" color="success" textAlign={"center"}>Hraješ!</Typography> : <Typography fontSize="30px" textAlign={"center"}>Hraje protihráč...</Typography>}
            </>
        )}
        {(winner === "" && explicitWin === 0) || (
            <div className="flex items-center flex-col text-center">
                <Stack gap={1}>
                    {explicitWin === 2 ? <>
                        <Typography level="h3">Remíza.</Typography>
                    </> : <>
                        <Typography level="h3" fontSize={"80px"}>{hasWon ? 'Vyhrál jsi!' : 'Prohrál jsi.'}</Typography>
                    </>}
                    <Button size="lg" onClick={newGame}>Hrát znovu s aktuálním hráčem</Button>
                    <br />
                </Stack>
            </div>
        )}

        {error && <Typography color="danger" className="text-center my-2">{error}</Typography>}

        <Stack direction={"row"} gap={1}>
            <div className="flex items-center">
                <Stack gap={1} className="mx-auto text-center w-56">
                    <img src="/Icon/X_cervene.svg" alt="X" width={100} height={100} className="self-center mb-8" />
                    <a href={`/account/${player1ID}`} target="_blank" rel="noreferrer">
                        <Typography fontSize={"40px"}>{player1}</Typography>
                    </a>
                    {(winner === "" && explicitWin === 0) && (
                        <>
                            <Typography fontSize={'36px'} fontWeight={'bold'}>{player1Time}</Typography>
                            <br />
                            <Typography fontSize={'32px'}>{`ELO: ${player1Elo}`}</Typography>
                        </>
                    )}
                </Stack>
            </div>
            <GameBoard allowInteract={isLoaded} board={game} interact={handleInteraction}/>
            <div className="flex items-center">
                <Stack gap={1} className="mx-auto text-center w-56">
                    <img src="/Icon/O_modre.svg" alt="O" width={100} height={100} className="self-center mb-8" />
                    <a href={`/account/${player2ID}`} target="_blank" rel="noreferrer">
                        <Typography fontSize={"40px"}>{player2}</Typography>
                    </a>
                    {(winner === "" && explicitWin === 0) && (
                        <>
                            <Typography fontSize={'36px'} fontWeight={'bold'}>{player2Time}</Typography>
                            <br />
                            <Typography fontSize={'32px'}>{`ELO: ${player2Elo}`}</Typography>
                        </>
                    )}
                </Stack>
            </div>
        </Stack>

        <br />
        <br />
        <br />

        {(winner === "" && explicitWin === 0) && (
            <Stack gap={1} className="w-[400px] mx-auto">
                {(suggestDraw || suggestedDraw) || <Button onClick={suggestDrawFunc} className="w-[400px] mx-auto">Navrhnout remízu</Button>}
                {suggestedDraw && <>
                    <Typography className="self-center">Navrhl jsi remízu</Typography>
                    <Button color="success" onClick={cancelDraw}>Zrušit</Button>
                </>}
                {(suggestDraw && !suggestedDraw) && <>
                    <Typography className="self-center">Protihráč navrhl remízu</Typography>
                    <Stack gap={1} direction="row">
                        <Button color="danger" onClick={acceptDraw} fullWidth>Přijmout</Button>
                        <Button color="success" onClick={declineDraw} fullWidth>Odmítnout</Button>
                    </Stack>
                </>}
            </Stack>
        )}

        {(suggestDraw || suggestedDraw) || <div className="text-center mt-2">
            <Button onClick={giveUp} className="w-[400px]" color="danger">{(winner === "" && explicitWin === 0) ? `Vzdát se` : `Zpět do menu`}</Button>
        </div>}

        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((x) => <br key={x}/>)}
    </>)
}
