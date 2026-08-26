export const projects = [
  {
    slug: 'hybrid-search',
    title: 'Hybrid Search System',
    tag: 'Go · PostgreSQL · Search',
    repo: 'https://github.com/sambeetpanda507/hybrid-search',
    sourceLabel: 'Public repository',
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
    sourceLabel: 'Public repository',
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
      P --> T[pg_trgm / Fuzzy Search]
      P --> A[Analytics Queries]
      A --> V`
  },
  {
    slug: 'journeybuilder-lxp',
    title: 'Journeybuilder Learning Experience Platform',
    tag: 'Professional · LXP · Platform Engineering',
    sourceLabel: 'Professional project',
    summary: 'A learning experience platform covering roadmap generation, learning content workflows, collaboration, authentication, analytics, and AI-assisted experiences.',
    stack: ['Node.js', 'Next.js', 'React', 'MongoDB', 'Azure', 'OpenAI integration'],
    problem: 'Learning platforms need to coordinate content, user journeys, collaboration, analytics, and AI-assisted workflows without forcing every capability into one tightly coupled application. The work focused on evolving these product capabilities while separating domain-specific Journeybuilder logic from legacy platform responsibilities.',
    architecture: [
      'Journeybuilder was being extracted from a larger monolithic platform using a gradual service-extraction approach.',
      'The existing platform continued to handle shared concerns such as authentication, routing, logging, and legacy behavior.',
      'Journeybuilder handled domain-specific APIs and roadmap-generation logic.',
      'The product included collaborative editing, versioning, comments, publishing workflows, artifacts, dashboards, and AI-assisted experiences.',
      'The architecture was designed around clearer service boundaries rather than moving every responsibility at once.'
    ],
    scalability: [
      'Separating Journeybuilder domain logic from the monolith reduces coupling and allows that domain to evolve independently.',
      'Stateless application services can be horizontally replicated when deployed behind shared routing infrastructure.',
      'Caching can be used for frequently reused data, while long-running AI or notification work is better separated from synchronous request handling.',
      'Database indexing, connection management, and logical data separation are important as the domain grows.',
      'No traffic, user-count, or throughput claim is made here because those figures are not part of the portfolio source material.'
    ],
    mermaid: `flowchart LR
      U[Web / Mobile Clients] --> M[Existing Platform / Gateway]
      M --> J[Journeybuilder Domain Service]
      J --> D[(Domain Data Store)]
      J --> A[AI-assisted Workflows]
      M --> S[Shared Auth / Routing / Logging]
      J --> C[Collaboration / Content / Roadmaps]`
  },
  {
    slug: 'ai-course-generation-pipeline',
    title: 'AI Course Generation Pipeline',
    tag: 'Professional · AI · Distributed Processing',
    sourceLabel: 'Professional project',
    summary: 'An asynchronous document-to-course pipeline designed around parsing, semantic chunking, AI generation, human checkpoints, restartability, and worker-based processing.',
    stack: ['Python', 'FastAPI', 'RabbitMQ', 'MongoDB', 'Azure Blob Storage', 'LangChain', 'PyMuPDF4LLM', 'Chonkie', 'Vector Database'],
    problem: 'Turning long-form source material into structured learning content is a multi-stage process that can be slow, failure-prone, and expensive when handled as one synchronous request. The pipeline separates ingestion, parsing, generation, review checkpoints, and downstream processing so work can progress reliably across stages.',
    architecture: [
      'A FastAPI service accepts and tracks document-processing jobs.',
      'Documents are stored externally while metadata and processing state are tracked separately.',
      'RabbitMQ is used to distribute long-running work to consumer workers.',
      'Documents are parsed into page-aware content, then semantically chunked before AI generation steps.',
      'Human-in-the-loop checkpoints are used for generated artifacts such as outlines and scripts.',
      'Processing state is designed so failed work can resume instead of forcing the entire document through the pipeline again.'
    ],
    scalability: [
      'Queue-based processing decouples API request latency from expensive document and AI workloads.',
      'Worker count can be increased independently from the API layer as processing demand grows.',
      'External object storage prevents large document payloads from being coupled to application instances.',
      'Stage-oriented processing and persisted status make retries and restart-from-failure behavior practical.',
      'Duplicate-ingestion prevention and idempotent processing are important safeguards when scaling worker execution.'
    ],
    mermaid: `flowchart LR
      U[User / Client] --> A[FastAPI]
      A --> B[(Blob Storage)]
      A --> M[(MongoDB / Job State)]
      A --> Q[RabbitMQ]
      Q --> W[Consumer Workers]
      W --> P[Parse + Semantic Chunking]
      P --> L[LLM Generation]
      L --> H[Human Checkpoint]
      H --> V[(Vector / Retrieval Store)]
      W --> M`
  },
  {
    slug: 'ai-pr-review-agent',
    title: 'AI Pull Request Review Agent',
    tag: 'Professional · Developer Tooling · Agents',
    sourceLabel: 'Professional project',
    summary: 'A repository-aware pull-request review workflow that combines structured engineering rules, validation prompts, GitHub automation, and agent-based analysis.',
    stack: ['Python', 'FastAPI', 'LangGraph', 'GitHub API', 'GitHub Actions', 'uv'],
    problem: 'Manual pull-request review becomes difficult when many repositories and parallel PRs must be checked consistently against project-specific engineering standards. The system is designed to automate repeatable review checks while keeping repository rules and validation criteria explicit.',
    architecture: [
      'GitHub pull-request events trigger CI automation.',
      'The workflow invokes a Python-based review agent from the engineering codebase.',
      'LangGraph coordinates repository-aware review steps and structured validation prompts.',
      'The review logic uses project-specific checklists, grounding rules, and validation criteria rather than a generic one-size-fits-all prompt.',
      'GitHub APIs and CLI-compatible workflows are used to read pull-request context and publish review results.'
    ],
    scalability: [
      'CI-triggered execution allows reviews to run independently for separate pull requests.',
      'Project-specific prompt/checklist configuration separates reusable review orchestration from repository-specific policy.',
      'Running review work in CI avoids depending on a developer workstation being online.',
      'The system can be extended with deterministic checks such as linting, tests, builds, and security scans alongside AI review.',
      'Repository permissions and GitHub API rate/authorization limits remain operational constraints and must be handled explicitly.'
    ],
    mermaid: `flowchart LR
      D[Developer] --> PR[GitHub Pull Request]
      PR --> GA[GitHub Actions]
      GA --> R[Python / LangGraph Review Agent]
      R --> C[Project Review Checklist]
      R --> G[Repository + PR Context]
      C --> R
      G --> R
      R --> O[Review Findings]
      O --> PR`
  },
  {
    slug: 'script-review-system',
    title: 'Structured Script Review System',
    tag: 'Professional · Content Quality · AI',
    sourceLabel: 'Professional project',
    summary: 'A structured content-review pipeline that converts scripts into typed blocks and evaluates them against configurable review rules and guidelines.',
    stack: ['Python', 'Document Parsing', 'Structured Blocks', 'Semantic Chunking', 'Rule Execution', 'TipTap'],
    problem: 'Reviewing long scripts against detailed production or quality guidelines is difficult when content arrives as loosely structured documents. The system normalizes the document into predictable content types so rules can target the right sections and reviewers can receive specific, actionable feedback.',
    architecture: [
      'Input documents are parsed into document-level blocks rather than treated as one large text string.',
      'Blocks are normalized into types such as headings, scenes, dialogue, visuals, on-screen text, notes, and table rows.',
      'Sections, scenes, speakers, and visual cues are detected before downstream evaluation.',
      'Content is chunked with token-aware boundaries when larger analysis units are needed.',
      'Configurable rules determine what checks apply to which block types.',
      'The editing experience is designed around structured content so reviewed material can be iterated and re-submitted.'
    ],
    scalability: [
      'Typed blocks let checks run only against relevant content instead of repeatedly evaluating the entire document.',
      'Rule configuration separates review policy from the parsing and execution engine.',
      'Chunking allows long documents to be processed in bounded analysis units.',
      'A structured intermediate representation makes it easier to add new rule types without redesigning the ingestion pipeline.',
      'No production volume or throughput numbers are claimed because those metrics were not part of the source material.'
    ],
    mermaid: `flowchart LR
      D[DOCX / Script] --> P[Parse Document Blocks]
      P --> N[Normalize Typed Blocks]
      N --> S[Detect Scenes / Speakers / Visuals]
      S --> C[Semantic + Token-aware Chunks]
      C --> R[Configurable Rule Execution]
      R --> F[Scores + Recommended Fixes]
      F --> E[Structured Editor / Re-review]`
  }
] as const;

export type Project = (typeof projects)[number];
