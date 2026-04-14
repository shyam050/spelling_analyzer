
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  Zap,
  BookOpen,
  Code2,
  CheckCircle2,
  Github,
} from "lucide-react";
import { useLocation } from "wouter";


export default function Home() {
 
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-6 h-6 text-accent" />
            <span className="font-bold text-lg gradient-text">
              Spelling Analyzer
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate("/analyzer")}
              className="button-primary"
            >
              Analyzer
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text">
            English Spelling & Grammar Analyzer
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Advanced lexical analysis and grammar checking using compiler
            techniques. Identify, correct, and learn from spelling and grammar
            errors with precision.
          </p>
          <div className="flex gap-4 justify-center">
            <Button
            onClick={() => navigate("/analyzer")}
            size="lg"
            className="button-primary gap-2"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </Button>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" variant="outline" className="button-secondary gap-2">
                <Github className="w-5 h-5" />
                View on GitHub
              </Button>
            </a>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          <Card className="p-8 border-border hover:border-accent/50 transition-colors">
            <Zap className="w-8 h-8 text-accent mb-4" />
            <h3 className="text-xl font-semibold mb-2">Real-time Analysis</h3>
            <p className="text-muted-foreground">
              Instant spelling and grammar checking as you type, powered by
              lexical analysis and tokenization.
            </p>
          </Card>

          <Card className="p-8 border-border hover:border-accent/50 transition-colors">
            <BookOpen className="w-8 h-8 text-accent mb-4" />
            <h3 className="text-xl font-semibold mb-2">Smart Suggestions</h3>
            <p className="text-muted-foreground">
              Get intelligent correction suggestions using edit distance
              algorithms and rule-based parsing.
            </p>
          </Card>

          <Card className="p-8 border-border hover:border-accent/50 transition-colors">
            <Code2 className="w-8 h-8 text-accent mb-4" />
            <h3 className="text-xl font-semibold mb-2">Compiler Techniques</h3>
            <p className="text-muted-foreground">
              Built on compiler theory with lexical analysis, tokenization, and
              finite automata.
            </p>
          </Card>
        </div>

        {/* How It Works */}
        <div className="max-w-4xl mx-auto mb-20">
          <h2 className="text-3xl font-bold mb-12 text-center">
            How It Works
          </h2>

          <div className="space-y-6">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-accent/20 text-accent">
                  <span className="text-lg font-bold">1</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Lexical Analysis</h3>
                <p className="text-muted-foreground">
                  Input text is tokenized using a lexical analyzer that
                  recognizes words, punctuation, and symbols using finite
                  automata.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-accent/20 text-accent">
                  <span className="text-lg font-bold">2</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Spell Checking</h3>
                <p className="text-muted-foreground">
                  Each word token is validated against a comprehensive English
                  dictionary. Misspelled words are identified using dictionary
                  lookup.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-accent/20 text-accent">
                  <span className="text-lg font-bold">3</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Correction Suggestions
                </h3>
                <p className="text-muted-foreground">
                  Levenshtein distance algorithm generates spelling suggestions
                  ranked by edit distance, providing the most likely corrections
                  first.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-accent/20 text-accent">
                  <span className="text-lg font-bold">4</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Grammar Checking</h3>
                <p className="text-muted-foreground">
                  Rule-based parsing detects common grammar errors including
                  subject-verb agreement, article usage, and punctuation
                  violations.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-accent/20 text-accent">
                  <span className="text-lg font-bold">5</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Analysis Report</h3>
                <p className="text-muted-foreground">
                  Comprehensive analysis report with statistics, error rate
                  calculation, confidence scores, and corrected text output.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className="max-w-2xl mx-auto mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center">Features</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "Real-time spelling analysis",
              "Grammar error detection",
              "Smart correction suggestions",
              "Confidence scoring",
              "Analysis history tracking",
              "File upload support (.txt, .docx)",
              "Color-coded error highlighting",
              "Detailed error reports",
              "Batch text processing",
              "User authentication",
              "Compiler-based tokenization",
              "Rule-based parsing engine",
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>
            English Spelling Analyzer • Built with React, TypeScript, and
            Compiler Techniques
          </p>
          <p className="text-sm mt-2">
            © 2026 • Open Source Project • Academic Assignment
          </p>
        </div>
      </footer>
    </div>
  );
}
