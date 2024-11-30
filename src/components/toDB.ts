
export function toDbBoard(inputBoard: ("X" | "O" | "")[][]): { x: number; y: number; state: number }[] | "Semantic error" {
    let outputBoard: { x: number; y: number; state: number }[] = [];

    for (let i in inputBoard) {
        for (let j in inputBoard[i]) {
            const tile = inputBoard[i][j];
            if (tile != "X" && tile != "O" && tile != "") {
                return "Semantic error";
            }

            let tileInt = -1;
            if (tile == "X") {
                tileInt = 1;
            } else if (tile == "O") {
                tileInt = 2;
            } else {
                tileInt = 0;
            }

            outputBoard.push({
                x: parseInt(i),
                y: parseInt(j),
                state: tileInt
            })
        }
    }

    return outputBoard;
}

export function toDbDifficulty(difficulty: "beginner" | "easy" | "medium" | "hard" | "extreme"): number | "Invalid value" {
    if (difficulty == "beginner") {
        return 0;
    } else if (difficulty == "easy") {
        return 1;
    } else if (difficulty == "medium") {
        return 2;
    } else if (difficulty == "hard") {
        return 3;
    } else if (difficulty == "extreme") {
        return 4;
    } else {
        return "Invalid value";
    }
}