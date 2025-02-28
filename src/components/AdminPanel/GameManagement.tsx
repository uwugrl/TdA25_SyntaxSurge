import { ModalDialog, ModalClose } from "@mui/joy";
import { Stack, Table, Button, Modal, DialogTitle, Typography, Input } from "@mui/joy";
import React, { useState } from "react";
import { formatDate } from "../base";
import FilterOptions from "../FilterOptions";
import { apiPost } from "../frontendUtils";
import Pagination from "../Pagination";

export function GameManagement(props: {
    games: {
        uuid: string,
        name: string,
        difficulty: string | undefined,
        board: ("X" | "O" | "")[][],
        createdAt: string,
        updatedAt: string,
        gameState: "opening" | "midgame" | "endgame",
        explicitWinner: number
    }[],
    setGames: (x: {
        uuid: string,
        name: string,
        difficulty: string | undefined,
        board: ("X" | "O" | "")[][],
        createdAt: string,
        updatedAt: string,
        gameState: "opening" | "midgame" | "endgame",
        explicitWinner: number
    }[]) => void
}) {
    const [fulltextFilter, setFulltextFilter] = useState<string | undefined>(undefined);
    const [gamestateFilter, setGamestateFilter] = useState<string | undefined>(undefined);

    const [lastMoveAfter, setLastMoveAfter] = useState<Date | undefined>(undefined);
    const [lastMoveBefore, setLastMoveBefore] = useState<Date | undefined>(undefined);

    const [createdAfter, setCreatedAfter] = useState<Date | undefined>(undefined);
    const [createdBefore, setCreatedBefore] = useState<Date | undefined>(undefined);

    const [page, setPage] = useState(1);
    const lastPage = Math.ceil(props.games.length / 10);

    const [editGameID, setEditGameID] = useState("");

    const [currentGameEditName, setCurrentGameEditName] = useState('');

    const [loading, setLoading] = useState(false);

    const startEditGame = (id: string) => {
        const target = props.games.find(x => x.uuid === id);
        if (!target) return;

        setEditGameID(id);
        setCurrentGameEditName(target.name);
    }

    const stopEditGame = () => {
        setEditGameID("");
        setCurrentGameEditName("");
    }
    
    const save = () => {
        setLoading(true);
        apiPost("/admin/edit", {
            id: editGameID,
            name: currentGameEditName
        }).then(() => {
            props.setGames(
                props.games.map(x => {
                    if (x.uuid === editGameID) return {
                        ...x,
                        name: currentGameEditName
                    }

                    return x;
                })
            );

            setLoading(false);
            stopEditGame();
        });
    }

    return <>
    
    <Stack gap={1}>
            <Pagination {...props} page={page} lastPage={lastPage} setPage={x => setPage(x)} />
            <FilterOptions setFulltextFilter={setFulltextFilter} setGamestateFilter={setGamestateFilter} setLastMoveAfter={setLastMoveAfter} setLastMoveBefore={setLastMoveBefore} setCreatedAfter={setCreatedAfter} setCreatedBefore={setCreatedBefore} />

            <Table>
                <thead>
                    <tr>
                        <th>Název</th>
                        <th>Hráno</th>
                        <th>Akce</th>
                    </tr>
                </thead>
                <tbody>
                    {[...(props.games.filter(x => x.gameState !== "endgame")), ...(props.games.filter(x => x.gameState === "endgame"))]
                        .filter(x => fulltextFilter ? x.name.toLowerCase().includes(fulltextFilter.toLowerCase()) : true)
                        .filter(x => gamestateFilter ? gamestateFilter === x.gameState : true)
                        .filter(x => lastMoveAfter ? Date.parse(x.updatedAt) > lastMoveAfter.getTime() : true)
                        .filter(x => lastMoveBefore ? Date.parse(x.updatedAt) < lastMoveBefore.getTime() : true)
                        .filter(x => createdAfter ? Date.parse(x.createdAt) > createdAfter.getTime() : true)
                        .filter(x => createdBefore ? Date.parse(x.createdAt) < createdBefore.getTime() : true)
                        .slice((page - 1) * 10, page * 10)
                        .map(x => {
                        if (!x.difficulty) {return null;}

                        const deleteGame = () => {
                            apiPost('/admin/delete', {
                                id: x.uuid
                            }).then(() => {
                                props.setGames(props.games.filter(y => y.uuid !== x.uuid));
                            });
                        }

                        return <tr key={x.uuid}>
                            <td>{x.name}</td>
                            <td>{formatDate(new Date(x.createdAt))}</td>
                            <td>
                                <Button variant="plain" onClick={() => startEditGame(x.uuid)}>Upravit</Button>
                                <Button variant="plain" color="danger" onClick={() => deleteGame()}>Smazat</Button>
                            </td>
                        </tr>
                    })}
                </tbody>
            </Table>
            <Pagination {...props} page={page} lastPage={lastPage} setPage={x => setPage(x)} />
        </Stack>

        <Modal open={editGameID !== ""} onClose={() => {
            if (!loading) stopEditGame();
        }}>
            <ModalDialog>
                <DialogTitle>Upravit hru</DialogTitle>
                <ModalClose disabled={loading} />
                <Stack gap={1}>
                    <Typography>Název hry</Typography>
                    <Input type="text" value={currentGameEditName} onChange={x => setCurrentGameEditName(x.currentTarget.value)} />

                    <Stack direction="row" gap={1}>
                        <Button disabled={loading} onClick={save}>Uložit</Button>
                        <Button disabled={loading} onClick={stopEditGame}>Zrušit</Button>
                    </Stack>
                </Stack>
            </ModalDialog>
        </Modal>
    </>
}
