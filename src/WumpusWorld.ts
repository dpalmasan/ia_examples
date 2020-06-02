import {
    BooleanLiteral,
    CnfClause,
    BinClause,
    Negation,
    Literal,
    Operation,
    Formula
} from "../src/PropositionalLogic"

import {
    KB,
    plResolution,
} from "../src/KB"

import {
    RouteProblem,
    RouteProblemState,
    aStar
} from "../src/SearchProblem"

function wumpusGrid(squareInfo: string[]) {
    let set = new Set<string>()
    squareInfo.forEach((square) => {
        set.add(square);
    })
    return set;
}

function generateWumpusWorld(defaultWorld: boolean = true) {
    if (defaultWorld) {
        return [
            [wumpusGrid([]),wumpusGrid(["B"]), wumpusGrid(["P"]), wumpusGrid(["B"])],
            [wumpusGrid(["S"]),wumpusGrid([]), wumpusGrid(["B"]), wumpusGrid([])],
            [wumpusGrid(["W"]),wumpusGrid(["S", "B", "G"]), wumpusGrid(["P"]), wumpusGrid(["B"])],
            [wumpusGrid(["S"]),wumpusGrid([]), wumpusGrid(["B"]), wumpusGrid(["P"])]
        ]
    }

    let squares = []
    let wumpusWorld = [];

    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            // Locations of Wumpus and Gold should not be the starting one!
            if (i == 0 && j == 0) continue;
            squares.push([i, j]);
        }
    }
    let wumpusIdx = Math.floor(Math.random() * squares.length);
    let goldIdx = Math.floor(Math.random() * squares.length);

    // Avoid put the gold in the same room with the Wumpus
    while (wumpusIdx == goldIdx) {
        goldIdx = Math.floor(Math.random() * squares.length);
    }

    let wumpusPos = squares[wumpusIdx];
    let goldPos = squares[goldIdx];
    let smellPos = [];

    if (wumpusPos[0] > 0) {
        smellPos.push([wumpusPos[0] - 1, wumpusPos[1]])
    }

    if (wumpusPos[0] < 3) {
        smellPos.push([wumpusPos[0] + 1, wumpusPos[1]])
    }

    if (wumpusPos[1] > 0) {
        smellPos.push([wumpusPos[0], wumpusPos[1] - 1])
    }

    if (wumpusPos[1] < 3) {
        smellPos.push([wumpusPos[0], wumpusPos[1] + 1])
    }

    let pits = []
    let breezePos = []
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            // Locations of Wumpus and Gold should not be the starting one!
            let notPitCandidate = (i == 0 && j == 0)
                || (i == wumpusPos[0] && j == wumpusPos[1])
                || (i == goldPos[0] && j == goldPos[1]);
                
            if (notPitCandidate) continue;

            if (Math.random() <= 0.2) {
                pits.push([i, j]);
                if (i > 0) {
                    breezePos.push([i - 1, j])
                }
            
                if (i < 3) {
                    breezePos.push([i + 1, j])
                }
            
                if (j > 0) {
                    breezePos.push([i, j - 1])
                }
            
                if (j < 3) {
                    breezePos.push([i, j + 1])
                }
            }
        }
    }
    for (let i = 0; i < 4; i++) {
        let row = []
        for (let j = 0; j < 4; j++) {
            let square = []
            if (i == wumpusPos[0] && j == wumpusPos[1]) {
                square.push("W");
            }

            if (i == goldPos[0] && j == goldPos[1]) {
                square.push("G");
            }


            smellPos.forEach((pos) => {
                if (i == pos[0] && j == pos[1]) {
                    square.push("S")
                }
            })

            breezePos.forEach((pos) => {
                if (i == pos[0] && j == pos[1]) {
                    square.push("B")
                }
            })

            pits.forEach((pos) => {
                if (i == pos[0] && j == pos[1]) {
                    square.push("P")
                }
            })
            row.push(wumpusGrid(square));
        }
        wumpusWorld.push(row);
    }
    return wumpusWorld;
}

function oneWumpusRule1() {
    let cnfClause: BooleanLiteral[] = [];
    for (let x = 0; x < 4; x++) {
        for (let y = 0; y < 4; y++) {
            cnfClause.push(new BooleanLiteral("W" + x.toString() + y.toString()))
        }
    }
    return new CnfClause(cnfClause);
}

function oneWumpusRule2(kb: KB) {
    let clause: CnfClause;
    for (let x = 0; x < 4; x++) {
        for (let y = 0; y < 4; y++) {
            if (x > 0) {
                clause = new CnfClause([
                    new BooleanLiteral("W" + x.toString() + y.toString(), true),
                    new BooleanLiteral("W" + (x - 1).toString() + y.toString(), true)])
                
                kb.addClause(clause);
            }
            
            if (x < 3) {
                clause = new CnfClause([
                    new BooleanLiteral("W" + x.toString() + y.toString(), true),
                    new BooleanLiteral("W" + (x + 1).toString() + y.toString(), true)])
                
                kb.addClause(clause);
            }

            if (y > 0) {
                clause = new CnfClause([
                    new BooleanLiteral("W" + x.toString() + y.toString(), true),
                    new BooleanLiteral("W" + x.toString() + (y - 1).toString(), true)])
                
                kb.addClause(clause);
            }

            if (y < 3) {
                clause = new CnfClause([
                    new BooleanLiteral("W" + x.toString() + y.toString(), true),
                    new BooleanLiteral("W" + x.toString() + (y + 1).toString(), true)])
                
                kb.addClause(clause);
            } 
        }
    }
}

