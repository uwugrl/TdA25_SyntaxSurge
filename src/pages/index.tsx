import {InferGetServerSidePropsType} from "next";
import {PrismaClient} from "@prisma/client";
import {fromDbBoard, fromDbDifficulty} from "@/components/fromDB";
import Image from "next/image";
import React, { useState } from "react";
import Link from "next/link";
import {formatDate} from "@/components/base";
import Metadata from "@/components/Metadata";
import {Button, ButtonGroup, Card, DialogTitle, Dropdown, Input, ListDivider, Menu, MenuButton, MenuItem, Modal, ModalClose, ModalDialog, Stack, Typography} from "@mui/joy";
import Header from "@/components/Header";
import {ArrowDropDown, Search} from '@mui/icons-material';
import { determineGameState } from "@/components/gameUtils";

export async function getServerSideProps() {
    const client = new PrismaClient();
    await client.$connect();

    const games = (await client.game.findMany({
        include: {
            board: true
        }, orderBy: {
            updatedAt: 'desc'
        }
    })).map(x => ({
            uuid: x.id,
            name: x.name,
            difficulty: fromDbDifficulty(x.difficulty),
            board: fromDbBoard(x.board),
            createdAt: x.createdAt.toISOString(),
            updatedAt: x.updatedAt.toISOString(),
            gameState: determineGameState(fromDbBoard(x.board))
        }));

    await client.$disconnect();

    return {
        props: {
            games
        }
    }
}

function Pagination(props: {
    lastPage: number,
    page: number,
    setPage: (page: number) => void
}) {
    if (props.lastPage === 0) {
        return null;
    }

    return (<ButtonGroup>
        <Button disabled={props.page <= 1} onClick={() => props.setPage(1)}>První strana</Button>
        <Button disabled={props.page <= 1} onClick={() => props.setPage(props.page - 1)}>Předchozí
            strana</Button>
        <Button disabled>Strana {props.page} z {props.lastPage}</Button>
        <Button disabled={props.page === props.lastPage} onClick={() => props.setPage(props.page + 1)}>Další strana</Button>
        <Button disabled={props.page === props.lastPage} onClick={() => props.setPage(props.lastPage)}>Poslední
            strana</Button>
    </ButtonGroup>);
}

function GameCard(props: {
    uuid: string, name: string, createdAt: string, updatedAt: string, difficulty: string, ended: boolean
}) {

    let icon = '/Icon/zarivka_medium_bile.svg';

    switch (props.difficulty) {
        case 'beginner':
            icon = '/Icon/zarivka_beginner_bile.svg';
            break;
        case 'easy':
            icon = '/Icon/zarivka_easy_bile.svg';
            break;
        case 'medium':
            icon = '/Icon/zarivka_medium_bile.svg';
            break;
        case 'hard':
            icon = '/Icon/zarivka_hard_bile.svg';
            break;
        case 'extreme':
            icon = '/Icon/zarivka_extreme_bile.svg';
            break;
    }

    const dateCreated = new Date(props.createdAt);

    return (<Card>
        <Typography level='h2' color={props.ended ? "neutral" : "success"}>{props.name}</Typography>
        <Image src={icon} alt={props.difficulty} height={32} width={32} className={'ml-2'}/>
        <Link href={`/game/${props.uuid}`}>
            <Button variant="outlined" color="neutral">
                Zobrazit hru
            </Button>
        </Link>
        <Typography level='body-sm'>{`Vytvořeno ${formatDate(dateCreated)}`}</Typography>
    </Card>)
}

