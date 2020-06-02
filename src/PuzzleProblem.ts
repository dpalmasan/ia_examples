import {
    SearchProblem,
    State,
    aStar
} from "./SearchProblem"


enum Direction {
    UP = "up",
    DOWN = "down",
    LEFT = "left",
    RIGHT = "right"
}

class EightPuzzle {
    board
    size: number
    constructor(board: number[][]) {
        this.board = board;
        this.size = 3
    }

    private getZeroPos() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.board[i][j] === 0) {
                    return [i, j];
                }
            }
        }
        throw new Error("Invalid board!");
    }

    move (direction: string) {
        let zeroPos = this.getZeroPos();
        let zeroRow = zeroPos[0];
        let zeroCol = zeroPos[1];
        let tmp: number = this.board[zeroRow][zeroCol];
        switch (direction) {
            case Direction.UP: {
                this.board[zeroRow][zeroCol] = this.board[zeroRow - 1][zeroCol];
                this.board[zeroRow - 1][zeroCol] = tmp;
                break;
            }
            case Direction.DOWN: {
                this.board[zeroRow][zeroCol] = this.board[zeroRow + 1][zeroCol];
                this.board[zeroRow + 1][zeroCol] = tmp;
                break;
            }
            case Direction.LEFT: {
                this.board[zeroRow][zeroCol] = this.board[zeroRow][zeroCol - 1];
                this.board[zeroRow][zeroCol - 1] = tmp;
                break;
            }
            case Direction.RIGHT: {
                this.board[zeroRow][zeroCol] = this.board[zeroRow][zeroCol + 1];
                this.board[zeroRow][zeroCol + 1] = tmp;
                break;
            }
            default: {
                console.log(direction);
                throw new Error("Invalid direction!");
            }
        }
    }

    getPossibleMoves() {
        let moves = [];
        let zeroPos = this.getZeroPos();
        let zeroRow = zeroPos[0];
        let zeroCol = zeroPos[1];

        if (zeroRow > 0) {
            moves.push(Direction.UP);
        }
        if (zeroRow < this.size - 1) {
            moves.push(Direction.DOWN);
        }
        if (zeroCol > 0) {
            moves.push(Direction.LEFT);
        }
        if (zeroCol < this.size - 1) {
            moves.push(Direction.RIGHT);
        }
        return moves;
    }

    clone() {
        let copyBoard = [];
        for (let i = 0; i < this.size; i++) {
            let row = [];
            for (let j = 0; j < this.size; j++) {
                row.push(this.board[i][j]);
            }
            copyBoard.push(row);
        }
        return new EightPuzzle(copyBoard);
    }

    randomize(iter: number = 100) {
        for (let i = 0; i < iter; i++) {
            let validMoves = this.getPossibleMoves();
            let randomMove = validMoves[Math.floor(Math.random()*validMoves.length)];
            this.move(randomMove);
        }
    }

    hash(): string {
        return this.board.flat().join("");

    }

    equals(otherPuzzle: EightPuzzle) {
        return this.hash() === otherPuzzle.hash();
    }
}

class EightPuzzleState extends State {
    puzzle: EightPuzzle
    moves: number
    constructor(puzzle: EightPuzzle, moves: number, prev: State = null, action: string = null) {
        super(prev, action);
        this.puzzle = puzzle;
        this.moves = moves;
    }

    equals(otherState: EightPuzzleState) {
        return this.puzzle.equals(otherState.puzzle);
    }

    hash() {
        return this.puzzle.hash();
    }
}

class EightPuzzleProblem extends SearchProblem {
    initialPuzzle: EightPuzzle
    solvedPuzzle: EightPuzzle
    constructor (puzzle: EightPuzzle, solvedPuzzle: EightPuzzle) {
        super();
        this.initialPuzzle = puzzle;
        this.solvedPuzzle = solvedPuzzle;
    }

    getCostOfAction(state: EightPuzzleState): number {
        return state.moves;
    }

    getStartState(): EightPuzzleState {
        return new EightPuzzleState(this.initialPuzzle, 0);
    }

    getSuccessors(state: EightPuzzleState) {
        let successors = [];
        let validMoves = state.puzzle.getPossibleMoves();
        for (const direction of validMoves) {
            let puzzle: EightPuzzle = state.puzzle.clone();
            puzzle.move(direction);
            successors.push(new EightPuzzleState(puzzle, state.moves + 1, state, direction));
        }
        return successors;
    }

    isGoalState(state: EightPuzzleState) {
        return state.puzzle.equals(this.solvedPuzzle);
    }

}

/**
 * Computes Manhattan distance heuristic. This will only work
 * for the classic puzzle goal configuration and only for a 3x3
 * board. This can be generalized, but I left that as an exercise.
 * @param state state to be evaluated.
 */
function classicManhattanDistance(state: EightPuzzleState) {
    if (state.puzzle.board.length !== 3) {
        throw new Error("This heuristic is only for 3x3 puzzle, don´t be lazy!");
    }
    let board = state.puzzle.board;
    let manhattanDistance = 0;

    let goalPos = {
        0: [0, 0], 1: [0, 1], 2: [0, 2],
        3: [1, 0], 4: [1, 1], 5: [1, 2],
        6: [2, 0], 7: [2, 1], 8: [2, 2]
    }

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            let rowGoal = goalPos[board[i][j]][0];
            let colGoal = goalPos[board[i][j]][1];
            manhattanDistance += Math.abs(i - rowGoal) + Math.abs(j - colGoal);
        }
    }
    return manhattanDistance;
}

export {
    EightPuzzle,
    EightPuzzleProblem,
    classicManhattanDistance
}