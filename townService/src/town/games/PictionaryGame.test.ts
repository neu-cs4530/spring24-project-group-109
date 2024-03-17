import { createPlayerForTesting } from '../../TestUtils';
import {
  GAME_FULL_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  BOARD_POSITION_NOT_EMPTY_MESSAGE,
  MOVE_NOT_YOUR_TURN_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';
import PictionaryGame from './TicTacToeGame';
import Player from '../../lib/Player';
import { PictionaryMove } from '../../types/CoveyTownSocket';

describe('PictionaryGame', () => {
    let game: PictionaryGame;
  
    beforeEach(() => {
      game = new PictionaryGame();
    });

    describe('_leave', () => {
        it('should throw an error if the player is not in the game', () => {
          expect(() => game.leave(createPlayerForTesting())).toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
          // TODO weaker test suite only does one of these - above or below
          const player = createPlayerForTesting();
          game.join(player);
          expect(() => game.leave(createPlayerForTesting())).toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
        });
    });
  });
  