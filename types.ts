export enum AppState {
  IDLE = 'IDLE',
  GENERATING_WISH = 'GENERATING_WISH',
  VIEWING_WISH = 'VIEWING_WISH'
}

export enum TreeMode {
  SCATTERED = 'SCATTERED',
  ASSEMBLED = 'ASSEMBLED'
}

export interface WishRequest {
  recipientName: string;
  relationship: string;
  tone: 'Professional' | 'Romantic' | 'Family' | 'Witty';
}

export interface ParticleData {
  position: [number, number, number];
  speed: number;
  offset: number;
}