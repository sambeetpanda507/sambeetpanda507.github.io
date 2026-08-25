export interface Experience {
  role: string;
  company: string;
  period: string;
  summary: string;
  highlights: string[];
}

export const experience: Experience[] = [
  {
    role: 'Lead Developer',
    company: 'Starweaver',
    period: 'Current',
    summary: 'Leading product engineering across backend services, developer workflows, AI-enabled features, and production delivery.',
    highlights: [
      'Design and review production APIs, backend workflows, and system integrations.',
      'Drive CI/CD, pull-request quality, release practices, and engineering automation.',
      'Build AI-assisted product capabilities and document-processing workflows.',
      'Support engineers through architecture decisions, code review, and delivery planning.',
    ],
  },
];
