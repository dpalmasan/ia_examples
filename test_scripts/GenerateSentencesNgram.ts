import { readFileSync, readdirSync } from "fs";
import {
  SimpleTokenizer,
  NGramModel
} from "../src/NGramModel";


function* readCorpus(corpusDir: string) {
  try {
    for (let file of readdirSync(corpusDir)) {
      const data = readFileSync(`${corpusDir}/${file}`, "utf8");
      yield data;
    }
  } catch (err) {
    console.error(err);
  }
}

let corpusDir = "./corpus/";
let tokenizer = new SimpleTokenizer();


let ngramModel = new NGramModel(2);
ngramModel.train(readCorpus(corpusDir), tokenizer);

console.log("Modelo con Bigramas:\n\n")
let k = 0;
while (k < 10) {
  let sentence = ngramModel.generateRandomSentence();
  if (sentence.split(" ").length > 5) {
    console.log(sentence);
    ++k;
  }
}

console.log("\n\nModelo con Trigramas:\n\n")
ngramModel = new NGramModel(3);
ngramModel.train(readCorpus(corpusDir), tokenizer)
k = 0;
while (k < 10) {
  let sentence = ngramModel.generateRandomSentence();
  if (sentence.split(" ").length > 5) {
    console.log(sentence);
    ++k;
  }
}

console.log("\n\nModelo con Cuadrigramas:\n\n")
ngramModel = new NGramModel(4);
ngramModel.train(readCorpus(corpusDir), tokenizer)
k = 0;
while (k < 10) {
  let sentence = ngramModel.generateRandomSentence();
  if (sentence.split(" ").length > 5) {
    console.log(sentence);
    ++k;
  }
}
