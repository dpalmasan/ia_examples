enum Operation {
    AND = "AND",
    OR = "OR",
    NOT = "NOT",
    COND = "IMPLIES",
    BICOND = "IFF"
}

export const EMPTY_CLAUSE = "empty";

abstract class Formula {
    token: string
    constructor (token: string) {
        this.token = token;
    }
}

class BinClause extends Formula {
    left: Formula
    right: Formula
    constructor (left: Formula, op: Operation, right: Formula) {
        super(op);
        this.left = left;
        this.right = right;
    } 
}

class Negation extends Formula {
    children: Formula
    constructor (children: Formula) {
        super(Operation.NOT);
        this.children = children;
    }
}

class Literal extends Formula {
    constructor (varname: string) {
        super(varname);
    }
}

function compareFormulas(ast1: Formula, ast2: Formula) {
    if (ast1 == null || ast2 == null ) return false;
    if (ast1.token == ast2.token) {
        if (ast1 instanceof BinClause && ast2 instanceof BinClause) {
            return compareFormulas(ast1.left, ast2.left) && compareFormulas(ast1.right, ast2.right);
        }
        if (ast1 instanceof Negation && ast2 instanceof Negation) {
            return compareFormulas(ast1.children, ast2.children);
        }

        if (ast1 instanceof Literal && ast2 instanceof Literal) {
            return ast1.token == ast2.token;
        }

    }
    return false;
}

// This might be improved
function toCNF(formula: Formula) {
    if (formula instanceof Literal) {
        return formula;
    }

    if (formula instanceof BinClause) {
        if (formula.token == Operation.AND) {
            return new BinClause(toCNF(formula.left), Operation.AND, toCNF(formula.right));
        }
        
        if (formula.token == Operation.OR) {
            let P = toCNF(formula.left);
            let Q = toCNF(formula.right);

            if ((P instanceof Literal || P instanceof Negation) 
            && (Q instanceof Literal || Q instanceof Negation)) {
                return new BinClause(P, Operation.OR, Q);
            }

            if ((P instanceof Literal || P instanceof Negation) && Q instanceof BinClause) {
                let op = (Q.token == Operation.AND) ? Operation.AND : Operation.OR;
                return new BinClause(
                    toCNF(new BinClause(P, Operation.OR, Q.left)),
                    op,
                    toCNF(new BinClause(P, Operation.OR, Q.right)));
            }

            if (P instanceof BinClause && (Q instanceof Literal || Q instanceof Negation)) {
                let op = (P.token == Operation.AND) ? Operation.AND : Operation.OR;
                return new BinClause(
                    toCNF(new BinClause(P.left, Operation.OR, Q)),
                    op,
                    toCNF(new BinClause(P.right, Operation.OR, Q)));
            }

            return new BinClause(
                new BinClause(
                    toCNF(new BinClause(P.left, Operation.OR, Q.left)),
                    Operation.AND,
                    toCNF(new BinClause(P.left, Operation.OR, Q.right))
                ),
                Operation.AND,
                new BinClause(
                    toCNF(new BinClause(P.right, Operation.OR, Q.left)),
                    Operation.AND,
                    toCNF(new BinClause(P.right, Operation.OR, Q.right))
                )  
            )
        }
    } 

    if (formula instanceof Negation) {
        if (formula.children instanceof Literal) {
            return formula;
        }

        // Double negation
        if (formula.children instanceof Negation) {
            return toCNF(formula.children.children);
        }

        // de Morgan´s Law
        if (formula.children instanceof BinClause) {
            if (formula.children.token == Operation.AND) {
                return toCNF(
                    new BinClause(
                        new Negation(formula.children.left),
                        Operation.OR,
                        new Negation(formula.children.right)
                    )
                );
            }
            if (formula.children.token == Operation.OR) {
                return toCNF(
                    new BinClause(
                        new Negation(formula.children.left),
                        Operation.AND,
                        new Negation(formula.children.right)
                    )
                );
            }
        }
    }

    if (formula instanceof BinClause) {
        if (formula.token == Operation.COND) {
            return toCNF(new BinClause(
                new Negation(formula.left),
                Operation.OR,
                formula.right
            ));
        }
    
        if (formula.token == Operation.BICOND) {
            return toCNF(
                new BinClause(
                    new BinClause(
                        new Negation(formula.left),
                        Operation.OR,
                        formula.right
                    ),
                    Operation.AND,
                    new BinClause(
                        new Negation(formula.right),
                        Operation.OR,
                        formula.left
                    )
                )
            );
        }
    }
}

// To visualize in DOT format
function toDOT(ast: Formula, id: number = 0) {
    if (ast == null ) return;
    if (ast instanceof BinClause) {
        if (ast.left instanceof Literal) {
            console.log(ast.token + id, '->', ast.left.token);
        } else if (ast.left instanceof Negation) {
            console.log(ast.token + id, '->', 'NOT_' + ast.left.children.token);
        } else {
            console.log(ast.token + id, '->', ast.left.token + (2*(id+1)));
        }

        if (ast.right instanceof Literal) {
            console.log(ast.token + id, '->', ast.right.token);
        } else if (ast.right instanceof Negation) {
            console.log(ast.token + id, '->', 'NOT_' + ast.right.children.token);
        } else {
            console.log(ast.token + id, '->', ast.right.token + (2*(id+1)+1));
        }
        if (ast.left instanceof Negation) {
            return;
        } else {
            toDOT(ast.left, 2*(id+1));
        }

        if (ast.right instanceof Negation) {
            return;
        } else {
            toDOT(ast.right, 2*(id+1)+1);
        }
    }
}

