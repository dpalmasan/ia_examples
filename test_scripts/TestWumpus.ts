import {
    BooleanLiteral,
    CnfClause,
    CnfParser,
    toCNF,
    BinClause,
    Literal,
    Operation,
} from "../src/PropositionalLogic";

import {
    KB,
    negate
} from "../src/KB";

import {
    oneWumpusRule1,
    oneWumpusRule2,
    wumpusGrid,
    generateWumpusWorld,
    generateRightHand,
    plWumpusAgent,
    update
} from "../src/WumpusWorld";

function getLiteral(literal, x, y) {
    return literal + x.toString() + y.toString();
}

function debugWumpus(kb: KB, visited: boolean[][]) {
    let debugWorld = [
        [wumpusGrid([]),wumpusGrid([]), wumpusGrid([]), wumpusGrid([])],
        [wumpusGrid([]),wumpusGrid([]), wumpusGrid([]), wumpusGrid([])],
        [wumpusGrid([]),wumpusGrid([]), wumpusGrid([]), wumpusGrid([])],
        [wumpusGrid([]),wumpusGrid([]), wumpusGrid([]), wumpusGrid([])]
    ]
    for (let x = 0; x < 4; x++) {
        for (let y = 0; y < 4; y++) {
            let knowledgeSquare = []
            let literals = ["S", "W", "P", "B", "G"];
            literals.forEach( (literal) => {
                if (kb.has(getLiteral(literal, x, y))) {
                    knowledgeSquare.push(literal);
                }

                if (kb.has(getLiteral(negate(literal), x, y))) {
                    knowledgeSquare.push(negate(literal));
                }
            })
            debugWorld[y][x] = wumpusGrid(knowledgeSquare);
        }
    }
    return debugWorld;
}

let kb = new KB();
let wumpusWorld = generateWumpusWorld(true);
kb.addClause(oneWumpusRule1());
oneWumpusRule2(kb);

let parser = new CnfParser();
for (let x = 0; x < 4; x++) {
    for (let y = 0; y < 4; y++) {
        let rule = parser.parse(toCNF(new BinClause(
            new Literal("B" + x.toString() + y.toString()),
            Operation.BICOND,
            generateRightHand(x, y, "P"))
        ))

        rule.forEach((clause) => {
            kb.addClause(clause);
        });

        rule = parser.parse(toCNF(new BinClause(
            new Literal("S" + x.toString() + y.toString()),
            Operation.BICOND,
            generateRightHand(x, y, "W"))
        ))
        rule.forEach((clause) => {
            kb.addClause(clause);
        });
    }
}

kb.addClause(new CnfClause([new BooleanLiteral("P00", true)]))
kb.addClause(new CnfClause([new BooleanLiteral("W00", true)]))

// Wumpus initialization
let x = 0;
let y = 0;
let updatedPos;
let plan = [];

let fringe = new Set<string>();
let visited: boolean [][] = [
    [false, false, false, false],
    [false, false, false, false],
    [false, false, false, false],
    [false, false, false, false]
];
let action: string;
while (true) {
    action = plWumpusAgent(wumpusWorld, kb, x, y, visited, plan, fringe);
    console.log(action);
    if (action == "grab") break;
    updatedPos = update(x, y, action);
    x = updatedPos[0];
    y = updatedPos[1];
}

console.log(debugWumpus(kb, visited))
console.log("You picked the gold! Congrats!");