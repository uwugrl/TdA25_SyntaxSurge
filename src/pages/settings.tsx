
import { getAccountFromToken, validateAccount } from "@/components/backendUtils";
import { fromDbBoard, fromDbDifficulty } from "@/components/fromDB";
import { apiPost } from "@/components/frontendUtils";
import { GameCard } from "@/components/GameCard";
import { determineGameState } from "@/components/gameUtils";
import Header from "@/components/Header";
import { Button, Input, Stack, Tab, TabList, TabPanel, Tabs, Typography } from "@mui/joy"
import { PrismaClient } from "@prisma/client";
import { passwordStrength } from "check-password-strength";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import React, { useState } from "react"


function ProfileSettings(props: {
    email: string,
    aboutMe: string
}) {

    const [email, setEmail] = React.useState(props.email);
    const [aboutMe, setAboutMe] = React.useState("");

    const [success, setSuccess] = React.useState(false);
    const [error, setError] = React.useState("");
    const [loading, setLoading] = React.useState(false);

    const save = () => {
        setLoading(true);
        setSuccess(false);
        setError("");

        apiPost('/user/profile', {
            email
        }).then(() => {
            setLoading(false);
            setSuccess(true);
        }).catch(x => {
            setError(x);
            setLoading(false);
        });
    }

    return <>
        <Stack gap={1}>
            <Typography level="h1">Nastavení profilu</Typography>

            <Typography>E-mailová adresa</Typography>
            <Input type="email" disabled={loading} value={email} onChange={x => setEmail(x.currentTarget.value)} />
            
            <Typography>O mně</Typography>
            <Input type="textarea" disabled={loading} value={aboutMe} onChange={x => setAboutMe(x.currentTarget.value)} />
            
            {success && <Typography color="success">Profil byl uložen.</Typography>}
            {error && <Typography color="danger">{error}</Typography>}
            
            <Button onClick={save} disabled={loading}>Uložit profil</Button>
        </Stack>
    </>
}

function ProfileSecurityPasswordChange () {
    const [password, setPassword] = useState("");
    const [passwordRepeat, setPasswordRepeat] = useState("");

    const [passwordCorrect, setPasswordCorrect] = useState(true); 

    const [passwordStrengthVal, setPasswordStrengthVal] = useState("");
    const [passwordColor, setPasswordColor] = useState<'red' | 'yellow' | 'orange' | 'green'>('red');

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const recalculatePasswordStrength = (x: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(x.currentTarget.value);

        const passwordStrengthValue = passwordStrength(x.currentTarget.value).value;

        switch (passwordStrengthValue) {
            case 'Too weak':
                setPasswordColor('red');
                setPasswordStrengthVal('Příliš slabé')
                break;
            case 'Weak':
                setPasswordColor('orange');
                setPasswordStrengthVal("Slabé")
                break;
            case 'Medium':
                setPasswordColor('yellow');
                setPasswordStrengthVal("Dobré");
                break;
            case 'Strong':
                setPasswordColor('green');
                setPasswordStrengthVal("Silné");
                break;
        }
    }

    const recheckPassword = (x: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordRepeat(x.currentTarget.value);
        setPasswordCorrect(x.currentTarget.value === password);
    }

    const updatePassword = () => {
        if (password !== passwordRepeat) {
            setPasswordCorrect(false);
            return;
        }

        setError("");
        setLoading(true);
        setSuccess(false);

        apiPost('/user/changepass', {
            password
        }).then(() => {
            setLoading(false);
            setSuccess(true);
        }).catch(x => {
            setError(x);
            setLoading(false);
        })
    }

    return <>
        <Typography level="h2">Změnit heslo</Typography>
        <Typography>Nové heslo</Typography>
        <Input disabled={loading} type="password" onChange={recalculatePasswordStrength} />
        <Typography sx={{
            color: passwordColor
        }}>{passwordStrengthVal}</Typography>
        <Typography>Nové heslo znovu</Typography>
        <Input disabled={loading} type="password" onChange={recheckPassword} />
        {passwordCorrect || <Typography color="danger">Hesla se neshodují.</Typography>}
        <Button disabled={loading} onClick={updatePassword}>Změnit heslo</Button>
        {error && <Typography color="danger">{error}</Typography>}
        {success && <Typography color="success">Heslo bylo úspěšně aktualizováno.</Typography>}
    </>
}

