import React from "react";
import { Card, Typography, Button } from "@mui/joy";
import Link from "next/link";
import Image from "next/image";
import { formatDate } from "./base";

export function GameCard(props: {
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