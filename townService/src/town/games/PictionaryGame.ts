import InvalidParametersError, {
  GAME_FULL_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  MOVE_NOT_YOUR_TURN_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
  GAME_NOT_STARTABLE_MESSAGE,
} from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import {
  GameMove,
  PictionaryGameState,
  PictionaryMove,
  PictionaryWordDifficulty,
} from '../../types/CoveyTownSocket';
import WhiteBoardArea from '../WhiteBoardArea';
import Game from './Game';
import { EASY_WORDS, MEDIUM_WORDS, HARD_WORDS } from './PictionaryDictionary';

const ROUND_TIME = 60; // seconds

/**
 * A Pictionary game is a Game that implements the rules of team Pictionary.
 * @see https://en.wikipedia.org/wiki/Pictionary
 */
export default class PictionaryGame extends Game<PictionaryGameState, PictionaryMove> {
  private _wordList: string[];

  public constructor() {
    super({
      drawer: undefined,
      guesser: undefined,
      word: undefined,
      difficulty: 'No difficulty',
      teamA: { letter: 'A', players: [], score: 0 },
      teamB: { letter: 'B', players: [], score: 0 },
      teamAReady: false,
      teamBReady: false,
      usedWords: [],
      timer: ROUND_TIME, // seconds
      round: 0,
      status: 'WAITING_FOR_PLAYERS',
      board: new WhiteBoardArea(),
      guess: undefined,
    });
    this._wordList = EASY_WORDS;
  }

  private _assignNewRoles(): void {
    const team = this.state.round % 2 === 0 ? this.state.teamA : this.state.teamB;
    if (this.state.round <= 1) {
      this.state = {
        ...this.state,
        drawer: team.players[0],
        guesser: team.players[1],
      };
    }
    if (this.state.round > 1) {
      this.state = {
        ...this.state,
        drawer: team.players[1],
        guesser: team.players[0],
      };
    }
  }

  /**
   * Updates the round clock to count done. Meant to be called once a second.
   * @throws InvalidParametersError if the game is not full (GAME_NOT_STARTABLE_MESSAGE)
   */
  public tickDown(): void {
    if (this.state.round === 4) {
      this.state = { ...this.state, status: 'OVER' };
    } else if (this.state.status === 'IN_PROGRESS') {
      if (this.state.timer > 0) {
        this.state = { ...this.state, timer: this.state.timer - 1 };
      } else if (this.state.timer === 0) {
        this.state = { ...this.state, timer: ROUND_TIME, round: this.state.round + 1 };
        this._assignNewRoles();
      }
    }
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
    this.state.guess = guess.guess;
    if (this.state.status !== 'IN_PROGRESS') {
      throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
    }
    if (
      !this.state.teamA.players.includes(move.playerID) &&
      !this.state.teamB.players.includes(move.playerID)
    ) {
      throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
    }
    if (move.playerID !== this.state.guesser) {
      throw new InvalidParametersError(MOVE_NOT_YOUR_TURN_MESSAGE);
    }
    // correct guess case
    if (this.state.guess.toLowerCase() === this.state.word?.toLowerCase()) {
      const team = this.state.drawer ? this.state.teamA : this.state.teamB;
      if (team === this.state.teamA) {
        this.state = {
          ...this.state,
          status: 'IN_PROGRESS',
          teamA: { ...team, score: team.score + 1 },
          usedWords: [...this.state.usedWords, this.state.word],
          word: this._chooseWord(),
        };
      } else {
        this.state = {
          ...this.state,
          status: 'IN_PROGRESS',
          teamB: { ...team, score: team.score + 1 },
          usedWords: [...this.state.usedWords, this.state.word],
          word: this._chooseWord(),
        };
      }
    }
  }

  /**
   * Chooses a word for the drawer to draw from the appropriate list in the PictionaryDictionary based on the difficulty of the game.
   */
  private _chooseWord(): string {
    let word = '';
    while (word === '' || this.state.usedWords.includes(word)) {
      const randomIndex = Math.floor(Math.random() * this._wordList.length);
      word = this._wordList[randomIndex];
    }
    return word;
  }

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
    if (this.state.teamA.players.length === 2 && this.state.teamB.players.length === 2) {
      this.state = {
        ...this.state,
        status: 'WAITING_TO_START',
      };
    }
  }

  /**
   * Starts the game with the given difficulty.
   * Updates the game's state to reflect the new game.
   * @param difficulty The difficulty of the game
   */
  public startGame(difficulty: PictionaryWordDifficulty): void {
    // get a random word from the PictionaryDictionary array based on the difficulty
    if (this.state.status !== 'WAITING_TO_START') {
      throw new InvalidParametersError(GAME_NOT_STARTABLE_MESSAGE);
    }
    if (difficulty === 'Easy') {
      this._wordList = EASY_WORDS;
    } else if (difficulty === 'Medium') {
      this._wordList = MEDIUM_WORDS;
    } else if (difficulty === 'Hard') {
      this._wordList = HARD_WORDS;
    }
    this._assignNewRoles();
    this.state = {
      ...this.state,
      status: 'IN_PROGRESS',
      difficulty,
      word: this._chooseWord(),
    };
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
