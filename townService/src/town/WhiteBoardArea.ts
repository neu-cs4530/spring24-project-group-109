import Player from '../lib/Player';
import { Interactable, InteractableCommand, InteractableCommandReturnType } from '../types/CoveyTownSocket';
import InteractableArea from './InteractableArea';
import { Color } from '../types/CoveyTownSocket';
// define in types; Export type Color = `#${string}`;

const WHITEBOARD_HEIGHT = 10;
const WHITEBOARD_WIDTH= 10;

export default class WhiteBoardArea extends InteractableArea {  
    public constructor() {
        super();
    }

}

private _getBoard(): Color[][] {
    const board: Color[][] = [];
    for (let i = 0; i < WHITEBOARD_HEIGHT; i += 1) {
      const row: Color[] = [];
      for (let j = 0; j < WHITEBOARD_WIDTH; j += 1) {
            row.push(`#${'FFFFFF'}`);
      }
      board.push(row);
    }
    return board;
  }


