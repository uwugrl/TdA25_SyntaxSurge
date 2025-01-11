import {useEffect, useState} from "react";
import CreateGameForm from "@/components/Game/CreateGameForm";
import localFont from "next/font/local";
import GameComponent from '@/components/Game/Game';
import TdA from "@/components/logo";

const dosis = localFont({src: '../fonts/Dosis-VariableFont_wght.ttf'});

export default function Game() {
    const [gameId, setGameId] = useState("");
    const [title, setTitle] = useState("");
    const [board, setBoard] = useState([] as ("X" | "O" | "")[][])
    const [difficulty, setDifficulty] = useState("medium");

    useEffect(() => {
        if (localStorage.getItem("game")) {
            fetch(`/api/v1/games/${localStorage.getItem("game")!}`).then(x => {
                if (!x.ok) {
                    localStorage.removeItem("game");
                    location.reload();
                    return;
                }

                x.json().then(y => {
                    setBoard(y.board);
                    setTitle(y.name);
                    setGameId(y.uuid);
                })
            }).catch(x => {
                localStorage.removeItem("game");
                location.reload();
                return;
            })
        }
    }, []);

    function gameHasCreated(x: {
        gameId: string,
        gameTitle: string,
        gameBoard: ("X" | "O" | "")[][],
        gameDifficulty: string
    }) {
        localStorage.setItem("game", x.gameId);
        setGameId(x.gameId);
        setTitle(x.gameTitle);
        setBoard(x.gameBoard);
        setDifficulty(x.gameDifficulty);
    }


    return (<>
        <div className={`w-3/4 m-auto ${dosis.className}`}>
            <TdA />
            {gameId === "" && <CreateGameForm gameCreated={gameHasCreated}/>}
            {gameId === "" ||
                <GameComponent gameId={gameId} gameTitle={title} board={board} gameDifficulty={difficulty}/>}
        </div>
    </>)
}
