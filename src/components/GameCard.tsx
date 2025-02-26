import React from "react";
import { Card, Typography, Button } from "@mui/joy";
import Link from "next/link";
import { formatDate } from "./base";

export function GameCard(props: {
    uuid: string, name: string, createdAt: string, updatedAt: string, difficulty: string, ended: boolean
}) {
    const dateCreated = new Date(props.createdAt);

    return (<Card>
        <Typography level='h2' color={props.ended ? "neutral" : "success"}>{props.name}</Typography>
        <Link href={`/game/${props.uuid}`}>
            <Button variant="outlined" color="neutral">
                Zobrazit hru
            </Button>
        </Link>
        <Typography level='body-sm'>{`Vytvořeno ${formatDate(dateCreated)}`}</Typography>
    </Card>)
}