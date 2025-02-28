import { ArrowDropDown, Search } from "@mui/icons-material";
import { Stack, Typography, Dropdown, MenuButton, Menu, MenuItem, ListDivider, Modal, ModalDialog, DialogTitle, ModalClose, Button, Input } from "@mui/joy";
import React from "react";
import { useState } from "react";

export default function FilterOptions(props: {
    setFulltextFilter: (x: string | undefined) => void,
    setGamestateFilter: (x: string | undefined) => void,
    setLastMoveAfter: (x: Date | undefined) => void,
    setLastMoveBefore: (x: Date | undefined) => void,
    setCreatedAfter: (x: Date | undefined) => void,
    setCreatedBefore: (x: Date | undefined) => void
}) {
    const [gamestateFilter, setGamestateFilter] = useState<string | undefined>(undefined);
    const [fulltextFilter, setFulltextFilter] = useState<string | undefined>(undefined);

    const [lastMoveAfter, setLastMoveAfter] = useState<Date | undefined>(undefined);
    const [lastMoveBefore, setLastMoveBefore] = useState<Date | undefined>(undefined);

    const [openLastMoveAfterDialog, setOpenLastMoveAfterDialog] = useState(false);
    const [openLastMoveBeforeDialog, setOpenLastMoveBeforeDialog] = useState(false);

    let posledniTahText = 'Poslední tah';

    if (lastMoveAfter) {
        posledniTahText = `> ${lastMoveAfter.toISOString().slice(0, 10)}`;
    }
    if (lastMoveBefore) {
        posledniTahText = `< ${lastMoveBefore.toISOString().slice(0, 10)}`;
    }
    const [createdAfter, setCreatedAfter] = useState<Date | undefined>(undefined);
    const [createdBefore, setCreatedBefore] = useState<Date | undefined>(undefined);

    const [openCreatedAfterDialog, setOpenCreatedAfterDialog] = useState(false);
    const [openCreatedBeforeDialog, setOpenCreatedBeforeDialog] = useState(false);

    let vytvorenText = 'Založení hry';

    if (createdAfter) {
        vytvorenText = `> ${createdAfter.toISOString().slice(0, 10)}`;
    }
    if (createdBefore) {
        vytvorenText = `< ${createdBefore.toISOString().slice(0, 10)}`;
    }

    const GAMESTATES = [{
        id: "opening",
        val: "Začínající"
    }, {
        id: "midgame",
        val: "Probíhající"
    }, {
        id: "endgame",
        val: "Ukončené"
    }];

    return <>
        <Stack direction="row" gap={1}>
            <Typography alignSelf={'center'}>Filtrovat</Typography>

            {/* Game State */}
            
            <Dropdown>
                <MenuButton endDecorator={<ArrowDropDown />}>{gamestateFilter ? GAMESTATES.find(x => x.id === gamestateFilter)?.val : 'Herní stav'}</MenuButton>
                <Menu>
                    {gamestateFilter && <>
                        <MenuItem onClick={() => {setGamestateFilter(undefined); props.setGamestateFilter(undefined)}}>
                            Odstranit filtr
                        </MenuItem>
                        <ListDivider />
                    </>}
                    
                    {GAMESTATES.map(x => (
                        <MenuItem key={x.id} onClick={() => {setGamestateFilter(x.id); props.setGamestateFilter(x.id)}}>{x.val}</MenuItem>
                    ))}
                </Menu>
            </Dropdown>

            {/* Last move date */}

            <Dropdown>
                <MenuButton endDecorator={<ArrowDropDown />}>{posledniTahText}</MenuButton>
                <Menu>
                    {(lastMoveAfter || lastMoveBefore) && <>
                        <MenuItem onClick={() => {setLastMoveAfter(undefined); props.setLastMoveAfter(undefined);  setLastMoveBefore(undefined); props.setLastMoveBefore(undefined)}}>
                            Odstranit filtr
                        </MenuItem>
                        <ListDivider />
                    </>}
                    
                    <MenuItem onClick={() => {setOpenLastMoveAfterDialog(true); props.setLastMoveAfter(undefined); setLastMoveAfter(undefined)}}>Po...</MenuItem>
                    <MenuItem onClick={() => {setOpenLastMoveBeforeDialog(true); props.setLastMoveBefore(undefined); setLastMoveBefore(undefined)}}>Před...</MenuItem>
                </Menu>
            </Dropdown>

            {/* Create date */}

            <Dropdown>
                <MenuButton endDecorator={<ArrowDropDown />}>{vytvorenText}</MenuButton>
                <Menu>
                    {(createdAfter || createdBefore) && <>
                        <MenuItem onClick={() => {setCreatedAfter(undefined); props.setCreatedAfter(undefined);  setCreatedBefore(undefined); props.setCreatedBefore(undefined)}}>
                            Odstranit filtr
                        </MenuItem>
                        <ListDivider />
                    </>}
                    
                    <MenuItem onClick={() => {setOpenCreatedAfterDialog(true); props.setCreatedAfter(undefined); setCreatedAfter(undefined)}}>Po...</MenuItem>
                    <MenuItem onClick={() => {setOpenCreatedBeforeDialog(true); props.setCreatedBefore(undefined); setCreatedBefore(undefined)}}>Před...</MenuItem>
                </Menu>
            </Dropdown>

            <Input value={fulltextFilter} onChange={e => {setFulltextFilter(e.target.value); props.setFulltextFilter(e.target.value)}} placeholder="Hledat..." startDecorator={<Search />} />

        </Stack>

        {/* Modals */}

        <Modal open={openLastMoveAfterDialog} onClose={() => setOpenLastMoveAfterDialog(false)}>
            <ModalDialog>
                <DialogTitle>Vyberte datum posledního tahu, odkud se mají hry zobrazovat</DialogTitle>
                <ModalClose />
                <Stack gap={1}>
                    <Input type="date" value={lastMoveAfter?.toISOString().substring(0, 10)} onChange={e => {setLastMoveAfter(new Date(e.target.value)); props.setLastMoveAfter(new Date(e.target.value))}} placeholder="Datum..." />
                    <Button onClick={() => setOpenLastMoveAfterDialog(false)}>OK</Button>
                    <Button onClick={() => {setOpenLastMoveAfterDialog(false); setLastMoveAfter(undefined)}}>Smazat filtr</Button>
                </Stack>
            </ModalDialog>
        </Modal>

        <Modal open={openLastMoveBeforeDialog} onClose={() => setOpenLastMoveBeforeDialog(false)}>
            <ModalDialog>
                <DialogTitle>Vyberte datum posledního tahu, do kterého se mají hry zobrazovat</DialogTitle>
                <ModalClose />
                <Stack gap={1}>
                    <Input type="date" value={lastMoveBefore?.toISOString().substring(0, 10)} onChange={e => {setLastMoveBefore(new Date(e.target.value)); props.setLastMoveBefore(new Date(e.target.value))}} placeholder="Datum..." />
                    <Button onClick={() => setOpenLastMoveBeforeDialog(false)}>OK</Button>
                    <Button onClick={() => {setOpenLastMoveBeforeDialog(false); setLastMoveBefore(undefined)}}>Smazat filtr</Button>
                </Stack>
            </ModalDialog>
        </Modal>

        {/* Created */}
        
        <Modal open={openCreatedAfterDialog} onClose={() => setOpenCreatedAfterDialog(false)}>
            <ModalDialog>
                <DialogTitle>Vyberte datum založení hry, odkud se mají hry zobrazovat</DialogTitle>
                <ModalClose />
                <Stack gap={1}>
                    <Input type="date" value={createdAfter?.toISOString().substring(0, 10)} onChange={e => {setCreatedAfter(new Date(e.target.value)); props.setCreatedAfter(new Date(e.target.value))}} placeholder="Datum..." />
                    <Button onClick={() => setOpenCreatedAfterDialog(false)}>OK</Button>
                    <Button onClick={() => {setOpenCreatedAfterDialog(false); setCreatedAfter(undefined); props.setCreatedAfter(undefined)}}>Smazat filtr</Button>
                </Stack>
            </ModalDialog>
        </Modal>

        <Modal open={openCreatedBeforeDialog} onClose={() => setOpenCreatedBeforeDialog(false)}>
            <ModalDialog>
                <DialogTitle>Vyberte datum založení hry, do kterého se mají hry zobrazovat</DialogTitle>
                <ModalClose />
                <Stack gap={1}>
                    <Input type="date" value={createdBefore?.toISOString().substring(0, 10)} onChange={e => {setCreatedBefore(new Date(e.target.value)); props.setCreatedBefore(new Date(e.target.value))}} placeholder="Datum..." />
                    <Button onClick={() => setOpenCreatedBeforeDialog(false)}>OK</Button>
                    <Button onClick={() => {setOpenCreatedBeforeDialog(false); setCreatedBefore(undefined); props.setCreatedBefore(undefined)}}>Smazat filtr</Button>
                </Stack>
            </ModalDialog>
        </Modal>
    </>

}
