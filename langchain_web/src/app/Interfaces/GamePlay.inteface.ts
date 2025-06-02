import { Game } from "./Game.interface";

export interface GamePlay {
  _id?:string;
  codeUnique: string;
  apikey: string;
  apiKeyOpenAi: string;
  ia1: string;
  ia2: string;
  juego: string;
  prompt: string;
  ganador?: string;
  fecha: string;
  gameType: string;
  numberGames: number;
}
