export const COLORS = {
  bg: '#F5F1E8',
  surface: '#FBF8F1',
  surfaceAlt: '#EDE7D8',
  line: '#D9D1BD',
  lineSoft: '#E5DEC9',
  ink: '#0E1F36',
  inkSoft: '#3A4861',
  muted: '#6B7488',
  mutedSoft: '#8C93A4',
  accent: '#244B6B',
  amber: '#B6841F',
  green: '#2F6B4A',
  crimson: '#9B3B2E',
} as const

export const TYPE_SCALE = [10, 10.5, 11, 11.5, 12, 13, 13.5, 14, 16, 18, 20, 24, 28, 32] as const

export const TOPICS = [
  { id: 'geopol', label: 'Geopolitics' },
  { id: 'climate', label: 'Climate' },
  { id: 'econ', label: 'Economics' },
  { id: 'health', label: 'Public Health' },
  { id: 'science', label: 'Science' },
  { id: 'elect', label: 'Elections' },
  { id: 'tech', label: 'Technology' },
  { id: 'energy', label: 'Energy' },
] as const

export type TopicId = (typeof TOPICS)[number]['id']

export const topicById = (id: string) => TOPICS.find((t) => t.id === id)
