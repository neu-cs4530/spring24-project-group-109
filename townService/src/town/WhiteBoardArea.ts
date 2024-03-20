import WhiteBoardModel from './WhiteBoardModel';
import PictionaryGame from './games/PictionaryGame';
import {
  DrawCommand,
  EraseCommand,
  InteractableCommand,
  InteractableCommandReturnType,
  InteractableType,
  Player,
} from '../types/CoveyTownSocket';
import InvalidParametersError, {
  INVALID_BOARD_MESSAGE,
  INVALID_DRAWER_MESSAGE,
} from '../lib/InvalidParametersError';

/**
 * WhiteBoardArea is a class that represents the state of a whiteboard.
 */
export default class WhiteBoardArea extends WhiteBoardModel {
  protected getType(): InteractableType {
    return 'WhiteBoardArea';
  }

  /**
   * Handles a given command from a player in the game.
   * Supported commands:
   * - DrawCommand (displays the given drawing that the player drew)
   * - EraseCommand (erases part of the drawing that the player drew)
   * - ResetCommand (resets the drawing on the whiteboard to a blank state)
   *
   * - If the player is the drawer, the command is executed.
   * - If the player is not the drawer, an InvalidParametersError is thrown.
   *
   * @param command The command to be handled.
   * @param player The player who issued the command.
   * @returns response to command
   * @throws InvalidParametersError if the player is not the drawer or the board is not initialized.
   */
  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
    game: PictionaryGame,
  ): InteractableCommandReturnType<CommandType> {
    if (player.id === game.state.drawer) {
      if (command.type === 'DrawCommand') {
        const drawCommand = command as DrawCommand;
        const { board } = this;
        if (!board) {
          throw new InvalidParametersError(INVALID_BOARD_MESSAGE);
        }
        this.draw(drawCommand.drawing);
        return undefined as InteractableCommandReturnType<CommandType>;
      }
      if (command.type === 'EraseCommand') {
        const drawCommand = command as EraseCommand;
        const { board } = this;
        if (!board) {
          throw new InvalidParametersError(INVALID_BOARD_MESSAGE);
        }
        this.erase(drawCommand.drawing);
        return undefined as InteractableCommandReturnType<CommandType>;
      }
      if (command.type === 'ResetCommand') {
        const { board } = this;
        if (!board) {
          throw new InvalidParametersError(INVALID_BOARD_MESSAGE);
        }
        this.reset();
        return undefined as InteractableCommandReturnType<CommandType>;
      }
    }
    throw new InvalidParametersError(INVALID_DRAWER_MESSAGE);
  }
}