function FilterOptions(props: {
    setDifficultyFilter: (x: string | undefined) => void,
    setFulltextFilter: (x: string | undefined) => void,
    setGamestateFilter: (x: string | undefined) => void,
    setLastMoveAfter: (x: Date | undefined) => void,
    setLastMoveBefore: (x: Date | undefined) => void,
    setCreatedAfter: (x: Date | undefined) => void,
    setCreatedBefore: (x: Date | undefined) => void
}) {

    const [difficultyFilter, setDifficultyFilter] = useState<string | undefined>(undefined);
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

    const DIFFICULTIES = [{
        id: "beginner",
        val: "Začátečník"
    }, {
        id: "easy",
        val: "Jednoduchá"
    }, {
        id: "medium",
        val: "Pokročilá"
    }, {
        id: "hard",
        val: "Těžká"
    }, {
        id: "extreme",
        val: "Nejtěžší"
    }];

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
            
            {/* Difficulty */}

            <Dropdown>
                <MenuButton endDecorator={<ArrowDropDown />}>{difficultyFilter ? DIFFICULTIES.find(x => x.id === difficultyFilter)?.val : 'Obtížnost'}</MenuButton>
                <Menu>
                    {difficultyFilter && <>
                        <MenuItem onClick={() => {setDifficultyFilter(undefined); props.setDifficultyFilter(undefined)}}>
                            Odstranit filtr
                        </MenuItem>
                        <ListDivider />
                    </>}
                    
                    {DIFFICULTIES.map(x => (
                        <MenuItem key={x.id} onClick={() => {setDifficultyFilter(x.id); props.setDifficultyFilter(x.id)}}>{x.val}</MenuItem>
                    ))}
                </Menu>
            </Dropdown>

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

export default function Home(props: InferGetServerSidePropsType<typeof getServerSideProps>) {

    const [difficultyFilter, setDifficultyFilter] = useState<string | undefined>(undefined);
    const [fulltextFilter, setFulltextFilter] = useState<string | undefined>(undefined);
    const [gamestateFilter, setGamestateFilter] = useState<string | undefined>(undefined);

    const [lastMoveAfter, setLastMoveAfter] = useState<Date | undefined>(undefined);
    const [lastMoveBefore, setLastMoveBefore] = useState<Date | undefined>(undefined);

    const [createdAfter, setCreatedAfter] = useState<Date | undefined>(undefined);
    const [createdBefore, setCreatedBefore] = useState<Date | undefined>(undefined);

    const [page, setPage] = React.useState(1);
    const lastPage = Math.ceil(props.games.length / 10);

    return (<>
        <Metadata title={'Úvodní stránka'} description={'Vítejte v Think different Academy!'}/>
        <main className={`w-3/4 m-auto`}>
        
            <br/>
            <br/>
            <br/>
            <br/>
            <br/>

            <Stack spacing={1}>
                <Typography level="h2">Spusťte se do hry</Typography>
                <div className="text-center">
                    <Link href='/game'>
                        <Button size="lg">Hrát!</Button>
                    </Link>
                </div>

                <Typography level="h2">Seznam her</Typography>

                <Pagination {...props} page={page} lastPage={lastPage} setPage={x => setPage(x)} />
                <FilterOptions setDifficultyFilter={setDifficultyFilter} setFulltextFilter={setFulltextFilter} setGamestateFilter={setGamestateFilter}
                setLastMoveAfter={setLastMoveAfter} setLastMoveBefore={setLastMoveBefore} setCreatedAfter={setCreatedAfter} setCreatedBefore={setCreatedBefore} />

                {[...(props.games.filter(x => x.gameState !== "endgame")), ...(props.games.filter(x => x.gameState === "endgame"))]
                    .filter(x => difficultyFilter ? difficultyFilter === x.difficulty : true)
                    .filter(x => fulltextFilter ? x.name.toLowerCase().includes(fulltextFilter.toLowerCase()) : true)
                    .filter(x => gamestateFilter ? gamestateFilter === x.gameState : true)
                    .filter(x => lastMoveAfter ? Date.parse(x.updatedAt) > lastMoveAfter.getTime() : true)
                    .filter(x => lastMoveBefore ? Date.parse(x.updatedAt) < lastMoveBefore.getTime() : true)
                    .filter(x => createdAfter ? Date.parse(x.createdAt) > createdAfter.getTime() : true)
                    .filter(x => createdBefore ? Date.parse(x.createdAt) < createdBefore.getTime() : true)
                    .slice((page - 1) * 10, page * 10)
                    .map(x => {
                    if (!x.difficulty) {return null;}

                    return <GameCard key={x.uuid} uuid={x.uuid} name={x.name} createdAt={x.createdAt} updatedAt={x.updatedAt}
                                     difficulty={x.difficulty} ended={x.gameState === "endgame"}/>
                })}

                <Pagination {...props} page={page} lastPage={lastPage} setPage={x => setPage(x)} />
            </Stack>

            <br/>
            <br/>

            <Link href={'/about'} className={'text-[#0070BB]'}>
                <Button>O aplikaci Think different Academy</Button>
            </Link>

            <br/>
            <br/>
            <br/>

            <Header />
        </main>
    </>);
}