function ProfileSecurity() {

    const [logOutAllLoading, setLogOutAllLoading] = useState(false);
    const [logOutAllError, setLogOutAllError] = useState("");
    const [logOutCount, setLogOutCount] = useState(0);
    const [logOutSuccess, setLogOutSuccess] = useState(false);

    const logOutAll = () => {
        setLogOutAllLoading(true);
        setLogOutAllError('');
        setLogOutCount(0);
        setLogOutSuccess(false);

        apiPost('/user/logoutall', {}).then(x => {
            const y = x as { logOutCount: number };
            setLogOutCount(y.logOutCount);
            setLogOutAllLoading(false);
            setLogOutSuccess(true);
        }).catch(x => {
            setLogOutAllError(x);
            setLogOutAllLoading(false);
        })
    }

    return <>
        <Stack gap={1}>
            <ProfileSecurityPasswordChange />
            <Button color="danger" disabled={logOutAllLoading} onClick={logOutAll}>Odhlásit se všude</Button>
            {logOutAllError && <Typography color="danger">{logOutAllError}</Typography>}
            {logOutSuccess && <Typography color="success">{`Úspěšně odhlášeno ${logOutCount} zařízení.`}</Typography>}
        </Stack>
    </>
}

function ProfileGames (props: {
    games: { uuid: string, name: string, difficulty: string, createdAt: string, updatedAt: string, gameState: "opening" | "midgame" | "endgame" }[]
}) {
    return props.games.map(x => (
        <GameCard key={x.uuid} uuid={x.uuid} name={x.name} createdAt={x.createdAt} updatedAt={x.updatedAt}
    difficulty={x.difficulty} ended={x.gameState === "endgame"}/>
    ))
}

export async function getServerSideProps(ctx:GetServerSidePropsContext) {
    const { token } = ctx.req.cookies;
    
    if (!token) return { props: { error: 'Unauthorized' } };
    if (!await validateAccount(token)) return { props: { error: 'Unauthorized' } };
    
    const prisma = new PrismaClient();
    await prisma.$connect();

    const user = await getAccountFromToken(token);
    if (!user) return { props: { error: 'Unauthorized' } };
    
    const games = await prisma.game.findMany({

        where: {
            OR: [
                {player1ID: user.userId},
                {player2ID: user.userId}
            ]
        },
        include: {
            board: true
        }
    });

    return {
        props: {
            user: {
                email: user.email,
                aboutMe: user.aboutMe,
                games: games.map(x => ({
                    uuid: x.id,
                    name: x.name,
                    difficulty: fromDbDifficulty(x.difficulty) ?? 'medium',
                    createdAt: x.createdAt.toISOString(),
                    updatedAt: x.updatedAt.toISOString(),
                    gameState: determineGameState(fromDbBoard(x.board))
                }))
            }
        }
    }
}

export default function Settings(props: InferGetServerSidePropsType<typeof getServerSideProps>) {

    return <>
        <main className="w-3/4 m-auto">
            <br />
            <br />
            <br />
            <br />
            <br />

            {props.error && <Typography>{`Chyba: ${props.error}`}</Typography>}

            {props.user && <>
                <Tabs>
                    <TabList>
                        <Tab>Profil</Tab>
                        <Tab>Zabezpečení</Tab>
                        <Tab>Historie her</Tab>
                    </TabList>

                    <TabPanel value={0}>
                        <ProfileSettings email={props.user.email} aboutMe={props.user.aboutMe} />
                    </TabPanel>

                    <TabPanel value={1}>
                        <ProfileSecurity />
                    </TabPanel>

                    <TabPanel value={2}>
                        <ProfileGames games={props.user.games} />
                    </TabPanel>
                </Tabs>
            </>}

            <Header />
        </main>
    </>
}