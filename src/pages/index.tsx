import {GetServerSidePropsContext, InferGetServerSidePropsType} from "next";
import {PrismaClient} from "@prisma/client";
import {fromDbBoard, fromDbDifficulty} from "@/components/fromDB";
import localFont from "next/font/local";
import Image from "next/image";
import Logo from '../Logo.png';
import React from "react";
import Link from "next/link";
import {useRouter} from "next/router";
import {formatDate} from "@/components/base";
import Metadata from "@/components/Metadata";

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    let {page} = ctx.query as { page: string };

    if (page === undefined) {
        page = '1';
    }

    if (isNaN(Number(page))) {
        return {
            redirect: {
                destination: '/', code: 307
            }
        }
    }

    const client = new PrismaClient();
    await client.$connect();

    const gameCount = await client.game.count();

    const games = (await client.game.findMany({
        skip: (Number(page) - 1) * 10, take: 10, include: {
            board: true
        }, orderBy: {
            updatedAt: 'desc'
        }
    })).map(x => {
        return {
            uuid: x.id,
            name: x.name,
            difficulty: fromDbDifficulty(x.difficulty),
            board: fromDbBoard(x.board),
            createdAt: x.createdAt.toISOString(),
            updatedAt: x.updatedAt.toISOString()
        }
    });

    await client.$disconnect();

    if (Number(page) > Math.ceil(gameCount / 10) && gameCount > 0) {
        return {
            redirect: {
                destination: `?page=${Math.ceil(gameCount / 10)}`,
                permanent: false
            }
        }
    }

    return {
        props: {
            games, page: Number(page), canGoNext: Number(page) * 10 - gameCount < 0, lastPage: Math.ceil(gameCount / 10)
        }
    }
}

const dosis = localFont({src: './fonts/Dosis-VariableFont_wght.ttf'});

function paginationButtons(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
    if (props.lastPage === 0) {
        return null;
    }

    return (<>
        {props.page > 1 &&
            <Link href={`?page=${props.page - 1}`} className={'mx-2 font-bold hover:underline'}>Předchozí strana</Link>}
        {props.canGoNext &&
            <Link href={`?page=${props.page + 1}`} className={'mx-2 font-bold hover:underline'}>Další strana</Link>}
        {props.page > 1 && <Link href={`?page=1`} className={'mx-2 font-bold hover:underline'}>První strana</Link>}
        {(props.canGoNext && props.lastPage !== props.page) &&
            <Link href={`?page=${props.lastPage}`} className={'mx-2 font-bold hover:underline'}>Poslední strana</Link>}
        <p className={'ml-2 text-gray-500'}>Strana {props.page} z {props.lastPage}</p>
    </>)
}

function gameCard(props: {
    uuid: string, name: string, createdAt: string, updatedAt: string, difficulty: string
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

    const router = useRouter()

    const deleteGame = () => {
        (async () => {
            const result1 = await fetch(`/api/v1/games/${props.uuid}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (result1.ok)
                router.reload()
        })()
    }

    return (<div className="border-2 border-white rounded-md my-2">
        <h2 className={'text-2xl font-bold m-2'}>{props.name}</h2>
        <Image src={icon} alt={props.difficulty} height={32} width={32} className={'ml-2'}/>
        <p>
            <Link className={'mx-2 font-bold hover:underline'} href={`/game/${props.uuid}`}>Zobrazit hru</Link>
            <Link className={'mx-2 font-bold hover:underline'} href={`/game/${props.uuid}/edit`}>Upravit hru</Link>
            <a onClick={deleteGame} className={'mx-2 font-bold text-red-600 hover:underline'}>Smazat hru</a>
        </p>
        <p className={'ml-2 mb-1'}>
            <span>{`Vytvořeno ${formatDate(dateCreated)}`}</span>
        </p>
    </div>)
}

export default function Home(props: InferGetServerSidePropsType<typeof getServerSideProps>) {

    const [existingGame, setExistingGame] = React.useState(false);

    React.useEffect(() => {
        if (localStorage.getItem("game")) {
            setExistingGame(true);
        }
    }, [setExistingGame])

    return (<>
        <Metadata title={'Úvodní stránka'} description={'Vítejte v Think different Academy!'}/>
        <main className={`w-3/4 m-auto ${dosis.className}`}>
            <div className={'m-6 text-center'}>
                <Image src={Logo} alt={"Think different Academy"}/>
            </div>

            <div className={'m-auto text-center'}>
                <Link href={'/game'}>
                    <button className={'w-32 bg-[#0070BB] p-2 px-4 rounded-lg drop-shadow-md'}>
                        {existingGame ? `Pokračovat ve hře` : `Začít novou hru`}
                    </button>
                </Link>
            </div>

            {paginationButtons(props)}

            {props.games.map(x => {
                if (!x.difficulty) return null;

                return gameCard({
                    uuid: x.uuid, name: x.name, createdAt: x.createdAt, updatedAt: x.updatedAt, difficulty: x.difficulty
                })
            })}

            {paginationButtons(props)}
        </main>
    </>);
}
