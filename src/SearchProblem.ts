/**
 * Probably I should create an interface or something to have
 * state logic encapsulated inside the SearchProblem.
 */
import { BinaryHeap } from "./Utils"

// Abstract class for defining states for a particular problem
export abstract class State {
    prev: State
    action: string;
    constructor (prev: State, action: string) { 
        this.prev = prev;
        this.action = action;
    }

    abstract equals(otherState: State): boolean;
    abstract hash(): string;
}

// Abstract class for a search problem
export abstract class SearchProblem {
    abstract getStartState() : State;
    abstract isGoalState(state: State) : boolean;
    abstract getSuccessors(state: State) : State[];
    abstract getCostOfAction(state: State) : number;
}

export class RouteProblemState extends State {
    position: [number, number]
    cost: number
    constructor (position: [number, number], cost: number, prev: State = null, action: string = null) {
        super(prev, action);
        this.position = position;
        this.cost = cost;
    }

    equals(otherState: RouteProblemState): boolean {
        return this.position[0] === otherState.position[0] 
            && this.position[1] === otherState.position[1];
    }

    hash(): string {
        return this.position.toString();
    }
}

// Defines a route problem with visited restriction
export class RouteProblem extends SearchProblem {
    initialPosition: [number, number]
    goalPosition: [number, number]
    visited: boolean[][]

    constructor (initialPosition: [number, number], goalPosition: [number, number], visited: boolean[][]) {
        super();
        this.initialPosition = initialPosition;
        this.goalPosition = goalPosition;
        this.visited = visited;
    }

    private coordIsGoal(x, y) {
        return x === this.goalPosition[1] && y === this.goalPosition[0];
    }

    getStartState() {
        return new RouteProblemState(this.initialPosition, 0);
    }

    isGoalState(state: RouteProblemState) : boolean{
        return state.position[0] === this.goalPosition[0]
            && state.position[1] === this.goalPosition[1];
    }

    getSuccessors(state: RouteProblemState): State[] {
        let x: number = state.position[1];
        let y: number = state.position[0];
        let m: number = this.visited.length;
        let n: number = this.visited[0].length;
        let cost: number = state.cost;

        let successors: RouteProblemState[] = [];
        if (x > 0 && (this.visited[y][x - 1] || this.coordIsGoal(x - 1, y))) {
            successors.push(new RouteProblemState([y, x - 1], cost + 1, state, "left"));
        }
        if (x < n - 1 && (this.visited[y][x + 1] || this.coordIsGoal(x + 1, y))) {
            successors.push(new RouteProblemState([y, x + 1], cost + 1, state, "right"));
        }
        if (y > 0 && (this.visited[y - 1][x] || this.coordIsGoal(x, y - 1))) {
            successors.push(new RouteProblemState([y - 1, x], cost + 1, state, "up"));
        }
        if (y < m - 1 && (this.visited[y + 1][x] || this.coordIsGoal(x, y + 1))) {
            successors.push(new RouteProblemState([y + 1, x], cost + 1, state, "down"));
        }
        return successors;
    }

    getCostOfAction(state: RouteProblemState): number {
        return state.cost;
    }
}

class StateSet {
    set: Set<string>
    constructor () {
        this.set = new Set<string>();
    }

    add(value: State): void {
        this.set.add(value.hash());
    }

    has(value: State): boolean {
        return this.set.has(value.hash());
    }
}

export function aStar(problem: SearchProblem, heuristic: (state: State) => number ) {
    let frontier = new BinaryHeap<State>(
        (state: State) => heuristic(state) + problem.getCostOfAction(state));

    frontier.push(problem.getStartState());
    let explored = new StateSet();
    
    while (frontier.size() !== 0) {
        let state: State = frontier.pop();
        explored.add(state);

        if (problem.isGoalState(state)) {
            let curr: State = state;
            let path = [];
            while (curr.prev !== null) {
                path.unshift(curr.action);
                curr = curr.prev;
            }
            return path;
        }

        let neighbors: State[] = problem.getSuccessors(state);
        neighbors.forEach( (neighbor) => {
            if (!explored.has(neighbor)) {
                frontier.push(neighbor);
            }
        });
    }
    return [];
}
