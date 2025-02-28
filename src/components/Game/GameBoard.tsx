import React from "react";

export default function GameBoard(params: {
    board: ("X" | "O" | "")[][],
    interact?: (x: number, y: number) => void,
    allowInteract?: boolean
}) {

    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const canvasParentRef = React.useRef<HTMLDivElement>(null);

    const hasInit = React.useRef(false);

    const xImageRef = React.useRef<HTMLImageElement>();
    const oImageRef = React.useRef<HTMLImageElement>();

    React.useEffect(() => {
        draw();

        if (!hasInit.current && canvasParentRef.current && canvasRef.current) {
            hasInit.current = true;
            window.onresize = () => {
                draw();
            }

            xImageRef.current = new Image();
            xImageRef.current.src = '/Icon/X_cervene.svg';

            xImageRef.current.addEventListener("load", () => {
                draw();
            });

            oImageRef.current = new Image();
            oImageRef.current.src = '/Icon/O_modre.svg';

            oImageRef.current.addEventListener('load', () => {
                draw();
            });

            canvasRef.current.addEventListener('click', (ev: MouseEvent) => {
                if (canvasRef.current && canvasParentRef.current) {
                    const size = canvasParentRef.current.clientWidth / params.board.length;
                    const x = Math.floor((ev.clientX - canvasRef.current.offsetLeft + window.scrollX) / size);
                    const y = Math.floor((ev.clientY - canvasRef.current.offsetTop + window.scrollY) / size);
                    
                    console.log(`Clicked at: ${ev.clientX}, ${ev.clientY} → Converted to board: (${x}, ${y})`);

                    if (params.interact && params.allowInteract) {
                        params.interact(x, y);
                    }
                }
            })
        }
    });

    const draw = () => {
        if (!canvasRef.current || !canvasParentRef.current) {
            return;
        }

        const context = canvasRef.current.getContext("2d");
        if (!context) {
            return;
        }

        canvasRef.current.style.height = `${canvasParentRef.current.clientWidth}px`;
        canvasRef.current.style.width = `${canvasParentRef.current.clientWidth}px`;
        canvasRef.current.width = canvasParentRef.current.clientWidth;
        canvasRef.current.height = canvasParentRef.current.clientWidth;

        context.fillStyle = '#1a1a1a';
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        context.fillStyle = '#444';
        
        for (let i = 0; i < params.board.length; i++) {
            const y = (canvasParentRef.current.clientWidth / params.board.length) * i;
            const size = canvasParentRef.current.clientWidth / params.board.length - 2;
            if (xImageRef.current && oImageRef.current) {
                xImageRef.current.width = canvasParentRef.current.clientWidth;
                oImageRef.current.width = canvasParentRef.current.clientWidth;
            }
            
            for (let j = 0; j < params.board[i].length; j++) {
                const x = (canvasParentRef.current.clientWidth / params.board.length) * j;

                context.fillRect(x, y, size, size);

                if (xImageRef.current && params.board[i][j] === "X") {
                    context.drawImage(xImageRef.current, x + 4, y + 4, size - 8, size - 8);
                }
                
                else if (oImageRef.current && params.board[i][j] === "O") {
                    context.drawImage(oImageRef.current, x + 4, y + 4, size - 8, size - 8);
                }
            }
        }
    }
    
    return (
        <>
            <div ref={canvasParentRef} style={{
                maxWidth: '800px',
                margin: 'auto'
            }}>
                <canvas ref={canvasRef}></canvas>
            </div>
        </>
    )

}
