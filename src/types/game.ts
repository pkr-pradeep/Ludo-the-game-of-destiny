/**
 * Type definitions for Ludo: The Game of Destiny
 * Rooted in Odisha's heritage (Konark, Kalinga, Nilachala) and Mahabharata lore.
 */

export type PlayerColor = 'red' | 'green' | 'yellow' | 'blue';

export interface PlayerFaction {
  id: PlayerColor;
  name: string;
  epicTitle: string;
  shortName: string;
  bgHex: string;
  accentHex: string;
  borderHex: string;
  glowHex: string;
  sanctuaryName: string;
  sigil: string; // Vedic / Odisha cultural sigil description
}

export interface BoardCoordinate {
  row: number; // 0-14
  col: number; // 0-14
}

export type TokenStatus = 'yard' | 'track' | 'home_column' | 'finished';

export interface Token {
  id: number; // 0, 1, 2, 3
  color: PlayerColor;
  status: TokenStatus;
  stepCount: number; // -1 for yard, 0..50 on track, 51..56 in home straight (56 = finished)
  boardPosition?: BoardCoordinate; // Current cell on 15x15 grid
}

export interface Player {
  color: PlayerColor;
  name: string;
  isAi: boolean;
  tokens: Token[];
  tokensFinished: number;
  hasFinished: boolean;
  rank?: number; // 1st, 2nd, 3rd, 4th
}

export interface MoveOption {
  tokenId: number;
  fromStep: number;
  toStep: number;
  isBaseExit?: boolean;
  willCapture: boolean;
  capturedColor?: PlayerColor;
  capturedTokenId?: number;
  willFinish: boolean;
}

export type GameStage = 'HOME' | 'SETUP' | 'PLAYING' | 'VICTORY';

export interface GameLogEntry {
  id: string;
  timestamp: string;
  text: string;
  color?: PlayerColor;
  type: 'roll' | 'move' | 'capture' | 'finish' | 'turn' | 'info';
}
