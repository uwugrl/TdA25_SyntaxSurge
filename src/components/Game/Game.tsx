import GameBoard from "@/components/Game/GameBoard";
import {useRef, useState} from "react";
import {determineGameState, evalWinner, getNextSymbol} from "@/components/gameUtils";
import Image from "next/image";
import {useRouter} from "next/router";
import Link from "next/link";

export default function Game(params: {
    gameId: string, gameTitle: string, board: ("X" | "O" | "")[][], gameDifficulty: string
}) {

    const gameRef = useRef<("X" | "O" | "")[][]>(params.board); //nesnasim react

    const [game, setGame] = useState(params.board);
    const [nextMove, setNextMove] = useState<("X" | "O" | "")>(getNextSymbol(gameRef.current));
    const [gameState, setGameState] = useState<("opening" | "midgame" | "endgame")>(determineGameState(gameRef.current));
    const [winner, setWinner] = useState<("X" | "O" | "")>(evalWinner(gameRef.current, 5));

    const [isLoaded, setIsLoaded] = useState(true);

    function handleInteraction(x: number, y: number) {
        if (game[x][y] !== "") {
            console.log(`Skipping element at ${x}, ${y}: "${game[x][y]}" is not ""`);
            return;
        }

        if (evalWinner(gameRef.current, 5) !== "") {
            console.log(`Game was already won by ${evalWinner(gameRef.current, 5)}`);
            return;
        }

        setIsLoaded(false);

        let next = [...gameRef.current];
        next[x][y] = getNextSymbol(game);
        setNextMove(getNextSymbol(next));
        setGameState(determineGameState(next));
        setWinner(evalWinner(next, 5));
        fetch(`/api/v1/games/${params.gameId}`, {
            method: "PUT", headers: {
                "Content-Type": "application/json"
            }, body: JSON.stringify({
                name: params.gameTitle, difficulty: params.gameDifficulty, board: next
            })
        }).then(x => {
            setIsLoaded(true);
        })

        gameRef.current = next;
        setGame(next);
    }

    const getWinnerImage = () => {
        let winner = evalWinner(gameRef.current, 5);

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

        {[0, 1].map((x) => {
            return <br key={x}/>
        })}

        {winner === "" && (
            <>
                <div className={'border-2 border-white px-2 rounded-xl'}>
                    <h2 className={'text-2xl font-bold'}>
                <span className={'flex flex-row gap-4 my-2'}>
                {`Na tahu je: `}
                    {nextMove === "X" && <img src='/Icon/X_cervene.svg' alt='X' width={32} height={32}/>}
                    {nextMove === "O" && <img src='/Icon/O_modre.svg' alt='O' width={32} height={32}/>}
                </span>
                    </h2>
                </div>
            </>
        )}
        {winner === "" || (
            <>
                <div className={'border-white border-2 px-2 rounded-xl'}>
                    <p className={'flex flex-row gap-2 text-2xl font-bold'}>Hru vyhráli {getWinnerImage()}</p>
                    <button className={'bg-[#0070BB] p-2 px-4 rounded-lg drop-shadow-md m-2'} onClick={newGame}>Nová
                        hra
                    </button>
                    <button className={'bg-[#0070BB] p-2 px-4 rounded-lg drop-shadow-md'} onClick={mainMenu}>Hlavní
                        menu
                    </button>
                </div>
            </>
        )}

        <br/>

        <Link href={'/'}>
            <button className={'bg-[#0070BB] p-2 px-4 rounded-lg drop-shadow-md'}>Zpět do menu</button>
        </Link>

        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((x) => {
            return <br key={x}/>
        })}
    </>)
}
