import {useState} from "react";
import {fromDbDifficulty} from "@/components/fromDB";
import {newBoard} from "@/components/base";
import GameDifficultyPicker from "@/components/Game/GameDifficultyPicker";
import Metadata from "@/components/Metadata";
import React from "react";
import { Button, FormControl, FormHelperText, FormLabel, Input, Stack, Typography } from "@mui/joy";


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
        <Stack spacing={2}>
            <Metadata title={`Nová Hra`} description={'Hrajte piškvorky na Think different Academy ještě dnes!'}/>
            <Typography level="h1">Založit novou hru</Typography>

            <FormControl>
                <FormLabel>Název hry</FormLabel>
                <Input type="text" disabled={loading} value={gameName} onChange={(x) => setGameName(x.currentTarget.value)} placeholder="Název hry" />
                <FormHelperText>Zadejte název hry. Tento název se zobrazí v seznamu her a ve hře.</FormHelperText>
            </FormControl>

            <GameDifficultyPicker current={gameDifficulty} disabled={loading} onChange={(x) => setGameDifficulty(x)} />
            {error && <Typography color="danger">{error}</Typography>}
            <Button disabled={loading} onClick={createGame}>Založit hru</Button>
        </Stack>
    )
}
