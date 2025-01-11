import {useState} from "react";
import {fromDbDifficulty} from "@/components/fromDB";
import {newBoard} from "@/components/base";
import GameDifficultyPicker from "@/components/Game/GameDifficultyPicker";
import Metadata from "@/components/Metadata";


export default function CreateGameForm(params: {
    gameCreated: (data: { gameTitle: string, gameId: string, gameBoard: ("X" | "O" | "")[][], gameDifficulty: string }) => void,

}) {

    const [gameName, setGameName] = useState('');
    const [gameDifficulty, setGameDifficulty] = useState(0);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState('');

    function createGame() {
        setLoading(true);

        fetch('/api/v1/games', {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({
                'name': gameName,
                'difficulty': fromDbDifficulty(gameDifficulty),
                'board': newBoard()
            })
        }).then(x => {
            if (x.ok) {
                x.json().then(y => {
                    params.gameCreated({
                        gameId: y.uuid,
                        gameTitle: y.name,
                        gameBoard: y.board,
                        gameDifficulty: fromDbDifficulty(y.difficulty) ?? 'medium'
                    })
                }).catch(y => {
                    setError(y.toString());
                })
            }
        }).catch(x => {
            setError(x.toString());
        })
    }

    return (
        <>
            <Metadata title={`Nová Hra`} description={'Hrajte piškvorky na Think different Academy ještě dnes!'}/>
            <h1 className='text-3xl font-bold'>Založit novou hru</h1>
            <h2 className='text-2xl font-bold mb-2'>Název hry</h2>
            <input type="text" disabled={loading} value={gameName} onChange={(x) => setGameName(x.currentTarget.value)}
                   className='text-black p-1 px-2 rounded-md'/>
            <GameDifficultyPicker current={gameDifficulty} disabled={loading} onChange={(x) => setGameDifficulty(x)} />
            <br/>
            <button className='bg-[#0070BB] rounded-md p-1 px-2' disabled={loading} onClick={createGame}>Založit hru
            </button>
        </>
    )
}
