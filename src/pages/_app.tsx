import React from "react";
import "@/styles/globals.css";
import type {AppProps} from "next/app";
import {CssVarsProvider, extendTheme} from "@mui/joy";
import localFont from "next/font/local";

const dosis = localFont({src: './fonts/Dosis-VariableFont_wght.ttf'});

const theme = extendTheme({
    fontFamily: {
        body: dosis.style.fontFamily,
        display: dosis.style.fontFamily
    },
    colorSchemes: {
        dark: {
            palette: {
                background: {
                    surface: '1a1a1a'
                }
            }
        }
    }
})

export default function App({Component, pageProps}: AppProps) {
    return <>
        <CssVarsProvider defaultMode='dark' theme={theme}/>
        <Component {...pageProps} />
    </>
}
