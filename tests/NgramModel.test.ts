import {
  SimpleTokenizer,
  NGramModel
} from "../src/NGramModel";


describe("Simple Tokenizer", () => {
  let tokenizer = new SimpleTokenizer();
  it("Split string by spaces and ¿?¡!", () => {
    expect(tokenizer.tokenize("hola, ¿cómo estás?"))
    .toEqual(["hola", "¿", "cómo", "estás", "?"]);
  });

  it("Removes newlines and tokenize as if there were spaces", () => {
    expect(tokenizer.tokenize("hola,\n\n¿cómo estás?"))
    .toEqual(["hola", "¿", "cómo", "estás", "?"]);
  })

  it("Lowercases all words", () => {
    expect(tokenizer.tokenize("Hola,\n\n¿Cómo estás?"))
    .toEqual(["hola", "¿", "cómo", "estás", "?"]);
  })

  it("Removes unexpected punctuation", () => {
    expect(tokenizer.tokenize("“El llamado es a que pierdan el miedo”"))
    .toEqual(["el", "llamado", "es", "a", "que", "pierdan", "el", "miedo"])
  })

  it("Tokenizes sentences based on a dot in the end.", () => {
    expect(tokenizer.sent_tokenize(
      "Hola, ¿Cómo estás? Estamos aquí en una prueba. Probamos la implementación.")
    ).toEqual([
      "Hola, ¿Cómo estás? Estamos aquí en una prueba.",
      "Probamos la implementación."])

    expect(tokenizer.sent_tokenize(
      "Esto es una oración.\n\nEsto es otra oración."
    )).toEqual([
      "Esto es una oración.",
      "Esto es otra oración."
    ])
  })
})

describe("NGram Model", () => {
  it("Computes NGram probability distribution", () => {
    let tokenizer = new SimpleTokenizer();
    let ngramModel = new NGramModel(2);

    ngramModel.train(["Yo soy Sam.", "Sam soy yo."], tokenizer)
    expect(ngramModel.probs.has("soy,sam")).toBeTruthy()
    expect(ngramModel.probs.get("soy,sam")).toEqual(0.5);
    expect(ngramModel.probs.get("<S>,sam")).toEqual(0.5);
  })
  it("Throws Error if try to retrain.", () => {
    let tokenizer = new SimpleTokenizer();
    let ngramModel = new NGramModel(2);

    ngramModel.train(["Yo soy Sam.", "Sam soy yo."], tokenizer)
    expect(() => {
      ngramModel.train([], tokenizer)}).toThrow();
  })
})
