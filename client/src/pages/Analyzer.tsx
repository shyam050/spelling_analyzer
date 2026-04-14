import { useState, useRef, useMemo } from "react";
import { trpc } from "@/lib/trpc";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  History,
  Zap,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

interface AnalysisResult {
  originalText: string;
  correctedText: string;
  spellingErrors: Array<{
    word: string;
    position: number;
    suggestions: string[];
    confidence: number;
  }>;
  grammarErrors: Array<{
    type: string;
    message: string;
    suggestion: string;
    severity: "error" | "warning";
  }>;
  summary: {
    totalWords: number;
    uniqueWords: number;
    spellingErrorCount: number;
    grammarErrorCount: number;
    errorRate: string;
    averageConfidence: number;
  };
}

export default function Analyzer() {
  
  const [inputText, setInputText] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzeMutation = trpc.analysis.analyze.useMutation();
  const uploadMutation = trpc.analysis.uploadFile.useMutation();
  const historyQuery = trpc.analysis.history.useQuery({ limit: 10 });

  const handleAnalyze = async () => {
    if (!inputText.trim()) {
      toast.error("Please enter some text to analyze");
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeMutation.mutateAsync({ text: inputText });
      setAnalysisResult(result as AnalysisResult);
      toast.success("Analysis complete!");
      historyQuery.refetch();
    } catch (error) {
      toast.error("Analysis failed. Please try again.");
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ["text/plain", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!validTypes.includes(file.type) && !file.name.endsWith(".txt") && !file.name.endsWith(".docx")) {
      toast.error("Please upload a .txt or .docx file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit");
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const buffer = e.target?.result as ArrayBuffer;
          const base64 = Buffer.from(buffer).toString("base64");

          const result = await uploadMutation.mutateAsync({
            filename: file.name,
            fileData: base64,
          });

          setInputText(result.originalText);
          setAnalysisResult(result as AnalysisResult);
          toast.success(`File uploaded and analyzed: ${file.name}`);
          historyQuery.refetch();
        } catch (error) {
          toast.error("Failed to process file. Please try again.");
          console.error(error);
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      toast.error("Failed to read file");
      console.error(error);
      setIsUploading(false);
    }
  };

  const handleCopyCorrected = async () => {
    if (analysisResult?.correctedText) {
      try {
        await navigator.clipboard.writeText(analysisResult.correctedText);
        toast.success("Corrected text copied to clipboard!");
      } catch (error) {
        toast.error("Failed to copy text");
        console.error(error);
      }
    }
  };

  const highlightedText = useMemo(() => {
    if (!analysisResult || !inputText) return inputText;

    let html = inputText;
    const allErrors = [
      ...analysisResult.spellingErrors.map((e) => ({
        ...e,
        type: "spelling",
      })),
    ].sort((a, b) => b.position - a.position);

    for (const error of allErrors) {
      if (error.type === "spelling") {
        const word = (error as any).word;
        const regex = new RegExp(`\\b${word}\\b`, "gi");
        html = html.replace(
          regex,
          `<span class="error-highlight" title="${(error as any).suggestions.join(", ")}">${word}</span>`
        );
      }
    }

    return html;
  }, [inputText, analysisResult]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">
            English Spelling Analyzer - Shyam Sundar
          </h1>
          <p className="text-muted-foreground">
            Advanced lexical analysis and grammar checking using compiler
            techniques
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Editor Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Input Section */}
            <Card className="p-6 border-border">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-accent" />
                Text Input
              </h2>
              <textarea
                className="editor-input w-full h-64"
                placeholder="Paste or type your English text here for spelling and grammar analysis..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <div className="mt-4 flex flex-wrap gap-3">
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !inputText.trim()}
                  className="button-primary"
                >
                  {isAnalyzing ? "Analyzing..." : "Analyze Text"}
                </Button>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="button-secondary gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {isUploading ? "Uploading..." : "Upload File"}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => {
                    setInputText("");
                    setAnalysisResult(null);
                  }}
                  variant="outline"
                  className="button-secondary"
                >
                  Clear
                </Button>
              </div>
            </Card>

            {/* Results Section */}
            {analysisResult && (
              <Card className="p-6 border-border">
                <h2 className="text-lg font-semibold mb-4">Analysis Results</h2>

                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-card border border-border">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="spelling">
                      Spelling ({analysisResult.summary.spellingErrorCount})
                    </TabsTrigger>
                    <TabsTrigger value="grammar">
                      Grammar ({analysisResult.summary.grammarErrorCount})
                    </TabsTrigger>
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent value="overview" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="result-card">
                        <p className="text-sm text-muted-foreground">
                          Total Words
                        </p>
                        <p className="text-2xl font-bold text-accent">
                          {analysisResult.summary.totalWords}
                        </p>
                      </div>
                      <div className="result-card">
                        <p className="text-sm text-muted-foreground">
                          Unique Words
                        </p>
                        <p className="text-2xl font-bold text-accent">
                          {analysisResult.summary.uniqueWords}
                        </p>
                      </div>
                      <div className="result-card">
                        <p className="text-sm text-muted-foreground">
                          Error Rate
                        </p>
                        <p className="text-2xl font-bold text-red-400">
                          {analysisResult.summary.errorRate}
                        </p>
                      </div>
                      <div className="result-card">
                        <p className="text-sm text-muted-foreground">
                          Confidence
                        </p>
                        <p className="text-2xl font-bold text-green-400">
                          {analysisResult.summary.averageConfidence}%
                        </p>
                      </div>
                    </div>

                    <div className="result-card mt-4">
                      <p className="text-sm font-semibold mb-3">Corrected Text</p>
                      <p className="text-sm leading-relaxed text-foreground/90 mb-3 bg-input p-3 rounded border border-border max-h-48 overflow-y-auto">
                        {analysisResult.correctedText}
                      </p>
                      <Button
                        onClick={handleCopyCorrected}
                        size="sm"
                        className="button-primary gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        Copy Corrected Text
                      </Button>
                    </div>
                  </TabsContent>

                  {/* Spelling Errors Tab */}
                  <TabsContent value="spelling" className="space-y-3 mt-4">
                    {analysisResult.spellingErrors.length === 0 ? (
                      <div className="result-card flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        <span className="text-green-300">
                          No spelling errors found!
                        </span>
                      </div>
                    ) : (
                      analysisResult.spellingErrors.map((error, idx) => (
                        <div key={idx} className="result-card">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-mono font-semibold text-red-300">
                                {error.word}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Confidence: {error.confidence}%
                              </p>
                            </div>
                            <span className="error-badge">
                              <AlertCircle className="w-3 h-3" />
                              Misspelled
                            </span>
                          </div>
                          <div className="mt-3">
                            <p className="text-xs font-semibold text-muted-foreground mb-2">
                              Suggestions:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {error.suggestions.map((suggestion, sidx) => (
                                <button
                                  key={sidx}
                                  onClick={() => {
                                    const newText = inputText.replace(
                                      new RegExp(`\\b${error.word}\\b`, "g"),
                                      suggestion
                                    );
                                    setInputText(newText);
                                    toast.success(
                                      `Replaced "${error.word}" with "${suggestion}"`
                                    );
                                  }}
                                  className="px-2 py-1 bg-accent/20 text-accent hover:bg-accent/30 rounded text-sm transition-colors"
                                >
                                  {suggestion}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </TabsContent>

                  {/* Grammar Errors Tab */}
                  <TabsContent value="grammar" className="space-y-3 mt-4">
                    {analysisResult.grammarErrors.length === 0 ? (
                      <div className="result-card flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        <span className="text-green-300">
                          No grammar errors found!
                        </span>
                      </div>
                    ) : (
                      analysisResult.grammarErrors.map((error, idx) => (
                        <div key={idx} className="result-card">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-foreground">
                                {error.type}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {error.message}
                              </p>
                            </div>
                            <span
                              className={
                                error.severity === "error"
                                  ? "error-badge"
                                  : "warning-badge"
                              }
                            >
                              <AlertCircle className="w-3 h-3" />
                              {error.severity}
                            </span>
                          </div>
                          <div className="mt-3 p-2 bg-input rounded border border-border">
                            <p className="text-sm text-accent">
                              {error.suggestion}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </TabsContent>
                </Tabs>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* History Section */}
            <Card className="p-6 border-border">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <History className="w-5 h-5 text-accent" />
                Recent Analysis
              </h2>

              <div className="space-y-2">
  {historyQuery.data && historyQuery.data.length > 0 ? (
    historyQuery.data.map((record: any) => (
      <button
        key={record.id}
        onClick={() => setInputText(record.originalText)}
        className="w-full text-left p-3 rounded bg-input hover:bg-input/80 transition-colors border border-border/50 hover:border-accent/50"
      >
        <p className="text-xs text-muted-foreground truncate">
          {record.originalText.substring(0, 50)}...
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {record.spellingErrors} spelling, {record.grammarErrors} grammar
        </p>
        <p className="text-xs text-muted-foreground">
          {new Date(record.createdAt).toLocaleDateString()}
        </p>
      </button>
    ))
  ) : (
    <p className="text-sm text-muted-foreground">
      No analysis history yet
    </p>
  )}
</div>
            </Card>

            {/* Info Section */}
            <Card className="p-6 border-border bg-card/50">
              <h3 className="font-semibold mb-3">How It Works</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-accent">•</span>
                  <span>Lexical analysis using tokenization</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">•</span>
                  <span>Dictionary-based spell checking</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">•</span>
                  <span>Rule-based grammar validation</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">•</span>
                  <span>Edit distance suggestions</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
