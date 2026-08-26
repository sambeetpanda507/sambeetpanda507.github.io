export const projects = [
  {
    slug: 'hybrid-search',
    title: 'Hybrid Search System',
    tag: 'Go · PostgreSQL · Search',
    repo: 'https://github.com/sambeetpanda507/hybrid-search',
    sourceLabel: 'Public repository',
    summary: 'A Go microservices project for job search using semantic vector search, ParadeDB BM25 lexical search, and Reciprocal Rank Fusion.',
    stack: ['Go', 'PostgreSQL', 'pgvector', 'ParadeDB BM25', 'HNSW', 'Ollama', 'Docker Compose'],
    context: 'A backend/search engineering project built to explore how lexical and semantic retrieval can work together for job discovery instead of treating them as competing approaches.',
    problem: 'Search systems often need both exact keyword relevance and semantic similarity. Keyword search can miss conceptually similar results, while vector search can weaken exact-term relevance. This project combines both result sets into one ranking.',
    contribution: [
      'Designed the service split between a broker/gateway layer and a dedicated search service.',
      'Implemented PostgreSQL-backed storage and search flows for job data.',
      'Integrated embedding generation with Ollama using all-minilm.',
      'Combined BM25 and vector search results using Reciprocal Rank Fusion.',
      'Set up the supporting local infrastructure with Docker Compose.'
    ],
    challenges: [
      'Representing the same job corpus for both lexical and semantic retrieval.',
      'Avoiding full embedding scans as the dataset grows.',
      'Merging rankings from two retrieval systems that produce different score distributions.',
      'Keeping ingestion and search responsibilities understandable across services.'
    ],
    decisions: [
      'Use PostgreSQL/ParadeDB as the shared data layer so lexical and vector search operate on the same records.',
      'Use HNSW indexing for vector retrieval instead of brute-force similarity scans.',
      'Use Reciprocal Rank Fusion because it combines rank positions without requiring BM25 and vector scores to be normalized onto the same scale.',
      'Keep a broker service in front of the search service to preserve a clean public entry point.'
    ],
    flow: [
      'Job data is imported into PostgreSQL.',
      'Embeddings are generated for searchable records and stored alongside job data.',
      'A search request reaches the broker service and is forwarded to the search service.',
      'The search service runs BM25 lexical retrieval and vector retrieval.',
      'The two ranked result sets are fused and returned as one response.'
    ],
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
      'The repository includes a 250,000-row CSV dataset, while the current importer intentionally loads about 10,000 rows per run.'
    ],
    limitations: [
      'Embedding generation is synchronous during import.',
      '/store-csv is not currently idempotent.',
      'The repository currently has no automated tests.',
      'The project demonstrates the architecture but does not claim production throughput.'
    ],
    mermaid: `flowchart LR
      C[Client] -->|HTTP| B[Broker Service]
      B --> S[Search Service]
      S -->|BM25 Search| P[(ParadeDB / PostgreSQL)]
      S -->|Vector Search| P
      S -->|Embedding API| O[Ollama all-minilm]
      P --> R[Ranked Result Sets]
      O --> S
      R --> F[Reciprocal Rank Fusion]
      F --> C`
  },
  {
    slug: 'worklog',
    title: 'Work Log Search & Analytics',
    tag: 'Go · PostgreSQL · Analytics',
    repo: 'https://github.com/sambeetpanda507/worklog',
    sourceLabel: 'Public repository',
    summary: 'A work-log management application with task tracking, PostgreSQL-powered fuzzy/full-text search, and visual analytics.',
    stack: ['Go net/http', 'PostgreSQL', 'pg_trgm', 'fuzzystrmatch', 'Full-text Search', 'Vue.js 3', 'Chart.js'],
    context: 'A practical PostgreSQL-focused application for learning how multiple database-native search techniques can support day-to-day task retrieval and analytics.',
    problem: 'Work items become difficult to retrieve when task names are inconsistent, misspelled, partially remembered, or buried in notes. The project combines structured task management with several PostgreSQL search strategies.',
    contribution: [
      'Built the Go HTTP backend and PostgreSQL data model.',
      'Implemented full-text, trigram, edit-distance, and phonetic search experiments.',
      'Used generated tsvector data with a GIN index for full-text retrieval.',
      'Built task analytics around status, type, priority, and completion trends.',
      'Connected the backend to a Vue.js interface and Chart.js visualizations.'
    ],
    challenges: [
      'Supporting exact, fuzzy, and phonetic matching without introducing a separate search engine.',
      'Keeping search logic performant while storing operational and analytical data in the same database.',
      'Making search behavior useful for imperfect human input rather than only exact task names.'
    ],
    decisions: [
      'Use PostgreSQL-native search extensions before introducing extra infrastructure.',
      'Use a generated tsvector column so document vectors are maintained with the row rather than rebuilt per query.',
      'Use GIN indexing for full-text search and pg_trgm for fuzzy matching.',
      'Keep analytics close to the transactional data for a small, understandable architecture.'
    ],
    flow: [
      'Users create and update work items through the application.',
      'The Go API persists task data in PostgreSQL.',
      'Search requests can use full-text, trigram, Levenshtein, or phonetic matching approaches.',
      'Analytics queries aggregate the same work-log data by status, type, priority, and timeline.',
      'The Vue UI renders searchable task data and dashboard visualizations.'
    ],
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
      'The schema supports filtering and analytics dimensions such as status, task type, and priority.'
    ],
    limitations: [
      'The project does not claim production traffic levels or distributed deployment.',
      'Search techniques are intentionally kept inside PostgreSQL rather than benchmarked against a dedicated search platform.',
      'The repository is primarily a practical engineering/search exploration rather than a multi-tenant production product.'
    ],
    mermaid: `flowchart LR
      U[User] --> V[Vue.js UI]
      V --> G[Go net/http API]
      G --> P[(PostgreSQL)]
      P --> F[Full-text / GIN]
      P --> T[pg_trgm / Fuzzy Search]
      P --> A[Analytics Queries]
      F --> G
      T --> G
      A --> V`
  },
  {
    slug: 'journeybuilder-lxp',
    title: 'Journeybuilder Learning Experience Platform',
    tag: 'Professional · LXP · Platform Engineering',
    sourceLabel: 'Professional project',
    summary: 'A learning experience platform covering roadmap generation, learning content workflows, collaboration, authentication, analytics, and AI-assisted experiences.',
    stack: ['Node.js', 'Next.js', 'React', 'MongoDB', 'Azure', 'OpenAI integration'],
    context: 'A professional edtech platform where I worked as Lead Developer across backend architecture, integrations, collaboration workflows, delivery practices, and AI-assisted learning capabilities.',
    problem: 'The platform had to support increasingly complex learning journeys, content workflows, collaboration, dashboards, authentication, and AI features while reducing coupling with a larger legacy platform.',
    contribution: [
      'Led engineering work across Journeybuilder backend services, integrations, and production delivery.',
      'Worked on authentication and cross-domain SSO flows across multiple platform surfaces.',
      'Contributed to collaborative Journeybuilder editing features including publishing, versioning, comments, presence, and artifacts.',
      'Delivered or supported product areas including opportunity management, dashboards, instructor workflows, reporting, outline generation, and AI-assisted capabilities.',
      'Drove pull-request quality, CI/CD, release practices, architecture reviews, and team delivery decisions.'
    ],
    challenges: [
      'Separating Journeybuilder domain behavior from a larger existing platform without forcing a risky all-at-once rewrite.',
      'Maintaining authentication and shared platform behavior across multiple domains and services.',
      'Supporting collaborative editing and rich artifact workflows while preserving clear state and version boundaries.',
      'Adding AI-assisted features without making core product behavior dependent on opaque long-running operations.'
    ],
    decisions: [
      'Use gradual service extraction instead of rewriting the entire legacy platform.',
      'Keep shared concerns such as authentication, routing, and existing behavior in the platform layer while moving Journeybuilder-specific logic behind clearer boundaries.',
      'Treat collaboration, publishing state, comments, versioning, and artifacts as first-class domain behaviors.',
      'Keep AI capabilities as supporting workflows around the learning product rather than replacing deterministic platform behavior.'
    ],
    flow: [
      'Users access Journeybuilder through the web application and authenticated platform entry points.',
      'Shared platform services handle authentication, routing, and existing cross-product concerns.',
      'Journeybuilder services handle roadmap, content, collaboration, and domain-specific operations.',
      'AI-assisted workflows are invoked where generation or enrichment is required.',
      'Data and analytics workflows support dashboards, reporting, operational decisions, and learning experiences.'
    ],
    architecture: [
      'Journeybuilder was being extracted from a larger monolithic platform using a gradual service-extraction approach.',
      'The existing platform continued to handle shared concerns such as authentication, routing, logging, and legacy behavior.',
      'Journeybuilder handled domain-specific APIs and roadmap-generation logic.',
      'The product included collaborative editing, versioning, comments, publishing workflows, artifacts, dashboards, and AI-assisted experiences.',
      'The architecture was designed around clearer service boundaries rather than moving every responsibility at once.'
    ],
    scalability: [
      'Separating Journeybuilder domain logic from the monolith reduces coupling and allows that domain to evolve independently.',
      'Stateless application services can be horizontally replicated behind shared routing infrastructure.',
      'Long-running AI, notification, and processing work can be separated from synchronous request handling.',
      'Database indexing, connection management, caching, and logical data separation become the main scaling levers as the domain grows.'
    ],
    limitations: [
      'Public source code is not available for this professional project.',
      'No traffic, user-count, or throughput figures are included because they are not part of the portfolio source material.',
      'The page intentionally describes only responsibilities, architecture, and product capabilities already documented from my work.'
    ],
    mermaid: `flowchart LR
      U[Web / Mobile Clients] --> M[Platform / Gateway]
      M --> S[Shared Auth / Routing]
      M --> J[Journeybuilder Domain Services]
      J --> D[(Domain Data)]
      J --> C[Collaboration / Content / Roadmaps]
      J --> A[AI-assisted Workflows]
      J --> R[Reporting / Dashboards]`
  },
  {
    slug: 'ai-course-generation-pipeline',
    title: 'AI Course Generation Pipeline',
    tag: 'Professional · AI · Distributed Processing',
    sourceLabel: 'Professional project',
    summary: 'An asynchronous document-to-course pipeline designed around parsing, semantic chunking, AI generation, human checkpoints, restartability, and worker-based processing.',
    stack: ['Python', 'FastAPI', 'RabbitMQ', 'MongoDB', 'Azure Blob Storage', 'LangChain', 'PyMuPDF4LLM', 'Chonkie', 'Vector Database'],
    context: 'A professional backend pipeline for turning books and long-form documents into structured learning material while keeping expensive AI/document processing outside the request-response path.',
    problem: 'Document-to-course generation is multi-stage, slow, and failure-prone when treated as one synchronous operation. Parsing, chunking, retrieval, generation, review, and storage need independent state so work can be retried and resumed safely.',
    contribution: [
      'Designed the FastAPI API and separate consumer-worker architecture.',
      'Used RabbitMQ to distribute long-running processing across workers.',
      'Designed document status tracking and restart-from-failure behavior.',
      'Worked with page-aware parsing, semantic chunking, vector retrieval, and AI generation workflows.',
      'Added human-in-the-loop checkpoints for generated outputs such as outlines and scripts.',
      'Designed around Azure Blob Storage, MongoDB, and a vector database for durable processing state and artifacts.'
    ],
    challenges: [
      'Processing large documents without blocking API requests.',
      'Avoiding duplicate ingestion and duplicate work when jobs are retried.',
      'Recovering from failures in the middle of a multi-stage pipeline.',
      'Keeping generated outputs grounded to source material across parsing, chunking, retrieval, and generation stages.',
      'Scaling expensive workers independently from lightweight API traffic.'
    ],
    decisions: [
      'Use RabbitMQ and worker consumers rather than executing the entire pipeline in the API process.',
      'Persist processing state so each document can resume from a known stage after failure.',
      'Store large source files in object storage instead of application-local disk.',
      'Use semantic chunking before downstream generation to preserve document meaning better than arbitrary fixed-length splitting.',
      'Include human checkpoints before committing important generated learning artifacts.'
    ],
    flow: [
      'A document is uploaded and a processing job is created through FastAPI.',
      'The source document is stored in Azure Blob Storage and job state is persisted.',
      'RabbitMQ dispatches work to one of the available consumers.',
      'The worker parses the document into page-aware content and extracts images where required.',
      'Content is semantically chunked and made available to retrieval/generation stages.',
      'AI generation produces structured learning artifacts with human-review checkpoints.',
      'Status is updated after each stage so processing can be monitored and resumed.'
    ],
    architecture: [
      'A FastAPI service accepts and tracks document-processing jobs.',
      'Documents are stored externally while metadata and processing state are tracked separately.',
      'RabbitMQ distributes long-running work to consumer workers.',
      'Documents are parsed into page-aware content and semantically chunked before AI generation.',
      'Human-in-the-loop checkpoints are used for important generated artifacts.',
      'Processing state is designed so failed work can resume instead of restarting the full pipeline.'
    ],
    scalability: [
      'Queue-based processing decouples API request latency from expensive document and AI workloads.',
      'Worker count can be increased independently from the API layer as processing demand grows.',
      'External object storage prevents large document payloads from being coupled to application instances.',
      'Stage-oriented processing and persisted status make retries and restart-from-failure behavior practical.',
      'Duplicate-ingestion prevention and idempotent processing are important safeguards when scaling worker execution.'
    ],
    limitations: [
      'The project depends on external model and retrieval services, so failure handling across dependencies remains important.',
      'Generated content still requires human review at key checkpoints.',
      'No public source code or production throughput numbers are included on this portfolio page.'
    ],
    mermaid: `flowchart LR
      U[User / Client] --> A[FastAPI]
      A --> B[(Blob Storage)]
      A --> M[(MongoDB / Job State)]
      A --> Q[RabbitMQ]
      Q --> W[Consumer Workers]
      W --> P[Parse + Semantic Chunking]
      P --> V[(Vector Store)]
      V --> L[LLM Generation]
      L --> H[Human Checkpoint]
      H --> M`
  },
  {
    slug: 'ai-pr-review-agent',
    title: 'AI Pull Request Review Agent',
    tag: 'Professional · Developer Tooling · Agents',
    sourceLabel: 'Professional project',
    summary: 'A repository-aware pull-request review workflow that combines structured engineering rules, validation prompts, GitHub automation, and agent-based analysis.',
    stack: ['Python', 'FastAPI', 'LangGraph', 'GitHub API', 'GitHub Actions', 'uv'],
    context: 'A developer-tooling initiative for applying consistent repository-specific review standards across multiple pull requests and repositories.',
    problem: 'Manual review becomes difficult when many repositories and parallel PRs need consistent checks. Generic AI review is also too vague unless it understands the repository rules, project architecture, and expected validation criteria.',
    contribution: [
      'Built the review flow around a Python/LangGraph agent.',
      'Adapted review prompts and checklists to the target repository instead of using one generic prompt.',
      'Defined separate review, validation, and grounding concerns for the agent.',
      'Integrated the review workflow with GitHub pull-request context and CI execution.',
      'Worked through GitHub token permissions for reading PRs and writing review-related metadata.'
    ],
    challenges: [
      'Grounding AI findings in the actual repository rather than producing generic style advice.',
      'Separating deterministic CI failures from subjective or architectural review findings.',
      'Handling repository permissions securely when the workflow needs to read PR content or publish results.',
      'Making the same orchestration reusable while allowing repository-specific rules.'
    ],
    decisions: [
      'Run the agent from GitHub Actions so review does not depend on a developer workstation.',
      'Keep repository-specific checklists and prompts explicit and versioned with the engineering workflow.',
      'Use LangGraph to structure review stages instead of one large prompt invocation.',
      'Treat AI review as complementary to lint, unit tests, integration tests, build checks, and security scanning rather than a replacement for them.'
    ],
    flow: [
      'A developer opens or updates a pull request.',
      'GitHub Actions triggers the review workflow.',
      'The workflow loads pull-request context and repository-specific review rules.',
      'The LangGraph review agent evaluates the change against the checklist and grounding constraints.',
      'Structured findings are produced for the pull request.',
      'Deterministic CI checks remain separate and can run alongside the AI review.'
    ],
    architecture: [
      'GitHub pull-request events trigger CI automation.',
      'The workflow invokes a Python-based review agent from the engineering codebase.',
      'LangGraph coordinates repository-aware review steps and structured validation prompts.',
      'The review logic uses project-specific checklists, grounding rules, and validation criteria.',
      'GitHub APIs and CLI-compatible workflows are used to read pull-request context and publish review results.'
    ],
    scalability: [
      'CI-triggered execution allows reviews to run independently for separate pull requests.',
      'Project-specific configuration separates reusable review orchestration from repository-specific policy.',
      'Running review work in CI avoids depending on a developer workstation being online.',
      'The system can combine AI review with deterministic lint, test, build, and security stages.'
    ],
    limitations: [
      'GitHub API permissions and token scopes are operational constraints.',
      'AI findings must be grounded and reviewed; they are not treated as automatically correct.',
      'No public production metrics or source code are included on this portfolio page.'
    ],
    mermaid: `flowchart LR
      D[Developer] --> PR[GitHub Pull Request]
      PR --> GA[GitHub Actions]
      GA --> CI[Lint / Tests / Build / Security]
      GA --> R[Python / LangGraph Review Agent]
      R --> C[Project Review Checklist]
      R --> G[Repository + PR Context]
      C --> R
      G --> R
      R --> O[Grounded Review Findings]
      O --> PR`
  },
  {
    slug: 'script-review-system',
    title: 'Structured Script Review System',
    tag: 'Professional · Content Quality · AI',
    sourceLabel: 'Professional project',
    summary: 'A structured content-review pipeline that converts scripts into typed blocks and evaluates them against configurable review rules and guidelines.',
    stack: ['Python', 'Document Parsing', 'Structured Blocks', 'Semantic Chunking', 'Rule Execution', 'TipTap'],
    context: 'A content-quality system designed to review complex scripts against configurable rules without treating the entire document as undifferentiated text.',
    problem: 'Long production scripts contain headings, scenes, dialogue, visual instructions, on-screen text, notes, and tables. Review quality suffers when every rule is applied to every piece of text without understanding those structural differences.',
    contribution: [
      'Designed the document-processing pipeline from DOCX parsing through normalized structured blocks.',
      'Defined typed content such as heading, scene, dialogue, visual, on-screen text, note, and table row.',
      'Designed scene, speaker, and visual-cue detection before rule execution.',
      'Separated configurable rule execution from document parsing.',
      'Worked toward an editor workflow where reviewed content can be corrected and submitted again.'
    ],
    challenges: [
      'Preserving document meaning when converting rich source documents into machine-readable structures.',
      'Applying only relevant rules to the content types they actually concern.',
      'Handling long documents without sending the whole script through every analysis step.',
      'Keeping review output actionable enough for a human editor to correct the source.'
    ],
    decisions: [
      'Normalize the source into typed blocks before doing semantic or rule-based analysis.',
      'Use an applies-to style rule model so checks can target only relevant block types.',
      'Use token-aware chunking only where larger context windows are needed.',
      'Keep rule execution independent from retrieval when the required context already exists in the parsed script.',
      'Use structured editor data to preserve content semantics through review and revision.'
    ],
    flow: [
      'A DOCX or structured script is ingested.',
      'Document blocks are parsed and normalized into known content types.',
      'Scenes, speakers, visual cues, and related structure are identified.',
      'Long analysis units are semantically and token-aware chunked where necessary.',
      'Configured rules run only against applicable content.',
      'Scores and recommended fixes are returned to the editing workflow.',
      'The revised script can be submitted again for another review cycle.'
    ],
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
      'A structured intermediate representation makes it easier to add new rule types without redesigning ingestion.'
    ],
    limitations: [
      'Document parsing quality depends on the consistency of the source document structure.',
      'Some content-quality judgments still require AI or human interpretation rather than deterministic checks alone.',
      'No production volume or throughput figures are included because those metrics are not part of the portfolio source material.'
    ],
    mermaid: `flowchart LR
      D[DOCX / Script] --> P[Parse Document Blocks]
      P --> N[Normalize Typed Blocks]
      N --> S[Detect Scenes / Speakers / Visuals]
      S --> C[Semantic + Token-aware Chunks]
      C --> R[Configurable Rule Execution]
      R --> F[Scores + Recommended Fixes]
      F --> E[Structured Editor]
      E --> D`
  }
] as const;

export type Project = (typeof projects)[number];
