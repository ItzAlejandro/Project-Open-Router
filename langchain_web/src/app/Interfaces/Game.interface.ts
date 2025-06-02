export interface Game {
  id? : string,
  name: string;
  description: string;
  rulesheet: string;
  players: number;
  editable: boolean;
}
