import {fromDbBoard, fromDbDifficulty} from "@/components/fromDB";
import {PrismaClient} from "@prisma/client";
import {GetServerSidePropsContext, InferGetServerSidePropsType} from "next";
import GameBoard from "@/components/Game/GameBoard";
import localFont from "next/font/local";
import {determineGameState, evalWinner} from "@/components/gameUtils";
import TdA from "@/components/logo";
import Image from "next/image";
import Metadata from "@/components/Metadata";
import {useRouter} from "next/router";


export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    const uuid = ctx.params?.uuid as string;
    if (!uuid) {
        return {
            notFound: true
        }
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

    // Identify what symbol should be next for the game

    await prisma.$disconnect();
    return {
        props: {
            game: {
                uuid: game.id,
                name: game.name,
                createdAt: game.createdAt.toISOString(),
                updatedAt: game.updatedAt.toISOString(),
                difficulty: difficulty,
                board: board,
                gameState: determineGameState(board)
            }
        }
    }
}

const dosis = localFont({src: '../../fonts/Dosis-VariableFont_wght.ttf'});

export default function ViewSavedGame(props: InferGetServerSidePropsType<typeof getServerSideProps>) {

    const router = useRouter();

    const winner = evalWinner(props.game.board, 5);

    const getWinnerImage = () => {
        switch (winner) {
            case "X":
                return <Image src={'/Icon/X_cervene.svg'} alt={'X'} width={16} height={16}/>;
            case "O":
                return <Image src={'/Icon/O_modre.svg'} alt={'O'} width={16} height={16}/>;
            case "":
                return null;
        }
    }

    const takeOverGame = () => {
        localStorage.setItem("game", props.game.uuid);
        router.push('/game');
    }

    return <>
        <Metadata title={props.game.name} description={'Hrajte piškvorky na Think different Academy ještě dnes!'}/>
        <main className={`w-3/4 m-auto ${dosis.className}`}>
            <TdA />
            <h1 className={'text-3xl font-bold my-2'}>{props.game.name}</h1>
            <GameBoard board={props.game.board}/>
            {props.game.gameState === 'midgame' && <div className={'p-2 border-[#E31837] border-2 m-1 rounded-lg drop-shadow-md'}>
                <h2 className={'text-2xl font-bold'}>Hra právě probíhá.</h2>
                <button className={'border-2 border-white text-xl rounded-lg p-1 px-2 mt-2 hover:text-[#E31837] hover:bg-white'} onClick={takeOverGame}>Převzít tuto hru</button>
            </div>}
            {winner === "" || <div className={'p-2 m-1 rounded-lg drop-shadow-md border-2 border-[#E31837]'}>
                <h2 className={'text-2xl font-bold'}>Hra je ukončena.</h2>
                <p className={'flex flex-row gap-2'}>Hru vyhráli {getWinnerImage()}</p>
            </div>}
        </main>
    </>
}
