/**
 * Analysis Engine
 * Orchestrates lexical analysis and grammar checking
 * Produces comprehensive analysis results with corrections
 */

import {
  LexicalAnalyzer,
  SpellChecker,
  Token,
  TokenType,
  loadDictionary,
} from "./lexicalAnalyzer";
import { GrammarChecker, GrammarError } from "./grammarChecker";

export interface AnalysisResult {
  originalText: string;
  correctedText: string;
  spellingErrors: SpellingErrorDetail[];
  grammarErrors: GrammarError[];
  summary: {
    totalWords: number;
    uniqueWords: number;
    spellingErrorCount: number;
    grammarErrorCount: number;
    errorRate: string;
    averageConfidence: number;
  };
}

export interface SpellingErrorDetail {
  word: string;
  position: number;
  line: number;
  column: number;
  suggestions: string[];
  confidence: number;
}

/**
 * Analysis Engine: Orchestrates spelling and grammar analysis
 */
export class AnalysisEngine {
  private dictionary: Set<string>;
  private spellChecker: SpellChecker;

  constructor() {
    this.dictionary = loadDictionary();
    this.spellChecker = new SpellChecker(this.dictionary);
  }

  /**
   * Analyze text for spelling and grammar errors
   */
  public analyze(text: string): AnalysisResult {
    // Step 1: Lexical Analysis (Tokenization)
    const lexicalAnalyzer = new LexicalAnalyzer(text, this.dictionary);
    const tokens = lexicalAnalyzer.tokenize();

    // Step 2: Spelling Analysis
    const spellingErrors = this.analyzeSpelling(tokens);

    // Step 3: Grammar Analysis
    const grammarChecker = new GrammarChecker(tokens);
    const grammarErrors = grammarChecker.check();

    // Step 4: Generate Corrected Text
    const correctedText = this.generateCorrectedText(text, spellingErrors);

    // Step 5: Calculate Summary
    const summary = this.calculateSummary(
      text,
      spellingErrors,
      grammarErrors
    );

    return {
      originalText: text,
      correctedText,
      spellingErrors,
      grammarErrors,
      summary,
    };
  }

  /**
   * Analyze spelling errors in tokens
   */
  private analyzeSpelling(tokens: Token[]): SpellingErrorDetail[] {
    const errors: SpellingErrorDetail[] = [];
    const words = tokens.filter((t) => t.type === TokenType.WORD);

    for (const wordToken of words) {
      const word = wordToken.value;
      const lowerWord = word.toLowerCase();

      // Skip single letters and numbers
      if (word.length <= 1) continue;

      // Check if word is in dictionary
      if (!this.spellChecker.isCorrect(lowerWord)) {
        const suggestions = this.spellChecker.getSuggestions(lowerWord);

        // Calculate confidence based on number of suggestions and edit distance
        const confidence = this.calculateConfidence(suggestions.length);

        errors.push({
          word,
          position: wordToken.position,
          line: wordToken.line,
          column: wordToken.column,
          suggestions,
          confidence,
        });
      }
    }

    return errors;
  }

  /**
   * Generate corrected text by replacing misspelled words
   */
  private generateCorrectedText(
    text: string,
    spellingErrors: SpellingErrorDetail[]
  ): string {
    let corrected = text;
    let offset = 0;

    // Sort errors by position to apply corrections in order
    const sortedErrors = [...spellingErrors].sort((a, b) => a.position - b.position);

    for (const error of sortedErrors) {
      if (error.suggestions.length > 0) {
        const startPos = error.position + offset;
        const endPos = startPos + error.word.length;
        const replacement = error.suggestions[0]; // Use first suggestion

        corrected =
          corrected.substring(0, startPos) +
          replacement +
          corrected.substring(endPos);

        // Update offset for next replacement
        offset += replacement.length - error.word.length;
      }
    }

    return corrected;
  }

  /**
   * Calculate summary statistics
   */
  private calculateSummary(
    text: string,
    spellingErrors: SpellingErrorDetail[],
    grammarErrors: GrammarError[]
  ): AnalysisResult["summary"] {
    // Count words
    const words = text.match(/\b\w+\b/g) || [];
    const totalWords = words.length;
    const uniqueWords = new Set(words.map((w) => w.toLowerCase())).size;

    // Count errors
    const spellingErrorCount = spellingErrors.length;
    const grammarErrorCount = grammarErrors.length;
    const totalErrors = spellingErrorCount + grammarErrorCount;

    // Calculate error rate
    const errorRate =
      totalWords > 0
        ? ((totalErrors / totalWords) * 100).toFixed(2) + "%"
        : "0%";

    // Calculate average confidence
    const averageConfidence =
      spellingErrors.length > 0
        ? spellingErrors.reduce((sum, e) => sum + e.confidence, 0) /
          spellingErrors.length
        : 100;

    return {
      totalWords,
      uniqueWords,
      spellingErrorCount,
      grammarErrorCount,
      errorRate,
      averageConfidence: Math.round(averageConfidence),
    };
  }

  /**
   * Calculate confidence score based on suggestions
   * More suggestions = lower confidence (more ambiguous)
   */
  private calculateConfidence(suggestionCount: number): number {
    if (suggestionCount === 0) return 50; // No suggestions = low confidence
    if (suggestionCount === 1) return 95; // One suggestion = high confidence
    if (suggestionCount <= 3) return 80; // Few suggestions = medium-high confidence
    return 60; // Many suggestions = medium confidence
  }
}
