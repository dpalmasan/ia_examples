const END_SENT_MARKER: string = "<END_SENT>";
const START_SYMBOL: string = "<S>";
const STOP_SYMBOL: string = "</S>";


export abstract class Tokenizer {
  abstract tokenize(text: string) : string[];
  abstract sentTokenize(text: string) : string[];
}

class SimpleTokenizer extends Tokenizer {
  tokenize(text: string) : string[] {
    return text
      .toLowerCase()
      .replace(/[.,;\-\n“”\"–\(\)«»\%0-9]+/g, " ") // Remove symbols and replace by spaces
      .replace(/[¿?¡!]/g, (x) => ` ${x} `) // Add trailing whitespace to split
      .split(/[ ]+/).filter(x => x); // Split by spaces
  }

  sentTokenize(text: string) : string[] {
    let sentRegex = new RegExp(
      `${END_SENT_MARKER}`)

    // Add rules for specific sentence separators and then split
    return text
      .replace(/[.]/g, (x) => `${x}${END_SENT_MARKER}`)
      .split(sentRegex)
      .filter(x => x)
      .map((sent: string) => sent.trim());
  }
}

class NGramModel {
  probs: Map<string, number>
  context: Map<string, string[]>
  private _ngrams: Map<string, number>
  private _ngramLength: number
  private _isTrained: boolean

  constructor (ngramLength: number) {
    if (!Number.isInteger(ngramLength)) {
      throw new Error("ngram_length must be an integer!");
    }

    if (ngramLength <= 1) {
      throw new Error("ngram_length must be greater than 1!")
    }
    this._ngramLength = ngramLength;
    this._isTrained = false;
    this._ngrams = new Map<string, number>();
    this.context = new Map<string, string[]>();
    this.probs = new Map<string, number>();
  }

  train(corpus: Iterable<string>, tokenizer: Tokenizer) {
    this.isTrainedValidation();
    for (let text of corpus) {
      tokenizer.sentTokenize(text).forEach(sentence => {
        let tokens: string[] = new Array(this._ngramLength - 1).fill(START_SYMBOL).concat(
          tokenizer.tokenize(sentence), [STOP_SYMBOL])

        if (tokens.length >= this._ngramLength) {
          tokens.forEach((_, index) => {
            let ngram = tokens.slice(index, index + this._ngramLength);
            let ngramKey: string = String(ngram);
            let context = String(ngram.slice(0, -1));
            let nextWord = ngram.slice(-1)
            if (!this.context.has(context)) {
              this.context.set(context, nextWord)
            } else {
              this.context.set(context, this.context.get(context).concat(nextWord))
            }
            
            this._ngrams.set(ngramKey, this._ngrams.get(ngramKey) + 1 || 1)
          })
        }
      })
    }
    this._ngrams.forEach((ngramCount: number, key: string) => {
      let context: string = key.split(",").slice(0, -1).join(",");
      this.probs.set(key, ngramCount / this.context.get(context).length);
    })
    this._isTrained = true;
  }

  generateRandomSentence(): string {
    if (!this._isTrained) {
      throw new Error("Model needs to be trained to generate sentences!")
    }
    let ngramPrev: string[] = new Array(this._ngramLength - 1).fill(START_SYMBOL);
    let sentenceTokens: string[] = []
    let currentToken: string = START_SYMBOL;
    while (currentToken != STOP_SYMBOL) {
      let context = String(ngramPrev)
      let candidateTokens = []
      this.context.get(context)
        .filter((v, i, a) => a.indexOf(v) === i) // Unique candidates
        .forEach(candidate => {
        let ngram = String(ngramPrev.concat([candidate]));
        candidateTokens.push({
          word: candidate,
          prob: this.probs.get(ngram)
        })
      })

      // Generate random uniform between 0 and 1
      let prob = Math.random();
      let cumProb = 0
      for (let candidate of candidateTokens) {
        cumProb += candidate.prob;
        if (cumProb >= prob) {
          currentToken = candidate.word
          break
        }
      }
      sentenceTokens.push(currentToken)
      ngramPrev = ngramPrev.slice(1).concat([currentToken]);
    }
    return sentenceTokens.slice(0, -1).join(" ")
  }

  isTrainedValidation() {
    if (this._isTrained) {
      throw new Error("Model is already trained!");
    }
  }
}

export {
  SimpleTokenizer,
  NGramModel
};