export default function GameBoard(params: {
    board: ("X" | "O" | "")[][],
    interact?: (x: number, y: number) => void,
    allowInteract?: boolean
}) {

    return (
        <>
            <table>
                <tbody>
                    {params.board.map((rows, y) => {
                        return <tr key={y}>
                            {rows.map((cols, x) => {
                                function interact(event: React.MouseEvent) {
                                    event.stopPropagation();

                                    if (!params.allowInteract) {
                                        return;
                                    }

                                    if (params.allowInteract) {
                                        params.interact!(y, x);
                                        console.log(`Interacted at X: ${x}, Y: ${y}`);
                                    }
                                }

                                return <td key={x}>
                                    {cols === "X" && <img onClick={interact} src='/Icon/X_cervene.svg' alt='X' width={32} height={32}></img>}
                                    {cols === "O" && <img onClick={interact} src='/Icon/O_modre.svg' alt='O' width={32} height={32}></img>}
                                    {cols === "" && <div onClick={interact} className='m-0 p-0 w-[32px] h-[32px] bg-gray-800 rounded-md'></div>}
                                </td>
                            })}
                        </tr>
                    })}
                </tbody>
            </table>
        </>
    )

}
