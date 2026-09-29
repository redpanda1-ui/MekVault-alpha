export type ColorSymbol = 'W' | 'U' | 'B' | 'R' | 'G';

export interface ScryfallCard {
  id: string;
  name: string;
  manaCost?: string;
  typeLine: string;
  oracleText?: string;
  set: string;
  setName: string;
  collectorNumber: string;
  imageUrl?: string;
  usdPrice?: string;
  colorIdentity: ColorSymbol[];
  commanderLegality: 'legal' | 'not_legal' | 'restricted' | 'banned';
}
export interface CollectionEntry { card: ScryfallCard; quantity: number; }
export interface DeckCardEntry { card: ScryfallCard; quantity: number; }
export interface Deck { id: string; name: string; commander?: ScryfallCard; cards: DeckCardEntry[]; createdAt: string; updatedAt: string; }
export interface ValidationIssue { severity: 'error' | 'warning'; message: string; cardName?: string; }
export interface DeckValidation { totalCards: number; isComplete: boolean; isValid: boolean; issues: ValidationIssue[]; }
export interface CoachRecommendation {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  suggestedCuts: Array<{ name: string; reason: string }>;
  suggestedAdds: Array<{ name: string; reason: string; validated: boolean }>;
  strategy: string[];
  warnings: string[];
  needsReview: boolean;
}
