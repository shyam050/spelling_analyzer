# English Spelling Analyzer

An open-source web-based application that performs English spelling identification and correction using compiler-based techniques. The system employs lexical analysis, tokenization, dictionary-based spell checking, and rule-based grammar parsing to provide comprehensive text analysis with intelligent correction suggestions.

## Features

- **Real-time Spelling Analysis**: Identifies misspelled words using dictionary lookup and lexical analysis
- **Smart Correction Suggestions**: Generates suggestions using Levenshtein distance algorithm (edit distance)
- **Grammar Checking**: Detects common grammar errors including subject-verb agreement, article usage, and punctuation
- **File Upload Support**: Process .txt and .docx files for batch text analysis
- **Analysis History**: Track past analyses with timestamps (for authenticated users)
- **Color-coded Error Display**: Visual distinction between spelling and grammar errors
- **Confidence Scoring**: Each error includes a confidence percentage for correction suggestions
- **Dark-themed Editor Interface**: Modern, elegant UI inspired by code editors
- **Compiler-based Architecture**: Built on formal compiler theory with lexical analysis, tokenization, and finite automata

## Technology Stack

### Frontend
- **React 19** with TypeScript
- **Tailwind CSS 4** for styling
- **shadcn/ui** components for consistent design
- **tRPC** for type-safe API communication
- **Wouter** for client-side routing

### Backend
- **Node.js** with Express 4
- **tRPC 11** for RPC procedures
- **Drizzle ORM** for database operations
- **MySQL/TiDB** for data persistence
- **jszip** for DOCX file processing

### DevOps & Build
- **Vite** for frontend bundling
- **esbuild** for backend compilation
- **Vitest** for unit testing
- **TypeScript** for type safety

## System Architecture

### Lexical Analysis Engine
The lexical analyzer implements a deterministic finite automaton (DFA) that tokenizes input text into a stream of tokens. Each token carries metadata including type (WORD, NUMBER, PUNCTUATION, WHITESPACE), value, position, and line/column information. This approach ensures O(n) time complexity for tokenization.

### Spell Checking Module
The spell checker validates each word token against a dictionary of approximately 2,500 common English words. For misspelled words, it generates suggestions using the Levenshtein distance algorithm with O(m×n) complexity, where m and n are word lengths. Suggestions are ranked by edit distance and limited to five candidates. Confidence scores are calculated based on suggestion quality.

### Grammar Checking Module
The grammar checker applies pattern-matching rules to detect common errors:
- Subject-verb agreement violations
- Incorrect article usage (a/an)
- Double punctuation marks
- Missing apostrophes in contractions
- Capitalization errors

## Installation

### Prerequisites
- Node.js 22.13.0 or higher
- pnpm 10.4.1 or higher
- MySQL 8.0 or TiDB compatible database

### Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/spelling_analyzer.git
   cd spelling_analyzer
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment variables**
   Create a `.env.local` file with:
   ```
   DATABASE_URL=mysql://user:password@localhost:3306/spelling_analyzer
   JWT_SECRET=your-secret-key-here
   ```

4. **Initialize the database**
   ```bash
   pnpm db:push
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

6. **Open in browser**
   Navigate to `http://localhost:5173` for the frontend

## Usage

### Text Analysis
1. Navigate to the Analyzer page
2. Paste or type English text in the input area
3. Click "Analyze Text" to process
4. Review results in the tabbed interface:
   - **Overview**: Summary statistics and corrected text
   - **Spelling**: Detailed spelling errors with suggestions
   - **Grammar**: Grammar errors with severity levels

### File Upload
1. Click "Upload File" button
2. Select a .txt or .docx file (max 10MB)
3. The system automatically extracts text and performs analysis
4. Results display immediately

### History
- Authenticated users can view past analyses in the sidebar
- Click any history item to reload that analysis
- Timestamps show when each analysis was performed

## API Documentation

### tRPC Procedures

#### `analysis.analyze`
Analyzes text for spelling and grammar errors.

**Input:**
```typescript
{
  text: string; // 1-50,000 characters
}
```

**Output:**
```typescript
{
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
```

#### `analysis.uploadFile`
Processes uploaded files for analysis.

**Input:**
```typescript
{
  filename: string;
  fileData: string; // base64 encoded
}
```

**Output:** Same as `analysis.analyze`

#### `analysis.history`
Retrieves past analyses for the current user.

**Input:**
```typescript
{
  limit?: number; // default: 50, max: 100
}
```

**Output:**
```typescript
Array<{
  id: number;
  originalText: string;
  spellingErrors: number;
  grammarErrors: number;
  totalWords: number;
  errorRate: string;
  createdAt: Date;
  fileName?: string;
}>
```

## Database Schema

### `users` Table
- `id`: Auto-incremented primary key
- `openId`: Unique Manus OAuth identifier
- `name`: User's display name
- `email`: User's email address
- `role`: User role (admin/user)
- `createdAt`: Account creation timestamp
- `updatedAt`: Last update timestamp
- `lastSignedIn`: Last login timestamp

### `analysisHistory` Table
- `id`: Auto-incremented primary key
- `userId`: Foreign key to users table
- `originalText`: Input text analyzed
- `correctedText`: Auto-corrected version
- `spellingErrors`: Count of spelling errors
- `grammarErrors`: Count of grammar errors
- `totalWords`: Total word count
- `errorRate`: Percentage error rate
- `analysisData`: JSON string with detailed results
- `fileName`: Original filename (if from upload)
- `fileType`: Type of input (direct/text/docx)
- `createdAt`: Analysis timestamp

## Performance

- **Tokenization**: O(n) where n is input length
- **Spell Checking**: O(k×m×n) per word, where k is dictionary size
- **Typical Analysis Time**: 200-500ms for 500-5,000 word documents
- **Maximum Input**: 50,000 characters or 10MB files

## Compiler Techniques Applied

1. **Lexical Analysis**: Deterministic finite automaton for tokenization
2. **Token Classification**: Pattern matching for word/number/punctuation recognition
3. **Dictionary Lookup**: O(1) hash table for word validation
4. **Edit Distance**: Dynamic programming for suggestion generation
5. **Rule-based Parsing**: Pattern matching for grammar rule enforcement
6. **Error Reporting**: Detailed error objects with position and severity information

## Project Structure

```
spelling_analyzer/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/           # tRPC client setup
│   │   ├── App.tsx        # Main app component
│   │   └── index.css      # Global styles
│   └── public/            # Static assets
├── server/                # Node.js backend
│   ├── lexicalAnalyzer.ts # Tokenization engine
│   ├── grammarChecker.ts  # Grammar validation
│   ├── analysisEngine.ts  # Orchestrator
│   ├── fileHandler.ts     # File processing
│   ├── routers.ts         # tRPC procedures
│   └── db.ts              # Database queries
├── drizzle/               # Database schema and migrations
│   └── schema.ts          # Table definitions
├── shared/                # Shared types and constants
└── package.json           # Dependencies
```


## Acknowledgments

- Built with React, TypeScript, and Tailwind CSS
- Inspired by compiler design principles
- Uses shadcn/ui for component library
- Powered by tRPC for type-safe APIs

