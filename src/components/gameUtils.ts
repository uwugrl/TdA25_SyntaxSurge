export function getNextSymbol(board: ("X" | "O" | "")[][]): "X" | "O" {
    let o = 0,
        x = 0;

    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j] === "X") {
                x++;
            } else if (board[i][j] === "O") {
                o++;
            }
        }
    }

    return x > o ? "O" : "X";
}

export function checkCorrectStartingPlayer(board: ("X" | "O" | "")[][]): boolean {
    let o = 0,
        x = 0;

    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j] === "X") {
                x++;
            } else if (board[i][j] === "O") {
                o++;
            }
        }
    }

    return x >= o;
}

export function evalWinner(board: ("X" | "O" | "")[][], k: number = 5): "X" | "O" | "" {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j] === "") {
                continue;
            }

            // Check horizontal
            if (j + k - 1 < board[i].length) {
                let win = true;
                for (let l = 1; l < k; l++) {
                    if (board[i][j] !== board[i][j + l]) {
                        win = false;
                        break;
                    }
                }

                if (win) {
                    return board[i][j];
                }
            }

            // Check vertical
            if (i + k - 1 < board.length) {
                let win = true;
                for (let l = 1; l < k; l++) {
                    if (board[i][j] !== board[i + l][j]) {
                        win = false;
                        break;
                    }
                }

                if (win) {
                    return board[i][j];
                }
            }

            // Check diagonal (top-left to bottom-right)
            if (i + k - 1 < board.length && j + k - 1 < board[i].length) {
                let win = true;
                for (let l = 1; l < k; l++) {
                    if (board[i][j] !== board[i + l][j + l]) {
                        win = false;
                        break;
                    }
                }

                if (win) {
                    return board[i][j];
                }
            }

            // Check diagonal (top-right to bottom-left)
            if (i + k - 1 < board.length && j - k + 1 >= 0) {
                let win = true;
                for (let l = 1; l < k; l++) {
                    if (board[i][j] !== board[i + l][j - l]) {
                        win = false;
                        break;
                    }
                }

                if (win) {
                    return board[i][j];
                }
            }
        }
    }

    return "";
}

export function checkCorrectGameSize(board: ("X" | "O" | "")[][]): boolean {
    if (board.length != 15) {
        return false;
    }

    for (const i of board) {
        if (i.length != 15) {
            return false;
        }
    }

    return true;
}

export function determineGameState(board: ("X" | "O" | "")[][]): "opening" | "midgame" | "endgame" {
    const next = getNextSymbol(board),
        theoreticalWinner = evalWinner(board, 4);
    if (theoreticalWinner === next) {
        return "endgame";
    }

    if (evalWinner(board) != "") {
        return "endgame";
    }

    let o = 0,
        x = 0;

    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j] === "X") {
                x++;
            } else if (board[i][j] === "O") {
                o++;
            }
        }
    }

    if (x + o <= 5) {
        return "opening";
    }

    if (isGameFull(board)) return "endgame";

    return "midgame";
}

export function isGameFull(board: ("X" | "O" | "")[][]): boolean {
    for (const i of board) {
        for (const j of i) {
            if (j === "") return false;
        }
    }

    return true;
}
