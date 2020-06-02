import { 
    toCNF,
    Formula,
    Negation,
    BooleanLiteral,
    CnfClause,
    CnfParser,
    EMPTY_CLAUSE
  } from "../src/PropositionalLogic";


class KB {
    clauses: Map<string, CnfClause>
    constructor () {
        this.clauses = new Map<string, CnfClause>();
    }

    addClause(clause: CnfClause) {
        if (clause.literals != null) {
            this.clauses.set(clause.hash(), clause);
        }
    }

    has(clauseHash: string) {
        return this.clauses.has(clauseHash);
    }
}

function negate(literalName: string): string {
    if (literalName[0] != "¬") {
        return "¬" + literalName;
    }
    return literalName.substring(1);
}

// c1 contains literal and c2 contains negated literal
function plResolveLiteral(c1: CnfClause, c2: CnfClause, literalName: string): CnfClause {
    let clause1: CnfClause = c1.copy();
    let clause2: CnfClause = c2.copy();

    clause1.delete(literalName);
    clause2.delete(negate(literalName));

    let alwaysTrue = false;
    clause1.literals.forEach((value: BooleanLiteral, key: string) => {
        if (clause2.has(negate(key))) {
            alwaysTrue = true;
        }
    });

    if (alwaysTrue) {
        return null;
    }
    
    return clause1.union(clause2);
}

function plResolution(kb: KB, alpha: Formula, maxIter: number = 5) {
    let parser = new CnfParser();

    // Resolution requires to negate the alpha query
    let alphaCnf: CnfClause[] = parser.parse(toCNF(new Negation(alpha)));

    /** 
     * Heuristic: We do not want to resolve all clauses against others
     * We only would like to resolve clauses from which we can infer
     * interesting knowledge related to our query alpha!
     * */ 
    let kbClauses:KB = new KB();

    kb.clauses.forEach((clause: CnfClause, key:string) => {
        kbClauses.addClause(clause);
        if (clause.hash() == EMPTY_CLAUSE) {
            throw new Error("KB has a contradiction!");
        }
    })

    let interestingClauses:KB = new KB();
    alphaCnf.forEach((clause) => {
        interestingClauses.addClause(clause);
    })

    let newKnowledge = new KB();
    let iter: number = 0;

    // To avoid memory exhaustion, we say it is false if we can't find solution in 5 iters
    while (true && iter < maxIter) {
        let literalClauseMap:Map<string, CnfClause[]> = new Map<string, CnfClause[]>();
        interestingClauses.clauses.forEach((clause, key) => {
            clause.literals.forEach((value, literal, clauseMap) => {
                if (!literalClauseMap.has(literal)) {
                    literalClauseMap.set(literal, [clause])
                } else {
                    literalClauseMap.get(literal).push(clause);
                }
            })
        })

        kbClauses.clauses.forEach((clause, key) => {
            clause.literals.forEach((value, literal, clauseMap) => {
                if (!literalClauseMap.has(literal)) {
                    literalClauseMap.set(literal, [clause])
                } else {
                    literalClauseMap.get(literal).push(clause);
                }
            })
        })

        let clausePairs = [];
        interestingClauses.clauses.forEach((c_i, key) => {
            c_i.literals.forEach((value, literal) => {
                if (literalClauseMap.has(negate(literal))) {
                    literalClauseMap.get(negate(literal)).forEach( (c_j) => {
                        clausePairs.push([literal, c_i, c_j])
                    })
                }
            })
        })
        for (const pair of clausePairs) {
            let literal: string = pair[0];
            let c_i: CnfClause = pair[1];
            let c_j: CnfClause = pair[2];
            let result = plResolveLiteral(c_i, c_j, literal);
            if (result != null) {
                if (result.hash() == EMPTY_CLAUSE) {
                    return true;
                } else {
                    newKnowledge.addClause(result);
                }
            }
        }

        let addedKnowledge: boolean = false;
        newKnowledge.clauses.forEach((clause, key) => {
            // Only add new information to our interestingClauses
            let anySubset:boolean = false;
            interestingClauses.clauses.forEach((oldClause, key) => {
                if (oldClause.isSubset(clause)) {
                    anySubset = true;
                }
            })

            kbClauses.clauses.forEach((oldClause, key) => {
                if (oldClause.isSubset(clause)) {
                    anySubset = true;
                }
            })
            if (!anySubset) {
                interestingClauses.addClause(clause);
                addedKnowledge = true;
            }
        })

        // Cannot prove our goal since no new knowledge was added.
        // Might be true or false
        if (!addedKnowledge) {
            return false;
        }
        iter += 1;
    }

    return false;
}


export {
    plResolveLiteral,
    plResolution,
    KB,
    negate
}