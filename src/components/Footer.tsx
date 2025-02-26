
import { Link, Stack, Typography } from "@mui/joy"
import React from "react"

export default function Footer() {


    return <div>
        
        <Stack gap={1}>
            <Link href={'/about'} className={'text-[#0070BB]'}>
                <Typography>O aplikaci Think different Academy</Typography>
            </Link>
        </Stack>
            <br/>
            <br/>
            <br/>
    </div>
}
