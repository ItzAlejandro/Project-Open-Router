import { GamePlay } from "./GamePlay.inteface";
import { Model } from "./Model.Interface";

export interface Response{
  message:string,
  model:Model
  partida?:GamePlay
}


export interface ResponseUnique{
  success: boolean;
  message: string;
  model: string;
}

