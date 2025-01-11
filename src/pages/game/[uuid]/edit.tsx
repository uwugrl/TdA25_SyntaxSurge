import {GetServerSidePropsContext, InferGetServerSidePropsType} from "next";
import {PrismaClient} from "@prisma/client";
import {fromDbBoard, fromDbDifficulty} from "@/components/fromDB";
import {useState} from "react";
import localFont from "next/font/local";
import GameDifficultyPicker from "@/components/Game/GameDifficultyPicker";
import GameBoardFreeEdit from "@/components/Game/GameBoardFreeEdit";
import {determineGameState} from "@/components/gameUtils";

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    const uuid = ctx.params?.uuid as string | undefined;
    if (!uuid) {
        return {notFound: true}
    }

    const prisma = new PrismaClient();
    const game = await prisma.game.findUnique({
        where: {
            id: uuid
        }, include: {
            board: true
        }
    });

    // game: {id, x, y, state, gameID}[]

    if (!game) {
        return {
            notFound: true
        }
    }

    const board: ("X" | "O" | "")[][] = fromDbBoard(game.board);
    const difficulty = fromDbDifficulty(game.difficulty);

    await prisma.$disconnect();
    return {
        props: {
            game: {
                uuid: game.id,
                name: game.name,
                createdAt: game.createdAt.toISOString(),
                updatedAt: game.updatedAt.toISOString(),
                difficulty: difficulty,
                dbDifficulty: game.difficulty,
                board: board,
                gameState: determineGameState(board)
            }
        }
    }
}

const dosis = localFont({src: '../../fonts/Dosis-VariableFont_wght.ttf'});

export default function EditGame(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const [name, setName] = useState(props.game.name);
    const [difficulty, setDifficulty] = useState(props.game.dbDifficulty);
    const [board, setBoard] = useState(props.game.board);

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const [displayBoardEditor, setBoardEditor] = useState(false);

    const save = () => {
        setLoading(true);
        fetch(`/api/v1/games/${props.game.uuid}`, {
            headers: {
                'Content-Type': 'application/json'
            }, method: 'PUT', body: JSON.stringify({
                name, difficulty: fromDbDifficulty(difficulty), board
            })
        }).then(x => {
            if (!x.ok) {
                setError(`fetch() status: ${x.statusText}`);
                setLoading(false);
                return;
            }

            setSuccess(true);
            setLoading(false);
        }).catch(x => {
            setError(`fetch() error: ${x}`);
            setLoading(false);
        })
    }

    return (<>
            <main className={`w-3/4 m-auto ${dosis.className}`}>
                <h1 className='text-3xl font-bold'>Upravit hru: <input disabled={loading}
                                                                       className='bg-[#1a1a1a] border-[1px] border-white'
                                                                       type="text" value={name}
                                                                       onChange={x => setName(x.currentTarget.value)}></input>
                </h1>
                <GameDifficultyPicker current={difficulty} onChange={(x) => setDifficulty(x)} disabled={loading}/>
                {displayBoardEditor && <GameBoardFreeEdit board={board} setBoard={(x) => setBoard(x)} disabled={loading}/>}
                {displayBoardEditor || <p>
                    <button className='bg-[#0070BB] p-2 px-4 rounded-lg' onClick={() => setBoardEditor(true)}>Upravit herní pole</button>
                </p>}
                <br></br>
                {success && <p>Uloženo!</p>}
                {error && <p>Chyba: {error}</p>}
                <button className='bg-[#0070BB] p-2 px-4 rounded-lg' disabled={loading} onClick={save}>Uložit změny
                </button>
            </main>
        </>)
}
