
import React from "react";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import localFont from "next/font/local";
import { Stack, Tab, TabList, TabPanel, Tabs, Typography } from "@mui/joy";
import { getUserList, validateAdminAccount } from "@/components/backendUtils";
import UserCard from "@/components/AdminPanel/UserCard";

const dosis = localFont({src: './fonts/Dosis-VariableFont_wght.ttf'});

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    const {token} = ctx.req.cookies as {token: string | undefined};
    if (!token) return { notFound: true };
    if (!await validateAdminAccount(token)) return {notFound:true};

    const users = await getUserList();

    return {
        props: {
            users
        }
    }
}

export default function AdminPanel(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
    return <main className={`w-3/4 m-auto ${dosis.className}`}>
        <Typography level="h1">Admin Panel</Typography>
        <Tabs>
            <TabList>
                <Tab>Uživatelé</Tab>
            </TabList>

            <TabPanel value={0}>
                <Stack gap={1}>
                    {props.users.map(x => (
                        <UserCard user={x} key={x.id} />
                    ))}
                </Stack>
            </TabPanel>
        </Tabs>
    </main>
}