export type BlogSection = {
  heading?: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type BlogPost = {
  slug: string;
  title: string;
  summary: string;
  sourceLabel: string;
  sourceUrl: string;
  tags: string[];
  sections: BlogSection[];
};

export const blogs: BlogPost[] = [
  {
    slug: 'building-hybrid-search-systems',
    title: 'Building Hybrid Search Systems with Semantic & Lexical Approaches',
    summary: 'What I learned while combining vector similarity, lexical relevance, HNSW indexing, local embeddings, and a service-oriented architecture.',
    sourceLabel: 'Originally published on LinkedIn',
    sourceUrl: 'https://www.linkedin.com/posts/sambeetsekharpanda_github-sambeetpanda507hybrid-search-activity-7445285467593486336-R142',
    tags: ['Go', 'PostgreSQL', 'pgvector', 'BM25', 'Search'],
    sections: [
      {
        paragraphs: [
          'I built a microservices-based hybrid search setup using Go, PostgreSQL with pgvector and BM25, and Ollama for local embedding generation.',
          'The project reinforced a useful lesson: semantic and lexical search solve different parts of the relevance problem. Semantic retrieval understands meaning and context, but it can sometimes return results that feel too broad. Lexical search is precise when the wording matters, but it can miss relevant documents that express the same idea differently.'
        ]
      },
      {
        heading: 'Why hybrid search',
        paragraphs: [
          'Combining the two approaches gives the search system more signals to work with. Vector similarity can surface conceptually related content, while lexical scoring keeps exact terms and keyword relevance in the picture.'
        ],
        bullets: [
          'Semantic search improves contextual matching.',
          'Lexical search preserves precision around terms and phrases.',
          'Hybrid ranking can balance both signals for stronger real-world relevance.'
        ]
      },
      {
        heading: 'Architecture experiments',
        paragraphs: [
          'I also experimented with HNSW indexing for faster vector retrieval, local embeddings, and separating broker and search responsibilities into services. The build was less about hiding search behind a managed product and more about understanding the pieces that make retrieval work.'
        ]
      }
    ]
  },
  {
    slug: 'go-postgresql-hybrid-search-pgvector',
    title: 'Go + PostgreSQL Hybrid Search Service with pgvector',
    summary: 'A small Go service for learning semantic, lexical, and fuzzy retrieval directly on PostgreSQL instead of treating search as a black box.',
    sourceLabel: 'Originally published on LinkedIn',
    sourceUrl: 'https://www.linkedin.com/posts/sambeetsekharpanda_github-sambeetpanda507go-pgsql-search-activity-7426282393159892992-NpZt',
    tags: ['Go', 'PostgreSQL', 'pgvector', 'GORM', 'Embeddings'],
    sections: [
      {
        paragraphs: [
          'I built a Go web service that loads news data into PostgreSQL and makes it searchable through a mix of vector embeddings, full-text search, and string similarity.',
          'The goal was straightforward: understand how semantic search works under the hood without immediately reaching for a managed vector database.'
        ]
      },
      {
        heading: 'What the service does',
        bullets: [
          'Imports news data from CSV.',
          'Generates embeddings through a local embedding service.',
          'Stores vectors in PostgreSQL with pgvector.',
          'Exposes HTTP APIs for semantic search.',
          'Runs database migrations when the service starts.',
          'Supports lexical retrieval with tsvector and tsquery.',
          'Uses Levenshtein distance as an additional similarity signal.'
        ]
      },
      {
        heading: 'Stack',
        paragraphs: [
          'The implementation uses Go, PostgreSQL, pgvector, GORM, and a local all-MiniLM embedding service. Keeping the components local made it easier to inspect the complete retrieval path from ingestion to ranking.'
        ]
      }
    ]
  },
  {
    slug: 'worker-pool-go-controlled-concurrency',
    title: 'Worker Pool in Go: Controlled Concurrency',
    summary: 'Why a fixed number of workers is often safer than spawning unbounded goroutines for every incoming task.',
    sourceLabel: 'Originally published on LinkedIn',
    sourceUrl: 'https://www.linkedin.com/posts/sambeetsekharpanda_golang-backendengineering-concurrency-activity-7460021329413578752-Zhfo',
    tags: ['Go', 'Concurrency', 'Backend Engineering'],
    sections: [
      {
        paragraphs: [
          'Go makes concurrency easy enough that it can be tempting to create a goroutine for every unit of work. The problem is that downstream resources are still finite.',
          'A worker pool gives the system a deliberate concurrency limit. A fixed set of workers consumes jobs from a queue, which prevents bursts of work from turning directly into bursts of database connections, API calls, memory usage, or CPU pressure.'
        ]
      },
      {
        heading: 'What controlled concurrency gives you',
        bullets: [
          'A clear upper bound on concurrent work.',
          'Protection for databases and external APIs.',
          'More predictable resource usage.',
          'Stable throughput when load increases.'
        ]
      },
      {
        heading: 'The core idea',
        paragraphs: [
          'Concurrency is useful when it is intentional. The worker-pool pattern turns concurrency from an unlimited implementation detail into a capacity decision you can reason about, test, and tune.'
        ]
      }
    ]
  },
  {
    slug: 'how-hls-video-streaming-works',
    title: 'How HLS Video Streaming Works Behind the Scenes',
    summary: 'A practical mental model for video chunks, m3u8 playlists, adaptive delivery, live playback, and CDN-friendly streaming.',
    sourceLabel: 'Originally published on LinkedIn',
    sourceUrl: 'https://www.linkedin.com/posts/sambeetsekharpanda_hls-streaming-videoengineering-activity-7461439747110977536-5Jae',
    tags: ['HLS', 'Video Streaming', 'System Design', 'CDN'],
    sections: [
      {
        paragraphs: [
          'With HLS, a player usually does not wait for one large video file to download. The media is split into small transport-stream chunks and a playlist tells the player which chunks to request and in what order.',
          'That simple separation between media segments and a manifest is what gives an HLS player room to adapt playback as network conditions change.'
        ]
      },
      {
        heading: 'The two pieces',
        bullets: [
          '.ts segments carry small pieces of audio and video, commonly only a few seconds long.',
          '.m3u8 playlists describe the segment order and include metadata such as duration, sequence information, and URLs.',
          'For live streams, the playlist can keep changing as new media segments become available.'
        ]
      },
      {
        heading: 'The flow',
        paragraphs: [
          'A useful simplified path is: encoder → media chunks → playlist → HLS player. With multiple renditions and CDN delivery around that flow, the same architecture supports adaptive bitrate playback, seeking, live streaming, and distribution at scale.'
        ]
      }
    ]
  },
  {
    slug: 'work-log-advanced-search-analytics',
    title: 'Work Log System with Advanced Search and Analytics',
    summary: 'Building a work-log application around PostgreSQL trigram search, full-text ranking, Go APIs, Vue, and an analytics dashboard.',
    sourceLabel: 'Originally published on LinkedIn',
    sourceUrl: 'https://www.linkedin.com/posts/sambeetsekharpanda_worklogreadmemd-at-main-sambeetpanda507-activity-7333372759265214464-X0Zl',
    tags: ['Go', 'PostgreSQL', 'Full-text Search', 'Vue', 'Analytics'],
    sections: [
      {
        paragraphs: [
          'I built a work-log management system while exploring database search algorithms and PostgreSQL search capabilities. The application combines fuzzy text matching, full-text retrieval, and an analytics interface for understanding work over time.'
        ]
      },
      {
        heading: 'Search',
        bullets: [
          'PostgreSQL pg_trgm for flexible fuzzy matching.',
          'Full-text search with lexemes and relevance ranking.',
          'Generated tsvector data to make full-text queries efficient.'
        ]
      },
      {
        heading: 'Analytics',
        bullets: [
          'Task completion trends over time.',
          'Status-distribution visualizations.',
          'Work-type breakdowns across tasks, bugs, and stories.',
          'Priority-oriented insights.'
        ]
      },
      {
        heading: 'What made it interesting',
        paragraphs: [
          'The most interesting part was combining trigram matching with lexeme-based full-text search. They behave differently, and using both made the project a practical exercise in relevance, fuzzy matching, and database-native search rather than just CRUD.'
        ]
      }
    ]
  }
];

export const getBlogBySlug = (slug: string) => blogs.find((post) => post.slug === slug);
