import React from "react";

export default function GameBoardFreeEdit(params: {
    board: ("X" | "O" | "")[][],
    setBoard: (board: ("X" | "O" | "")[][]) => void,
    disabled?: boolean
}) {

    return (
        <>
            <table>
                <tbody>
                {params.board.map((x, i) => <tr key={i}>
                        {x.map((y, j) => {
                            function change(event: React.ChangeEvent<HTMLSelectElement>) {
                                params.setBoard(
                                    params.board.map((z, k) => {
                                        if (k != i) {return z;}
                                        return z.map((a, l) => {
                                            if (l != j) {return a;}
                                            return event.currentTarget.value as ("X" | "O" | "");
                                        });
                                    })
                                );
                            }


                            return <td key={j}>
                                <select value={y} onChange={change} className='bg-[#1a1a1a]' disabled={params.disabled}>
                                    <option value="X" defaultChecked={y === "X"}>X</option>
                                    <option value="O" defaultChecked={y === "O"}>O</option>
                                    <option value="" defaultChecked={y === ""}></option>
                                </select>
                            </td>
                        })}
                    </tr>)}
                </tbody>
            </table>
        </>
    )

}