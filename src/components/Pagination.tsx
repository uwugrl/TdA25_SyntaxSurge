import React from "react";
import { Button, ButtonGroup } from "@mui/joy";

export default function Pagination(props: {
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