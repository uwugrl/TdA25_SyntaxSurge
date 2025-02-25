
import { Link, Stack, Typography } from "@mui/joy"
import React from "react"

export default function Footer() {


    return <div className="absolute bottom-4">
        
        <Stack gap={1}>
            <Link href={'/about'} className={'text-[#0070BB]'}>
                <Typography>O aplikaci Think different Academy</Typography>
            </Link>
        </Stack>
    </div>
}
