export interface City {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  currency: string;
  currencySymbol: string;
  language: string;
  timezone: string;
  center: [number, number];
  zoom: number;
  coverage: CoverageLevel;
  providers: string[];
}

export type CoverageLevel = 'complete' | 'partial' | 'walking-only' | 'none';

export interface RouteOption {
  id: string;
  type: 'cheapest' | 'fastest' | 'less-walking' | 'less-transfers' | 'simplest';
  label: string;
  emoji: string;
  totalCost: number;
  currency: string;
  duration: number; // minutes
  walkingDistance: number; // meters
  transfers: number;
  steps: RouteStep[];
  dataQuality: 'real-time' | 'scheduled' | 'estimated' | 'approximate';
  confidence: number; // 0-100
}

export interface RouteStep {
  id: string;
  type: 'walk' | 'bus' | 'metro' | 'train' | 'brt' | 'tram' | 'collectivo';
  instruction: string;
  duration: number; // minutes
  distance?: number; // meters
  lineName?: string;
  lineColor?: string;
  direction?: string;
  fromStop?: string;
  toStop?: string;
  fromCoords?: [number, number];
  toCoords?: [number, number];
  fare?: number;
  fareNote?: string;
  pathCoords?: [number, number][];
}

export interface SearchResult {
  id: string;
  name: string;
  address: string;
  type: 'tourist' | 'transport' | 'hotel' | 'restaurant' | 'landmark' | 'address';
  coords: [number, number];
  icon: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export type AppView = 'home' | 'search' | 'results' | 'route-detail' | 'navigation' | 'assistant' | 'settings';
