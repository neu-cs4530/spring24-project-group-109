import InvalidParametersError, {
  GAME_FULL_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  GAME_NOT_STARTABLE_MESSAGE,
  MOVE_NOT_YOUR_TURN_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import {
  GameMove,
  PlayerID,
  PictionaryTeamLetter,
  PictionaryWordDifficulty,
  PictionaryTeam,
  PictionaryGameState,
  PictionaryMove,
} from '../../types/CoveyTownSocket';
import Game from './Game';

function getOtherTeamLetter(team: PictionaryTeamLetter): PictionaryTeamLetter {
  return team === 'A' ? 'B' : 'A';
}

/**
 * A Pictionary game is a Game that implements the rules of team Pictionary.
 * @see https://en.wikipedia.org/wiki/Pictionary
 */
export default class PictionaryGame extends Game<PictionaryGameState, PictionaryMove> {
  public constructor() {
    super({
      drawer: undefined,
      word: undefined,
      difficulty: 'Easy', // Default difficulty
      teamA: { team: 'A', players: [], score: 0 },
      teamB: { team: 'B', players: [], score: 0 },
      teamAReady: false,
      teamBReady: false,
      usedWords: [],
      timer: 60, // seconds
      round: 0,
      status: 'WAITING_FOR_PLAYERS',
    });
  }

  public applyMove(move: GameMove<PictionaryMove>): void {}

  protected _join(player: Player): void {}

  protected _leave(player: Player): void {}
}