function generateRightHand(x: number, y: number, varname: string) {
    let op: Operation = Operation.OR;
    let literalsName = [];

    if (x > 0) {
        literalsName.push(varname + (x-1).toString() + y.toString());
    }

    if (x < 3) {
        literalsName.push(varname + (x+1).toString() + y.toString());
    }

    if (y > 0) {
        literalsName.push(varname + x.toString() + (y-1).toString());
    }

    if (y < 3) {
        literalsName.push(varname + x.toString() + (y+1).toString());
    }

    let compoundOperation: Formula = null;
    for (let i = 0; i < literalsName.length - 1; i++) {
        if (compoundOperation == null) {
            compoundOperation = new BinClause(new Literal(literalsName[i]), op, new Literal(literalsName[i+1]))
        } else {
            compoundOperation = new BinClause(compoundOperation, op, new Literal(literalsName[i+1]))
        }
        
    }
    return compoundOperation;
}

function randomMove(x: number, y: number) {
    let moves: string[] = [];
    if (x > 0) {
        moves.push("left");
    }
    if (x < 3) {
        moves.push("right");
    }
    if (y > 0) {
        moves.push("up");
    }
    if (y < 3) {
        moves.push("down");
    }
    return moves[Math.floor(Math.random() * moves.length)];
}

function hashCoord(x: number, y: number) {
    return x.toString() + "," + y.toString();
}

function unhashCoord(hash: string) {
    let tmp = hash.split(",");
    return [parseInt(tmp[0]), parseInt(tmp[1])];
}


function addToFringe(fringe: Set<string>, visited: boolean[][], x: number, y: number) {
    if (x > 0 && !visited[y][x - 1]) {
        fringe.add(hashCoord(x - 1, y));
    }
    if (x < 3 && !visited[y][x + 1]) {
        fringe.add(hashCoord(x + 1, y));
    }
    if (y > 0 && !visited[y - 1][x]) {
        fringe.add(hashCoord(x, y - 1));
    }
    if (y < 3 && !visited[y + 1][x]) {
        fringe.add(hashCoord(x, y + 1));
    }
}

function checkIfWumpusOrPit(kb: KB, fringe: Set<string>){
    let goalCoord: [number, number] = null;

    for (const hashCoord of Array.from(fringe.values())) {
        // This was so confusing! My bad!
        let coords = unhashCoord(hashCoord);
        let i = coords[0];
        let j = coords[1];
        let x = j;
        let y = i;

        let notWumpus: Formula = new Negation(new Literal("W" + x.toString() + y.toString()));
        let notPit: Formula = new Negation(new Literal("P" + x.toString() + y.toString()));
        let alpha: Formula = new BinClause(notWumpus, Operation.AND, notPit);

        if (plResolution(kb, alpha)) {
            goalCoord = [i, j]
            break;
        }
    }
    return goalCoord;
}

function perceive(wumpusWorld, kb: KB, x: number, y:number) {
    let clause: CnfClause;
    if (wumpusWorld[y][x].has("S")) {
        clause = new CnfClause([new BooleanLiteral("S" + x.toString() + y.toString())]);
        
    } else {
        clause = new CnfClause([new BooleanLiteral("S" + x.toString() + y.toString(), true)]);
    }
    kb.addClause(clause);

    if (wumpusWorld[y][x].has("B")) {
        clause = new CnfClause([new BooleanLiteral("B" + x.toString() + y.toString())]);
    } else {
        clause = new CnfClause([new BooleanLiteral("B" + x.toString() + y.toString(), true)]);
    }
    kb.addClause(clause);
}


function plWumpusAgent(wumpusWorld, kb, x, y, visited, plan, fringe) {
    let action: string;
    
    visited[y][x] = true;
    if (fringe.has(hashCoord(y, x))) {
        fringe.delete(hashCoord(y, x));
    }
    perceive(wumpusWorld, kb, x, y);
    addToFringe(fringe, visited, x, y);
    
    if (wumpusWorld[y][x].has("P") || wumpusWorld[y][x].has("W")) {
        console.log(y, x);
        console.log(wumpusWorld[y][x]);
        throw new Error('You DIED!');
    }

    if (wumpusWorld[y][x].has("G")) {
        kb.addClause(new CnfClause([new BooleanLiteral("G" + x.toString() + y.toString())]));
        action = "grab"
    } else if (plan.length > 0) {
        action = plan.shift();
    } else {
        let goalCoord = checkIfWumpusOrPit(kb, fringe);
        if (goalCoord != null) {
            let routeProblem = new RouteProblem([y, x], goalCoord, visited);
            plan = aStar(routeProblem, (state: RouteProblemState) : number => {
                return Math.abs(
                    state.position[0] - routeProblem.goalPosition[0])
                    + Math.abs(state.position[1] - routeProblem.goalPosition[1])
            })
            action = plan.shift();
        } else {
            action = randomMove(x, y);
        }
    }
    return action;
}

function update(x: number, y: number, action: string) {
    if (action == "up") {
        return [x, y - 1];
    }

    if (action == "down") {
        return [x, y + 1];
    }

    if (action == "left") {
        return [x - 1, y];
    }

    if (action == "right") {
        return [x + 1, y];
    }

    throw new Error("No action returned!");
}

export {
    oneWumpusRule1,
    oneWumpusRule2,
    wumpusGrid,
    generateWumpusWorld,
    generateRightHand,
    plWumpusAgent,
    update
}