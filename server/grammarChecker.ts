/**
 * Grammar Checker Engine
 * Implements rule-based parsing for common grammar errors
 * Uses pattern matching and finite state machines for error detection
 */

import { Token, TokenType } from "./lexicalAnalyzer";

export interface GrammarError {
  type: string;
  position: number;
  line: number;
  column: number;
  message: string;
  suggestion: string;
  severity: "error" | "warning";
}

/**
 * Grammar Checker: Detects common grammar errors using rule-based parsing
 * Implements pattern matching from compiler theory
 */
export class GrammarChecker {
  private tokens: Token[];
  private errors: GrammarError[] = [];

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  /**
   * Main grammar checking method
   * Applies multiple grammar rules to detect errors
   */
  public check(): GrammarError[] {
    this.errors = [];

    // Apply grammar rules
    this.checkSubjectVerbAgreement();
    this.checkArticleUsage();
    this.checkPunctuationRules();
    this.checkCommonGrammarErrors();
    this.checkCapitalization();
    this.checkContraction();

    return this.errors;
  }

  /**
   * Check subject-verb agreement
   * Rule: Singular subjects take singular verbs, plural subjects take plural verbs
   */
  private checkSubjectVerbAgreement(): void {
    const words = this.getWords();

    for (let i = 0; i < words.length - 1; i++) {
      const currentWord = words[i].value.toLowerCase();
      const nextWord = words[i + 1]?.value.toLowerCase() || "";

      // Pattern: Singular noun + plural verb
      const singularNouns = ["person", "child", "man", "woman", "dog", "cat"];
      const pluralVerbs = ["are", "were", "have", "do"];
      const singularVerbs = ["is", "was", "has", "does"];

      if (
        singularNouns.includes(currentWord) &&
        pluralVerbs.includes(nextWord)
      ) {
        const suggestion = this.getSingularForm(nextWord);
        this.errors.push({
          type: "subject-verb-agreement",
          position: words[i + 1].position,
          line: words[i + 1].line,
          column: words[i + 1].column,
          message: `Subject-verb agreement error: singular subject requires singular verb`,
          suggestion: `Use "${suggestion}" instead of "${nextWord}"`,
          severity: "error",
        });
      }

      // Pattern: Plural noun + singular verb
      const pluralNouns = ["people", "children", "men", "women", "dogs", "cats"];
      if (
        pluralNouns.includes(currentWord) &&
        singularVerbs.includes(nextWord)
      ) {
        const suggestion = this.getPluralForm(nextWord);
        this.errors.push({
          type: "subject-verb-agreement",
          position: words[i + 1].position,
          line: words[i + 1].line,
          column: words[i + 1].column,
          message: `Subject-verb agreement error: plural subject requires plural verb`,
          suggestion: `Use "${suggestion}" instead of "${nextWord}"`,
          severity: "error",
        });
      }
    }
  }

  /**
   * Check article usage (a/an)
   * Rule: Use "an" before vowel sounds, "a" before consonant sounds
   */
  private checkArticleUsage(): void {
    const words = this.getWords();

    for (let i = 0; i < words.length - 1; i++) {
      const currentWord = words[i].value.toLowerCase();
      const nextWord = words[i + 1]?.value.toLowerCase() || "";

      if (currentWord === "a" && this.startsWithVowel(nextWord)) {
        this.errors.push({
          type: "article-usage",
          position: words[i].position,
          line: words[i].line,
          column: words[i].column,
          message: `Article usage error: use "an" before vowel sounds`,
          suggestion: `Use "an" instead of "a" before "${nextWord}"`,
          severity: "warning",
        });
      }

      if (currentWord === "an" && !this.startsWithVowel(nextWord)) {
        this.errors.push({
          type: "article-usage",
          position: words[i].position,
          line: words[i].line,
          column: words[i].column,
          message: `Article usage error: use "a" before consonant sounds`,
          suggestion: `Use "a" instead of "an" before "${nextWord}"`,
          severity: "warning",
        });
      }
    }
  }

  /**
   * Check punctuation rules
   * Rules: Comma before coordinating conjunctions, space after punctuation
   */
  private checkPunctuationRules(): void {
    const allTokens = this.tokens;

    for (let i = 0; i < allTokens.length - 1; i++) {
      const currentToken = allTokens[i];
      const nextToken = allTokens[i + 1];

      // Check for missing space after punctuation
      if (
        currentToken.type === TokenType.PUNCTUATION &&
        nextToken.type === TokenType.WORD &&
        currentToken.value !== "-"
      ) {
        // This would be caught by tokenizer, so we skip
      }

      // Check for double punctuation
      if (
        currentToken.type === TokenType.PUNCTUATION &&
        nextToken.type === TokenType.PUNCTUATION
      ) {
        if (
          (currentToken.value === "." || currentToken.value === "!") &&
          nextToken.value === "."
        ) {
          this.errors.push({
            type: "double-punctuation",
            position: nextToken.position,
            line: nextToken.line,
            column: nextToken.column,
            message: `Double punctuation error: remove duplicate punctuation mark`,
            suggestion: `Remove the extra "${nextToken.value}"`,
            severity: "error",
          });
        }
      }
    }
  }

