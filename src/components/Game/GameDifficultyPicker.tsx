import { Card, CardContent, FormControl, FormHelperText, FormLabel, Option, Select, Typography } from "@mui/joy"
import React from "react"

export default function GameDifficultyPicker(props: {
    current: number, onChange: (x: number) => void, disabled: boolean
}) {

    return <>
        <FormControl>
            <FormLabel>Obtížnost hry</FormLabel>
            <Select value={props.current} onChange={(_, x) => props.onChange(x || 0)} disabled={props.disabled}>
                <Option value={1}>Začátečník</Option>
                <Option value={2}>Jednoduchá</Option>
                <Option value={3}>Pokročilá</Option>
                <Option value={4}>Těžká</Option>
                <Option value={5}>Nejtěžší</Option>
            </Select>
            <FormHelperText>Vyberte si obtížnost hry. Popis obtížnosti se zobrazí pod posuvníkem.</FormHelperText>
        </FormControl>

        {props.current === 1 && <Card orientation="horizontal">
            <img src={`/Icon/zarivka_beginner_bile.svg`} alt="Začátečník"
                  width={64} height={64} className='m-2'></img>
                <CardContent>                    
                    <Typography level="h3">Začátečník</Typography>
                    <Typography>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quam aspernatur, perspiciatis accusamus nihil earum error atque id dolores quas dolore totam autem. Illum molestias ipsum neque sit, veniam facilis dolorem?</Typography>
                </CardContent>
            </Card>}

            {props.current === 2 && <Card orientation="horizontal">
            <img src={`/Icon/zarivka_easy_bile.svg`} alt="Lehká" width={64}
                  height={64} className='m-2'></img>
                <CardContent>
                    <Typography level="h3">Jednoduchá</Typography>
                    <Typography>Lorem ipsum dolor sit amet consectetur adipisicing elit. Placeat illum eligendi quia esse, blanditiis voluptas vel ullam, modi dolor voluptatum at tenetur delectus! Facere aperiam eaque modi atque dolore minus?</Typography>
                </CardContent>
            </Card>}

            {props.current === 3 && <Card orientation="horizontal">
            <img src={`/Icon/zarivka_medium_bile.svg`} alt="Střední"
                  width={64} height={64} className='m-2'></img>
                <CardContent>
                    <Typography level="h3">Pokročilá</Typography>
                    <Typography>Lorem ipsum dolor sit amet consectetur adipisicing elit. Animi aliquam vel, nostrum cum debitis nemo distinctio eos laborum voluptas deserunt ipsa, commodi expedita maiores repudiandae. Laborum delectus non asperiores maiores.</Typography>
                </CardContent>
            </Card>}

            {props.current === 4 && <Card orientation="horizontal">
            <img src={`/Icon/zarivka_hard_bile.svg`} alt="Těžká" width={64}
                  height={64} className='m-2'></img>
                <CardContent>
                    <Typography level="h3">Těžká</Typography>
                    <Typography>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Explicabo, non quas asperiores, ullam fugit cum eos omnis illo quaerat iusto nisi est, veritatis aut a numquam perferendis sed ea minus.</Typography>
                </CardContent>
            </Card>}

            {props.current === 5 && <Card orientation="horizontal">
                <img src={`/Icon/zarivka_extreme_bile.svg`} alt="Extrémní"
                  width={64} height={64} className='m-2'></img>
                <CardContent>
                    <Typography level="h3">Nejtěžší</Typography>
                    <Typography>Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolores sint vero ipsa id consequuntur. Quos, nulla labore adipisci exercitationem facilis dolorum eveniet praesentium animi veritatis dolores, quo at? Beatae, consectetur?</Typography>
                </CardContent>
            </Card>}
    </>
}
