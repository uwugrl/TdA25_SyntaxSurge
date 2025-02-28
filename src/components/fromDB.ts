export function fromDbDifficulty(difficulty: number) {
    if (difficulty == 0) {
        return "beginner";
    } else if (difficulty == 1) {
        return "easy";
    } else if (difficulty == 2) {
        return "medium";
    } else if (difficulty == 3) {
        return "hard";
    } else if (difficulty == 4) {
        return "extreme";
    }
}

export function fromDbBoard(
    inputBoard: {
        x: number;
        id: number;
        y: number;
        gameId: string;
        state: number;
    }[]
) {
    const outputBoard: ("X" | "O" | "")[][] = []; //Board[x][y] = "X" | "O" | ""

    let currentRow: ("X" | "O" | "")[] = [];

    for (const i in inputBoard.sort((a, b) => a.x - b.x || a.y - b.y)) {
        let state = "";
        if (inputBoard[i].state == 1) {
            state = "X";
        } else if (inputBoard[i].state == 2) {
            state = "O";
        }

        currentRow.push(state as "X" | "O" | "");
        if (inputBoard[i].x != inputBoard[parseInt(i) + 1]?.x) {
            outputBoard.push(currentRow);
            currentRow = [];
        }
    }

    return outputBoard;
}
