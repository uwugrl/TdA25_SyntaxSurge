
export function getNextSymbol(board: ("X" | "O" | "")[][]): ("X" | "O") {
    let x = 0;
    let o = 0;

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
    let x = 0;
    let o = 0;

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

export function evalWinner(board: ("X" | "O" | "")[][], k: number = 5): ("X" | "O" | "") {
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

export function determineGameState(board: ("X" | "O" | "")[][]): ("opening" | "midgame" | "endgame") {
    let next = getNextSymbol(board);
    let theoreticalWinner = evalWinner(board, 4);
    if (theoreticalWinner === next) {
        return "endgame";
    }

    let x = 0;
    let o = 0;

    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j] === "X") {
                x++;
            } else if (board[i][j] === "O") {
                o++;
            }
        }
    }

    if (x + o < 5) {
        return "opening";
    }

    return "midgame";
}