class BooleanLiteral{
    varname: string
    isNegated: boolean
    constructor (varname: string, isNegated: boolean = false) {
        this.varname = varname
        this.isNegated = isNegated;
    }

    hash() {
        return this.toString();
    }

    negatedHash() {
        let prefix: string = "";
        if (!this.isNegated) {
            prefix += "¬"
        }
        return prefix + this.varname;
    }

    toString() {
        let prefix: string = "";
        if (this.isNegated) {
            prefix += "¬"
        }
        return prefix + this.varname;
    }
}

// CNF clause is a conjunction of disjunctions
class CnfClause {
    literals: Map<string, BooleanLiteral>
    constructor (literals: BooleanLiteral[]) {
        this.literals = new Map<string, BooleanLiteral>();
        literals.forEach((literal) => {
            this.literals.set(literal.hash(), literal);
        })

        let trueClause = false;
        literals.forEach((literal) => {
            if (this.has(literal.hash()) && this.has(literal.negatedHash())) {
                trueClause = true;
            }
        })
        if (trueClause) {
            this.literals = null;
        }
    }

    has(literalHash: string): boolean {
        if (this.literals == null) {
            return false;
        }
        return this.literals.has(literalHash);
    }

    delete(literalHash: string): boolean {
        return this.literals.delete(literalHash);
    }

    size(): number {
        return this.literals.size;
    }

    hash(): string {
        if (this.size() == 0) {
            return EMPTY_CLAUSE;
        }
        let tmp: string[] = []
        this.literals.forEach((value: BooleanLiteral, key: string) => {
            tmp.push(key);
        });
        tmp.sort();
        return tmp.join("|");
    }

    copy(): CnfClause {
        let booleanLiterals:BooleanLiteral[] = [];
        this.literals.forEach((value: BooleanLiteral, key: string) => {
            booleanLiterals.push(value);
        });
        return new CnfClause(booleanLiterals);
    }

    union(other: CnfClause): CnfClause {
        let booleanLiterals:BooleanLiteral[] = [];
        this.literals.forEach((value: BooleanLiteral, key: string) => {
            booleanLiterals.push(value);
        });
        other.literals.forEach((value: BooleanLiteral, key: string) => {
            booleanLiterals.push(value);
        });
        return new CnfClause(booleanLiterals);
    }

    isSubset(other: CnfClause) {
        let subset = true;
        this.literals.forEach((value, key) => {
            if (!other.literals.has(key)) {
                subset = false;
            }
        })
        return subset;
    }
}

class CnfParser{
    andClauses: Formula[]
    orClauses: BooleanLiteral[]
    constructor() {
        this.andClauses = []
        this.orClauses = []
    }

    private getSubtrees(node: Formula) {
        if (node instanceof BinClause) {
            if (node.token == Operation.AND) {
                if (node.left.token != Operation.AND) {
                    this.andClauses.push(node.left)
                } else {
                    this.getSubtrees(node.left);
                }

                if (node.right.token != Operation.AND) {
                    this.andClauses.push(node.right)
                } else {
                    this.getSubtrees(node.right);
                }
            }
        }
    }

    private getCnfClause(subtree: Formula) {
        if (subtree instanceof BinClause) {
            return this.getCnfClause(subtree.left).concat(this.getCnfClause(subtree.right))
        } else {
            if (subtree instanceof Negation) {
                return [new BooleanLiteral(subtree.children.token, true)];
            }
            return [new BooleanLiteral(subtree.token)];
        }
    }

    public parse(clause: Formula) {
        // Initialization
        this.andClauses = []
        this.orClauses = []
        let cnfClauses = []
        this.getSubtrees(clause);

        if (this.andClauses.length > 0) {
            this.andClauses.forEach( (subtree) => {
                cnfClauses.push(new CnfClause(this.getCnfClause(subtree)))
            });
        } else {
            cnfClauses.push(new CnfClause(this.getCnfClause(clause)))
        }
        
        return cnfClauses;
    }
}

// TODO: Add this test case to parse
let test = new BinClause(
    new Literal("B10"),
    Operation.BICOND,
    new BinClause(
        new Literal("P00"),
        Operation.OR,
        new BinClause(
            new Literal("P20"),
            Operation.OR,
            new Literal("P11")
        )
    )
)

// let parser = new CnfParser();
// console.log(parser.parse(toCNF(test)));
// console.log(toDOT(toCNF(test)));

export {
    toCNF,
    Formula,
    Literal,
    compareFormulas,
    BinClause,
    Operation,
    Negation,
    CnfClause,
    BooleanLiteral,
    CnfParser
};