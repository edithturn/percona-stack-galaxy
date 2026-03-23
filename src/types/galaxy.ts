export type Category = "database" | "operator" | "observability" | "tools";
export type EdgeType = "monitors" | "manages" | "toolsFor" | "accelerates";
export type ReleaseTag = "security" | "breaking" | "feature" | "fix";
export type TimeWindow = "30d" | "90d" | "1y" | "all";

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface Release {
  version: string;
  date: string;
  url: string;
  docsUrl: string;
  tags: ReleaseTag[];
  highlights: string[];
  notesSnippet: string;
}

export interface BlogPost {
  title: string;
  url: string;
  date: string; // ISO date string
  author: string;
}

export interface VitalSigns {
  stars: number;
  forks: number;
  openIssues: number;
  openPRs: number;
  lastCommit: string; // ISO date string
}

export interface Product {
  id: string;
  name: string;
  shortName: string;
  category: Category;
  description: string;
  docsUrl: string;
  forumUrl: string;
  repoUrl: string;
  position: Position;
  releases: Release[];
  vitals: VitalSigns | null;
  blogPosts: BlogPost[];
}

export interface Edge {
  from: string;
  to: string;
  type: EdgeType;
  label: string;
}

export interface GalaxyData {
  generatedAt: string;
  products: Product[];
  edges: Edge[];
}

export interface FilterState {
  timeWindow: TimeWindow;
  activeTags: ReleaseTag[];
  activeCategories: Category[];
}
