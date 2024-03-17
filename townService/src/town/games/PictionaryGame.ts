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
import { easyWords, mediumWords, hardWords } from './PictionaryDictionary';

function getOtherTeamLetter(letter: PictionaryTeamLetter): PictionaryTeamLetter {
  return letter === 'A' ? 'B' : 'A';
}

/**
 * A Pictionary game is a Game that implements the rules of team Pictionary.
 * @see https://en.wikipedia.org/wiki/Pictionary
 */
export default class PictionaryGame extends Game<PictionaryGameState, PictionaryMove> {
  private wordList: string[];

  public constructor() {
    super({
      drawer: undefined,
      guesser: undefined,
      word: undefined,
      difficulty: 'Easy', // Default difficulty
      teamA: { letter: 'A', players: [], score: 0 },
      teamB: { letter: 'B', players: [], score: 0 },
      teamAReady: false,
      teamBReady: false,
      usedWords: [],
      timer: 60, // seconds
      round: 0,
      status: 'WAITING_FOR_PLAYERS',
    });
    this.wordList = easyWords;
  }

  /**
   * Applies a player's move (guess) to the game.
   * Updates the game's state to reflect the move (guess) based on if it was correct or incorrect.
   * - If it was correct, updates the game's state to increment the score of the team that guessed correctly. It adds the word to the useWords list and chooses a new word.
   * - If it was incorrect, do nothing.
   * @param move The move to apply to the game
   * @throws InvalidParametersError if the game is not in progress (GAME_NOT_IN_PROGRESS_MESSAGE)
   * @throws InvalidParameterError if the player is not in the game (PLAYER_NOT_IN_GAME_MESSAGE)
   * @throws MoveNotYourTurnError if the player is not the guesser (MOVE_NOT_YOUR_TURN_MESSAGE)
   */
  public applyMove(move: GameMove<PictionaryMove>): void {
    const guess: PictionaryMove = move.move;
    if (this.state.status !== 'IN_PROGRESS') {
      throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
    }
    if (move.playerID !== this.state.guesser) {
      throw new InvalidParametersError(MOVE_NOT_YOUR_TURN_MESSAGE);
    }
    if (
      !this.state.teamA.players.includes(move.playerID) &&
      !this.state.teamB.players.includes(move.playerID)
    ) {
      throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
    }
    // correct guess case
    if (guess.guess.toLowerCase() === this.state.word?.toLowerCase()) {
      const team = this.state.drawer ? this.state.teamA : this.state.teamB;
      this.state = {
        ...this.state,
        status: 'IN_PROGRESS',
        [team.letter]: { ...team, score: team.score + 1 },
        usedWords: [...this.state.usedWords, this.state.word],
        word: this._chooseWord(),
      };
    }
  }

  /**
   * Choose a word from the word list based on the difficulty. Check to make sure that word is not already in the usedWords list. If it is, choose another word.
   */
  private _chooseWord(): string {
    let word = '';
    while (word === '' || this.state.usedWords.includes(word)) {
      const randomIndex = Math.floor(Math.random() * this.wordList.length);
      word = this.wordList[randomIndex];
    }
    return word;
  }

  // start game
  // const { difficulty } = this.state;
  //   // get a random word from the PictionaryDictionary array based on the difficulty
  //   let wordList = undefined;
  //   if (difficulty === 'Medium') {
  //     wordList = mediumWords;
  //   } else if (difficulty === 'Hard') {
  //     wordList = hardWords;
  //   } else {
  //     wordList = easyWords;
  //   }

  /**
   * Adds a player to the game, first adding to team A until full (2) and then to team B (2).
   * Updates the game's state to reflect the new player.
   * If the game is now full (i.e. both teams have 2 players), updates the game's state to set the status to IN_PROGRESS.
   * @param player The player to join the game
   * @throws InvalidParametersError if the player is already in the game (PLAYER_ALREADY_IN_GAME_MESSAGE)
   *  or the game is full (GAME_FULL_MESSAGE)
   */
  protected _join(player: Player): void {
    const { teamA, teamB } = this.state;
    const teamAPlayers = teamA?.players ?? [];
    const teamBPlayers = teamB?.players ?? [];

    if (teamAPlayers.includes(player.id) || teamBPlayers.includes(player.id)) {
      throw new InvalidParametersError(PLAYER_ALREADY_IN_GAME_MESSAGE);
    }
    if (teamAPlayers.length < 2) {
      this.state = {
        ...this.state,
        teamA: { ...teamA, players: [...teamAPlayers, player.id] },
      };
    } else if (teamBPlayers.length < 2) {
      this.state = {
        ...this.state,
        teamB: { ...teamB, players: [...teamBPlayers, player.id] },
      };
    } else {
      throw new InvalidParametersError(GAME_FULL_MESSAGE);
    }

    if (teamAPlayers.length === 2 && teamBPlayers.length === 2) {
      this.state = {
        ...this.state,
        status: 'IN_PROGRESS',
      };
    }
  }

  /**
   * Removes a player from the game.
   * Updates the game's state to reflect the player leaving.
   * If the game has two full teams (4 players total) in it at the time of call to this method,
   *   updates the game's status to OVER and sets the winner to the other team.
   * If the game does not yet have two full teams (4 players total) in it at the time of call to this method,
   *   updates the game's status to WAITING_TO_START.
   *
   * @param player The player to remove from the game
   * @throws InvalidParametersError if the player is not in the game (PLAYER_NOT_IN_GAME_MESSAGE)
   */
  protected _leave(player: Player): void {
    const { teamA, teamB } = this.state;
    const teamAPlayers = teamA?.players ?? [];
    const teamBPlayers = teamB?.players ?? [];

    if (!teamAPlayers.includes(player.id) && !teamBPlayers.includes(player.id)) {
      throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
    }

    if (!(teamAPlayers.length === 2) && !(teamBPlayers.length === 2)) {
      this.state = {
        ...this.state,
        status: 'WAITING_FOR_PLAYERS',
      };
    }

    if (teamAPlayers.length === 2 && teamBPlayers.length === 2) {
      if (teamAPlayers.includes(player.id)) {
        this.state = {
          ...this.state,
          status: 'OVER',
          winner: 'B',
        };
      } else {
        this.state = {
          ...this.state,
          status: 'OVER',
          winner: 'A',
        };
      }
    }

    // removes leaving player from team
    if (teamAPlayers.includes(player.id)) {
      this.state = {
        ...this.state,
        teamA: { ...teamA, players: teamAPlayers.filter(p => p !== player.id) },
      };
    } else {
      this.state = {
        ...this.state,
        teamB: { ...teamB, players: teamBPlayers.filter(p => p !== player.id) },
      };
    }
  }
}