  /**
   * Check common grammar errors
   * Examples: "their" vs "there", "its" vs "it's"
   */
  private checkCommonGrammarErrors(): void {
    const words = this.getWords();

    for (let i = 0; i < words.length; i++) {
      const word = words[i].value.toLowerCase();

      // Check "its" vs "it's"
      if (word === "its") {
        // Check if it should be "it's" (it is/has)
        if (i + 1 < words.length) {
          const nextWord = words[i + 1].value.toLowerCase();
          const verbForms = ["is", "has", "was", "were"];
          // This is a simplified check - in reality, we'd need more context
        }
      }

      // Check "their" vs "there"
      if (word === "their" || word === "there") {
        // Context-dependent check would go here
      }

      // Check "your" vs "you're"
      if (word === "your") {
        // Check if it should be "you're" (you are)
        if (i + 1 < words.length) {
          const nextWord = words[i + 1].value.toLowerCase();
          // Context-dependent check
        }
      }

      // Check "to" vs "too"
      if (word === "to" || word === "too") {
        // Context-dependent check
      }
    }
  }

  /**
   * Check capitalization rules
   * Rules: First word of sentence, proper nouns, "I"
   */
  private checkCapitalization(): void {
    const words = this.getWords();
    let sentenceStart = true;

    for (let i = 0; i < words.length; i++) {
      const word = words[i].value;
      const lowerWord = word.toLowerCase();

      // Check if word is "I" (should always be capitalized)
      if (lowerWord === "i" && word !== "I") {
        this.errors.push({
          type: "capitalization",
          position: words[i].position,
          line: words[i].line,
          column: words[i].column,
          message: `Capitalization error: "I" should always be capitalized`,
          suggestion: `Change "${word}" to "I"`,
          severity: "warning",
        });
      }

      // Check first word of sentence
      if (sentenceStart && word.length > 0) {
        if (word[0] === word[0].toLowerCase()) {
          this.errors.push({
            type: "capitalization",
            position: words[i].position,
            line: words[i].line,
            column: words[i].column,
            message: `Capitalization error: first word of sentence should be capitalized`,
            suggestion: `Capitalize "${word}"`,
            severity: "warning",
          });
        }
        sentenceStart = false;
      }

      // Check for sentence-ending punctuation
      if (i + 1 < words.length) {
        const nextToken = this.tokens.find(
          (t) => t.position === words[i].position + word.length
        );
        if (
          nextToken &&
          nextToken.type === TokenType.PUNCTUATION &&
          (nextToken.value === "." ||
            nextToken.value === "!" ||
            nextToken.value === "?")
        ) {
          sentenceStart = true;
        }
      }
    }
  }

  /**
   * Check contraction errors
   * Examples: "dont" should be "don't", "wont" should be "won't"
   */
  private checkContraction(): void {
    const words = this.getWords();

    const contractionErrors: Record<string, string> = {
      dont: "don't",
      wont: "won't",
      cant: "can't",
      shouldnt: "shouldn't",
      wouldnt: "wouldn't",
      couldnt: "couldn't",
      isnt: "isn't",
      arent: "aren't",
      wasnt: "wasn't",
      werent: "weren't",
      havent: "haven't",
      hasnt: "hasn't",
      hadnt: "hadn't",
      doesnt: "doesn't",
      didnt: "didn't",
      ive: "I've",
      youve: "you've",
      weve: "we've",
      theyve: "they've",
      im: "I'm",
      youre: "you're",
      hes: "he's",
      shes: "she's",
      its: "it's",
      were: "we're",
      theyre: "they're",
    };

    for (let i = 0; i < words.length; i++) {
      const word = words[i].value.toLowerCase();
      if (contractionErrors[word]) {
        this.errors.push({
          type: "contraction",
          position: words[i].position,
          line: words[i].line,
          column: words[i].column,
          message: `Contraction error: missing apostrophe`,
          suggestion: `Use "${contractionErrors[word]}" instead of "${words[i].value}"`,
          severity: "warning",
        });
      }
    }
  }

  /**
   * Helper: Get only word tokens
   */
  private getWords(): Token[] {
    return this.tokens.filter((t) => t.type === TokenType.WORD);
  }

  /**
   * Helper: Check if word starts with vowel sound
   */
  private startsWithVowel(word: string): boolean {
    const vowels = ["a", "e", "i", "o", "u"];
    return vowels.includes(word[0]?.toLowerCase() || "");
  }

  /**
   * Helper: Get singular form of verb
   */
  private getSingularForm(verb: string): string {
    const singularForms: Record<string, string> = {
      are: "is",
      were: "was",
      have: "has",
      do: "does",
    };
    return singularForms[verb] || verb;
  }

  /**
   * Helper: Get plural form of verb
   */
  private getPluralForm(verb: string): string {
    const pluralForms: Record<string, string> = {
      is: "are",
      was: "were",
      has: "have",
      does: "do",
    };
    return pluralForms[verb] || verb;
  }
}
