import { 
  toCNF,
  Literal,
  compareFormulas,
  BinClause,
  Operation,
  Negation,
  BooleanLiteral,
  CnfClause
} from "../src/PropositionalLogic";

describe('Test To CNF', function() {
  it('Non-negated literal', function() {
    let result = toCNF(new Literal("A"));
    expect(result).toBeInstanceOf(Literal);
  });

  it('(A ^ B)', function() {
    let result = toCNF(new BinClause(new Literal("A"), Operation.AND, new Literal("B")));
    let expected = new BinClause(new Literal("A"), Operation.AND, new Literal("B"));
    expect(compareFormulas(result, expected)).toBeTruthy();
  });

  it('(A v B)', function() {
    let result = toCNF(new BinClause(new Literal("A"), Operation.OR, new Literal("B")));
    let expected = new BinClause(new Literal("A"), Operation.OR, new Literal("B"));
    expect(compareFormulas(result, expected)).toBeTruthy();
  });

  it('A v (B ^ C)', function() {
    let result = toCNF(new BinClause(
      new Literal("A"),
      Operation.OR,
      new BinClause(new Literal("B"), Operation.AND, new Literal("C")))
    );
    let expected = new BinClause(
      new BinClause(new Literal("A"), Operation.OR, new Literal("B")),
      Operation.AND,
      new BinClause(new Literal("A"), Operation.OR, new Literal("C")));
    expect(compareFormulas(result, expected)).toBeTruthy();
  });

  it('(A ^ B) v C', function() {
    let result = toCNF(new BinClause(
      new BinClause(new Literal("A"), Operation.AND, new Literal("B")),
      Operation.OR,
      new Literal("C"))
    );
    let expected = new BinClause(
      new BinClause(new Literal("A"), Operation.OR, new Literal("C")),
      Operation.AND,
      new BinClause(new Literal("B"), Operation.OR, new Literal("C")));
    expect(compareFormulas(result, expected)).toBeTruthy();
  });

  it('(A ^ B) v (C ^ D)', function() {
    let result = toCNF(new BinClause(
      new BinClause(new Literal("A"), Operation.AND, new Literal("B")),
      Operation.OR,
      new BinClause(new Literal("C"), Operation.AND, new Literal("D")))
    );
    let expected = new BinClause(
      new BinClause(
        new BinClause(new Literal("A"), Operation.OR, new Literal("C")),
        Operation.AND,
        new BinClause(new Literal("A"), Operation.OR, new Literal("D"))
      ),
      Operation.AND,
      new BinClause(
        new BinClause(new Literal("B"), Operation.OR, new Literal("C")),
        Operation.AND,
        new BinClause(new Literal("B"), Operation.OR, new Literal("D"))
      )
    );
    expect(compareFormulas(result, expected)).toBeTruthy();
  });

  it('~(~A)', function() {
    let result = toCNF(new Negation(new Negation(new Literal("A"))));
    expect(result).toBeInstanceOf(Literal);
  });

  it('~A v (B ^ C)', function() {
    let result = toCNF(new BinClause(
      new Negation(new Literal("A")),
      Operation.OR,
      new BinClause(new Literal("B"), Operation.AND, new Literal("C")))
    );
    let expected = new BinClause(
      new BinClause(new Negation(new Literal("A")), Operation.OR, new Literal("B")),
      Operation.AND,
      new BinClause(new Negation(new Literal("A")), Operation.OR, new Literal("C")));
    expect(compareFormulas(result, expected)).toBeTruthy();
  });
});

describe('Boolean literal', function() {
  it('A hash', function() {
      let literal = new BooleanLiteral("A")
      expect(literal.hash()).toEqual("A");
  });

  it('NOT(A) hash', function() {
      let literal = new BooleanLiteral("A", true)
      expect(literal.hash()).toEqual("¬A");
  });

  it('A negatedHash', function() {
      let literal = new BooleanLiteral("A")
      expect(literal.negatedHash()).toEqual("¬A");
  });

  it('NOT(A) negated hash', function() {
      let literal = new BooleanLiteral("A", true)
      expect(literal.negatedHash()).toEqual("A");
  });
})

describe('Cnf Clauses', function() {
  it('(B v C v ¬B)', function() {
      let clause = new CnfClause(
        [new BooleanLiteral("B"),
        new BooleanLiteral("C"),
        new BooleanLiteral("¬B")])
      expect(clause.literals).toBeNull();
  });

  it('(A v B v C)', function() {
    let clause = new CnfClause(
      [new BooleanLiteral("A"),
      new BooleanLiteral("B"),
      new BooleanLiteral("C")])
    expect(clause.size()).toEqual(3);
    expect(clause.has("A")).toBeTruthy();
    expect(clause.hash()).toEqual("A|B|C");
  });

  it('(A v B v ¬C)', function() {
    let clause = new CnfClause(
      [new BooleanLiteral("A"),
      new BooleanLiteral("B"),
      new BooleanLiteral("C", true)])
    expect(clause.hash()).toEqual("A|B|¬C");
  });

  it('(A v B v ¬C) = (A v ¬C v B) = (¬C v A v B)', function() {
    let clause1 = new CnfClause(
      [new BooleanLiteral("A"),
      new BooleanLiteral("B"),
      new BooleanLiteral("C", true)]);

      let clause2 = new CnfClause(
        [new BooleanLiteral("A"),
        new BooleanLiteral("C", true),
        new BooleanLiteral("B")])
    expect(clause1.hash()).toEqual(clause2.hash());

    clause2 = new CnfClause(
      [new BooleanLiteral("C", true),
        new BooleanLiteral("A"),
      new BooleanLiteral("B")])
    expect(clause1.hash()).toEqual(clause2.hash());
  });
})