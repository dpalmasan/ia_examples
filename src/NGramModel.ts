const END_SENT_MARKER: string = "<END_SENT>";
const START_SYMBOL: string = "<S>";
const STOP_SYMBOL: string = "</S>";


export abstract class Tokenizer {
  abstract tokenize(text: string) : string[];
  abstract sent_tokenize(text: string) : string[];
}

class SimpleTokenizer extends Tokenizer {
  tokenize(text: string) : string[] {
    return text
      .toLowerCase()
      .replace(/[.,;\-\n“”\"–\(\)«»\%0-9]+/g, " ") // Remove symbols and replace by spaces
      .replace(/[¿?¡!]/g, (x) => ` ${x} `) // Add trailing whitespace to split
      .split(/[ ]+/).filter(x => x); // Split by spaces
  }

  sent_tokenize(text: string) : string[] {
    let sent_regex = new RegExp(
      `${END_SENT_MARKER}`)

    // Add rules for specific sentence separators and then split
    return text
      .replace(/[.]/g, (x) => `${x}${END_SENT_MARKER}`)
      .split(sent_regex)
      .filter(x => x)
      .map((sent: string) => sent.trim());
  }
}

class NGramModel {
  probs: Map<string, number>
  context: Map<string, string[]>
  private _ngrams: Map<string, number>
  private _ngram_length: number
  private _is_trained: boolean

  constructor (ngram_length: number) {
    if (!Number.isInteger(ngram_length)) {
      throw new Error("ngram_length must be an integer!");
    }

    if (ngram_length <= 1) {
      throw new Error("ngram_length must be greater than 1!")
    }
    this._ngram_length = ngram_length;
    this._is_trained = false;
    this._ngrams = new Map<string, number>();
    this.context = new Map<string, string[]>();
    this.probs = new Map<string, number>();
  }

  train(corpus: Iterable<string>, tokenizer: Tokenizer) {
    this.is_trained_validation();
    for (let text of corpus) {
      tokenizer.sent_tokenize(text).forEach(sentence => {
        let tokens: string[] = new Array(this._ngram_length - 1).fill(START_SYMBOL).concat(
          tokenizer.tokenize(sentence), [STOP_SYMBOL])

        if (tokens.length >= this._ngram_length) {
          tokens.forEach((_, index) => {
            let ngram = tokens.slice(index, index + this._ngram_length);
            let ngram_key: string = String(ngram);
            let context = String(ngram.slice(0, -1));
            let next_word = ngram.slice(-1)
            if (!this.context.has(context)) {
              this.context.set(context, next_word)
            } else {
              this.context.set(context, this.context.get(context).concat(next_word))
            }
            
            this._ngrams.set(ngram_key, this._ngrams.get(ngram_key) + 1 || 1)
          })
        }
      })
    }
    this._ngrams.forEach((ngram_count: number, key: string) => {
      let context: string = key.split(",").slice(0, -1).join(",");
      this.probs.set(key, ngram_count / this.context.get(context).length);
    })
    this._is_trained = true;
  }

  generate_random_sentence(): string {
    if (!this._is_trained) {
      throw new Error("Model needs to be trained to generate sentences!")
    }
    let ngram_prev: string[] = new Array(this._ngram_length - 1).fill(START_SYMBOL);
    let sentence_tokens: string[] = []
    let current_token: string = START_SYMBOL;
    while (current_token != STOP_SYMBOL) {
      let context = String(ngram_prev)
      let candidate_tokens = []
      this.context.get(context)
        .filter((v, i, a) => a.indexOf(v) === i)
        .forEach(candidate => {
        let ngram = String(ngram_prev.concat([candidate]));
        candidate_tokens.push({
          word: candidate,
          prob: this.probs.get(ngram)
        })
      })

      let prob = Math.random();
      let cum_prob = 0
      for (let candidate of candidate_tokens) {
        cum_prob += candidate.prob;
        if (cum_prob >= prob) {
          current_token = candidate.word
          break
        }
      }
      sentence_tokens.push(current_token)
      ngram_prev = ngram_prev.slice(1).concat([current_token]);
    }
    return sentence_tokens.slice(0, -1).join(" ")
  }

  is_trained_validation() {
    if (this._is_trained) {
      throw new Error("Model is already trained!");
    }
  }
}

export {
  SimpleTokenizer,
  NGramModel
};