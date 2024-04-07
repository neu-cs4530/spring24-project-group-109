import InvalidParametersError, {
  GAME_ID_MISSMATCH_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  INVALID_BOARD_MESSAGE,
  INVALID_COMMAND_MESSAGE,
  INVALID_DRAWER_MESSAGE,
} from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import {
  Color,
  DrawCommand,
  EraseCommand,
  GameInstance,
  InteractableCommand,
  InteractableCommandReturnType,
  InteractableType,
  PictionaryGameState,
} from '../../types/CoveyTownSocket';
import GameArea from './GameArea';
import PictionaryGame from './PictionaryGame';

/**
 * The PictionaryGameArea class is responsible for managing the state of a single game area for Pictionary.
 * Responsibilty for managing the state of the game itself is delegated to the Pictionary class.
 *
 * @see PictionaryGame
 * @see GameArea
 */

export default class PictionaryGameArea extends GameArea<PictionaryGame> {
  protected getType(): InteractableType {
    return 'PictionaryArea';
  }

  get board(): Color[][] {
    return this._game?.state.board ?? [];
  }

  private _stateUpdated(updatedState: GameInstance<PictionaryGameState>) {
    if (updatedState.state.status === 'OVER') {
      // If we haven't yet recorded the outcome, do so now.
      const gameID = this._game?.id;
      if (gameID && !this._history.find(eachResult => eachResult.gameID === gameID)) {
        const { teamA, teamB } = updatedState.state;
        if (teamA && teamB) {
          // get first player's name on team A
          const teamAFirstPlayerName = this._occupants.find(
            eachPlayer => eachPlayer.id === teamA.players[0],
          )?.userName;
          // get second player's name on team A
          const teamASecondPlayerName = this._occupants.find(
            eachPlayer => eachPlayer.id === teamA.players[1],
          )?.userName;
          // get first player's name on team B
          const teamBFirstPlayerName = this._occupants.find(
            eachPlayer => eachPlayer.id === teamB.players[0],
          )?.userName;
          // get second player's name on team B
          const teamBSecondPlayerName = this._occupants.find(
            eachPlayer => eachPlayer.id === teamB.players[1],
          )?.userName;
          this._history.push({
            gameID,
            scores: {
              [`${teamAFirstPlayerName}, ${teamASecondPlayerName}`]:
                updatedState.state.winner === teamA ? 1 : 0,
              [`${teamBFirstPlayerName}, ${teamBSecondPlayerName}`]:
                updatedState.state.winner === teamB ? 1 : 0,
            },
          });
        }
      }
    }
    this._emitAreaChanged();
  }

  /**
   * Handle a command from a player in this game area.
   * Supported commands:
   * - JoinGame (joins the game `this._game`, or creates a new one if none is in progress)
   * - GameMove (applies a move to the game)
   * - LeaveGame (leaves the game)
   *
   * If the command is successful (does not throw an error), calls this._emitAreaChanged (necessary
   * to notify any listeners of a state update)
   * If the command is unsuccessful (throws an error), the error is propogated to the caller
   *
   * @param command command to handle
   * @param player player making the request
   * @returns response to the command, @see InteractableCommandResponse
   * @throws InvalidParametersError if the command is not supported or is invalid.
   * Invalid commands:
   * - GameMove and LeaveGame: if the game is not in progress (GAME_NOT_IN_PROGRESS_MESSAGE) or if the game ID does not match the game in progress (GAME_ID_MISSMATCH_MESSAGE)
   * - Any command besides JoinGame, GameMove, and LeaveGame: INVALID_COMMAND_MESSAGE
   */
  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    this._emitAreaChanged();
    if (command.type === 'GameMove') {
      const game = this._game;
      if (!game) {
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      }
      if (game.id !== command.gameID) {
        throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
      }
      if ('guess' in command.move) {
        if (command.move.guess === '') {
          throw new InvalidParametersError('Please enter a guess');
        }
        game.applyMove({
          gameID: command.gameID,
          playerID: player.id,
          move: command.move,
        });
        this._stateUpdated(game.toModel());
        return undefined as InteractableCommandReturnType<CommandType>;
      }
    }
    if (command.type === 'TickDown') {
      const game = this._game;
      if (!game) {
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      }
      game.tickDown();
    }
    if (command.type === 'PictionaryStartGame') {
      const game = this._game;
      if (!game) {
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      }
      game.startGame(command.difficulty);
      this._stateUpdated(game.toModel());
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'JoinGame') {
      let game = this._game;
      if (!game || game.state.status === 'OVER') {
        game = new PictionaryGame();
        this._game = game;
      }
      game.join(player);
      this._stateUpdated(game.toModel());
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'LeaveGame') {
      const game = this._game;
      if (!game) {
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      }
      if (game.id !== command.gameID) {
        throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
      }
      game.leave(player);
      this._stateUpdated(game.toModel());
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (this._game?.state.drawer === player.id) {
      if (command.type === 'DrawCommand') {
        const drawCommand = command as DrawCommand;
        if (!this.board) {
          throw new InvalidParametersError(INVALID_BOARD_MESSAGE);
        }
        this.game?.draw(drawCommand.drawing);
        this._emitAreaChanged();
        return undefined as InteractableCommandReturnType<CommandType>;
      }
      if (command.type === 'EraseCommand') {
        const drawCommand = command as EraseCommand;
        if (!this.board) {
          throw new InvalidParametersError(INVALID_BOARD_MESSAGE);
        }
        this.game?.erase(drawCommand.drawing);
        this._emitAreaChanged();
        return undefined as InteractableCommandReturnType<CommandType>;
      }
      if (command.type === 'ResetCommand') {
        if (!this.board) {
          throw new InvalidParametersError(INVALID_BOARD_MESSAGE);
        }
        this.game?.reset();
        this._emitAreaChanged();
        return undefined as InteractableCommandReturnType<CommandType>;
      }
      throw new InvalidParametersError(INVALID_DRAWER_MESSAGE);
    }
    throw new InvalidParametersError(INVALID_COMMAND_MESSAGE);
  }
}
