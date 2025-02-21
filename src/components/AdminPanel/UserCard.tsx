
import React from "react"
import { Button, Card, CardContent, Input, Modal, ModalClose, ModalDialog, Stack, Typography } from "@mui/joy"
import { apiPost } from "../frontendUtils";

export default function UserCard(props: {
    user: {
        id: string,
        username: string,
        email: string,
        elo: number
    }
}) {
    const [eloChange, setEloChange] = React.useState(false);
    const [elo, setElo] = React.useState(props.user.elo);
    const [eloError, setEloError] = React.useState("");
    const [savingElo, setSavingElo] = React.useState(false);

    const saveElo = () => {
        setSavingElo(true);
        apiPost('/admin/setelo', {
            userId: props.user.id,
            elo
        }).then(() => {
            setSavingElo(false);
            setEloChange(false);
        }).catch(e => {
            setSavingElo(false);
            setEloError(e);
        })
    }

    return <>
        <Card>
            <Typography level="h3">{props.user.username}</Typography>
            <CardContent>
                <Typography>Email: {props.user.email}</Typography>
                <Typography>ELO: {elo}</Typography>
                <Stack direction="row">
                    <Button onClick={() => setEloChange(true)}>Změnit ELO</Button>
                </Stack>
            </CardContent>
        </Card>

        <Modal open={eloChange} onClose={() => setEloChange(false)}>
            <ModalDialog>
                {savingElo || <ModalClose />}
                <Stack gap={1}>
                    <Typography level="h3">{`Změnit ELO uživatele ${props.user.username}`}</Typography>
                    <Input disabled={savingElo} type="number" value={elo} onChange={x => setElo(Number(x.currentTarget.value))}></Input>
                    <Button disabled={savingElo} onClick={saveElo}>Uložit</Button>
                    {eloError && <Typography color="danger">{eloError}</Typography>}
                </Stack>
            </ModalDialog>
        </Modal>
    </>
}
