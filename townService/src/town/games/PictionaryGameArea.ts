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
  InteractableCommand,
  InteractableCommandReturnType,
  InteractableType,
} from '../../types/CoveyTownSocket';
import PictionaryGame from './PictionaryGame';
import GameArea from './GameArea';
// import WhiteBoardArea from '../WhiteBoardArea';

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
    // const whiteboardArea = new WhiteBoardArea();
    // this.game?.tickDown();
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
        this._emitAreaChanged();
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
      this._emitAreaChanged();
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'JoinGame') {
      let game = this._game;
      if (!game || game.state.status === 'OVER') {
        game = new PictionaryGame();
        this._game = game;
      }
      game.join(player);
      this._emitAreaChanged();
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
      this._emitAreaChanged();
      return undefined as InteractableCommandReturnType<CommandType>;
    }
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
      // const { board } = this.board;
      if (!this.board) {
        throw new InvalidParametersError(INVALID_BOARD_MESSAGE);
      }
      this.game?.erase(drawCommand.drawing);
      this._emitAreaChanged();
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'ResetCommand') {
      // const { board } = this._game.board;
      if (!this.board) {
        throw new InvalidParametersError(INVALID_BOARD_MESSAGE);
      }
      this.game?.reset();
      this._emitAreaChanged();
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    throw new InvalidParametersError(INVALID_DRAWER_MESSAGE);
  }
}
