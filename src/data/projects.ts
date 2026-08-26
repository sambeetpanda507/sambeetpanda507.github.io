export const projects = [
  {
    slug: 'hybrid-search',
    title: 'Hybrid Search System',
    tag: 'Go · PostgreSQL · Search',
    repo: 'https://github.com/sambeetpanda507/hybrid-search',
    summary: 'A Go microservices project for job search using semantic vector search, ParadeDB BM25 lexical search, and Reciprocal Rank Fusion.',
    stack: ['Go', 'PostgreSQL', 'pgvector', 'ParadeDB BM25', 'HNSW', 'Ollama', 'Docker Compose'],
    problem: 'Search systems often need both exact keyword relevance and semantic similarity. This project explores job search where either approach alone can miss useful results, then combines the two rankings.',
    architecture: [
      'A broker service acts as the public HTTP entry point.',
      'The broker forwards search requests to a dedicated search service.',
      'The search service stores job records and vectors in ParadeDB/PostgreSQL.',
      'Ollama with all-minilm generates 384-dimensional embeddings.',
      'Lexical BM25 and semantic vector results are combined with Reciprocal Rank Fusion.'
    ],
    scalability: [
      'Search work is isolated behind a dedicated service boundary, so API routing and search concerns can evolve independently.',
      'HNSW indexing is used for vector retrieval instead of scanning every stored embedding.',
      'BM25 is backed by a database index through ParadeDB.',
      'The repository includes a 250,000-row CSV dataset, while the current importer intentionally loads about 10,000 rows per run.',
      'Current limitations matter: embedding generation is synchronous during import, /store-csv is not idempotent, and the repository currently has no tests.'
    ],
    mermaid: `flowchart LR
      C[Client] -->|HTTP| B[Broker Service]
      B --> S[Search Service]
      S -->|SQL / BM25 / Vector Search| P[(ParadeDB / PostgreSQL)]
      S -->|Embedding API| O[Ollama all-minilm]
      P --> S
      O --> S`
  },
  {
    slug: 'worklog',
    title: 'Work Log Search & Analytics',
    tag: 'Go · PostgreSQL · Analytics',
    repo: 'https://github.com/sambeetpanda507/worklog',
    summary: 'A work-log management application with task tracking, PostgreSQL-powered fuzzy/full-text search, and visual analytics.',
    stack: ['Go net/http', 'PostgreSQL', 'pg_trgm', 'fuzzystrmatch', 'Full-text Search', 'Vue.js 3', 'Chart.js'],
    problem: 'Work items become hard to retrieve when names are inconsistent, misspelled, or buried in notes. The project combines task tracking with multiple PostgreSQL search techniques and a dashboard for understanding work status and trends.',
    architecture: [
      'Vue.js provides the task-management and analytics UI.',
      'A Go net/http backend serves application operations.',
      'PostgreSQL stores work logs and powers search.',
      'Generated tsvector data and GIN indexing support full-text queries.',
      'pg_trgm, Levenshtein, and Metaphone provide additional fuzzy and phonetic matching approaches.'
    ],
    scalability: [
      'Full-text search uses a generated tsvector column and GIN index, avoiding repeated document-vector construction at query time.',
      'Trigram and database-native search keep retrieval close to the stored data rather than adding a separate search service.',
      'The schema supports filtering and analytics dimensions such as status, task type, and priority.',
      'The repository demonstrates indexing techniques, but it does not claim production traffic levels or distributed deployment.'
    ],
    mermaid: `flowchart LR
      U[User] --> V[Vue.js 3 UI]
      V --> G[Go net/http API]
      G --> P[(PostgreSQL)]
      P --> F[Full-text / GIN]
      P --> T[pg_trgm / Levenshtein / Metaphone]
      P --> A[Analytics Queries]
      A --> V`
  },
  {
    slug: 'go-pgsql-search',
    title: 'PostgreSQL Semantic News Search',
    tag: 'Go · PostgreSQL · Vector Search',
    repo: 'https://github.com/sambeetpanda507/go-pgsql-search',
    summary: 'A Go service that stores news data in PostgreSQL, generates embeddings through a local model service, and supports semantic retrieval with pgvector.',
    stack: ['Go', 'GORM', 'PostgreSQL', 'pgvector', 'Ollama-compatible Embedding API', 'SQL Migrations'],
    problem: 'Keyword-only lookup can fail when a query and a relevant news item use different wording. This project stores vector embeddings with news records so semantic similarity can be used during retrieval.',
    architecture: [
      'A Go HTTP service exposes health, import, embedding, and news endpoints.',
      'Training data is loaded from a CSV file.',
      'The service calls a local embedding endpoint for vector generation.',
      'News records and embeddings are stored in PostgreSQL using pgvector.',
      'SQL migrations run automatically at startup alongside GORM model migration.'
    ],
    scalability: [
      'Embeddings are persisted with records, so they do not need to be regenerated for every search.',
      'Pagination is supported by the news endpoint.',
      'Database migrations are automated, which makes schema setup repeatable across environments.',
      'The current repository uses a single Go service and a local embedding dependency; it does not claim horizontal scaling or production throughput.'
    ],
    mermaid: `flowchart LR
      C[Client] --> A[Go HTTP Service]
      A -->|Import CSV| D[(PostgreSQL + pgvector)]
      A -->|Generate Embedding| E[Local Embedding Service]
      E --> A
      A -->|Semantic Search / Pagination| D
      D --> A`
  }
] as const;

export type Project = (typeof projects)[number];
