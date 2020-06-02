import {
    BooleanLiteral,
    CnfClause,
    EMPTY_CLAUSE,
    Negation,
    BinClause,
    Operation,
    Literal,
    CnfParser,
    toCNF
} from "../src/PropositionalLogic"

import {
    plResolveLiteral,
    plResolution,
    KB
} from "../src/KB"

describe('Resolve literals', function(){
    it('(A v B v C) ^ (¬A) = (B v C)', function() {
        let clause1 = new CnfClause(
            [new BooleanLiteral("A"),
            new BooleanLiteral("B"),
            new BooleanLiteral("C")])
        
        let clause2 = new CnfClause(
            [new BooleanLiteral("A", true)])

        let result = plResolveLiteral(clause1, clause2, "A");
        expect(result.hash()).toEqual("B|C");
    })

    it('(¬A v B v C) ^ (A) = (B v C)', function() {
        let clause1 = new CnfClause(
            [new BooleanLiteral("A", true),
            new BooleanLiteral("B"),
            new BooleanLiteral("C")])
        
        let clause2 = new CnfClause(
            [new BooleanLiteral("A")])

        let result = plResolveLiteral(clause1, clause2, "¬A");
        expect(result.hash()).toEqual("B|C");
    })

    it('(¬A) ^ (A) = false', function() {
        let clause1 = new CnfClause(
            [new BooleanLiteral("A", true)])
        
        let clause2 = new CnfClause(
            [new BooleanLiteral("A")])

        let result = plResolveLiteral(clause1, clause2, "¬A");
        expect(result.hash()).toEqual(EMPTY_CLAUSE);
    })

    it('(A v ¬B v C) ^ (¬A v B) = true (null)', function() {
        let clause1 = new CnfClause(
            [new BooleanLiteral("A"),
            new BooleanLiteral("B", true),
            new BooleanLiteral("C")])
        
        let clause2 = new CnfClause(
            [new BooleanLiteral("A", true), new BooleanLiteral("B")])

        let result = plResolveLiteral(clause1, clause2, "A");
        expect(result).toBeNull();
    })
})

describe("PL-Resolution", function() {
    it("AI Book example P.244", function(){
        let parser = new CnfParser();
        let result = toCNF(new BinClause(
            new Literal("B11"),
            Operation.BICOND,
            new BinClause(new Literal("P12"), Operation.OR, new Literal("P21")))
        );

        let r4 = parser.parse(result);

        result = toCNF(new Negation(
            new Literal("B11")
        ));

        let r2 = parser.parse(result);
        let alpha = new Negation(new Literal("P12"));

        let kb = new KB();

        r4.forEach((clause) => {
            kb.addClause(clause);
        })

        r2.forEach((clause) => {
            kb.addClause(clause);
        })

        result = plResolution(kb, alpha);
        expect(result).toEqual(true);
    });

    it("Debugging test case", function(){
        let parser = new CnfParser();
        let result = toCNF(new BinClause(
            new Literal("B21"),
            Operation.BICOND,
            new BinClause(new Literal("P22"), Operation.OR, new Literal("P31")))
        );

        let r4 = parser.parse(result);

        result = toCNF(new Negation(
            new Literal("B11")
        ));

        let r2 = parser.parse(result);
        let alpha = new Negation(new Literal("P12"));

        let kb = new KB();

        r4.forEach((clause) => {
            kb.addClause(clause);
        })

        r2.forEach((clause) => {
            kb.addClause(clause);
        })

        result = plResolution(kb, alpha);
        expect(result).toEqual(false);
    });
})