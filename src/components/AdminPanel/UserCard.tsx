
import React from "react"
import { Button, Card, CardContent, Input, Modal, ModalClose, ModalDialog, Stack, Typography } from "@mui/joy"
import { apiPost } from "../frontendUtils";

export default function UserCard(props: {
    user: {
        id: string,
        username: string,
        email: string,
        elo: number,
        banned: boolean,
        banReason: string | null,
        admin: boolean
    },
    userBanned: (reason: string) => void,
    userUnbanned: () => void
}) {
    const [eloChange, setEloChange] = React.useState(false);
    const [elo, setElo] = React.useState(props.user.elo);
    const [eloError, setEloError] = React.useState("");
    const [savingElo, setSavingElo] = React.useState(false);

    const [ban, setBan] = React.useState(false);
    const [banReason, setBanReason] = React.useState("");
    const [banError, setBanError] = React.useState("");
    const [banLoading, setBanLoading] = React.useState(false);

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

    const banAccount = () => {
        setBanLoading(true);
        apiPost('/admin/banuser', {
            userId: props.user.id,
            reason: banReason
        }).then(() => {
            setBanLoading(false);
            setBan(false);
            props.userBanned(banReason);
        }).catch(x => {
            setBanLoading(false);
            setBanError(x);
        })
    }
    const unbanAccount = () => {
        setBanLoading(true);
        apiPost('/admin/unbanuser', {
            userId: props.user.id
        }).then(() => {
            setBanLoading(false);
            setBan(false);
            props.userUnbanned();
        }).catch(x => {
            setBanLoading(false);
            setBanError(x);
        });
    }

    return <>
        <Card>
            <Typography level="h3">{props.user.username}</Typography>
            <CardContent>
                {props.user.admin && <Typography color="danger">Administrátor</Typography>}
                <Typography>Email: {props.user.email}</Typography>
                <Typography>ELO: {elo}</Typography>
                {props.user.banned && props.user.banReason && <Typography color="danger">{`Důvod banu: ${props.user.banReason}`}</Typography>}
                <Stack direction="row" gap={1}>
                    <Button onClick={() => setEloChange(true)}>Změnit ELO</Button>
                    {(!props.user.banned && !props.user.admin) && <Button onClick={() => setBan(true)} color="danger">Zabanovat</Button>}
                    {(props.user.banned && !props.user.admin) && <Button onClick={() => unbanAccount()} color="danger">Odbanovat</Button>}
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

        <Modal open={ban} onClose={() => setBan(false)}>
            <ModalDialog>
                {banLoading || <ModalClose />}
                <Stack gap={1}>
                    <Typography level="h3">{`Zabanovat ${props.user.username}`}</Typography>
                    <Typography>Důvod banu</Typography>
                    <Input disabled={banLoading} type="text" value={banReason} onChange={x => setBanReason(x.currentTarget.value)}></Input>
                    <Button disabled={banLoading} onClick={banAccount}>Zabanovat</Button>
                    {banError && <Typography color="danger">{banError}</Typography>}
                </Stack>
            </ModalDialog>
        </Modal>
    </>
}
