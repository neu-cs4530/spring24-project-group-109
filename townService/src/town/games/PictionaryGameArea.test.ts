import { mock } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { createPlayerForTesting } from '../../TestUtils';
import {
  GAME_ID_MISSMATCH_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  INVALID_COMMAND_MESSAGE,
} from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import {
  DrawCommand,
  GameMove,
  PictionaryGameState,
  PictionaryMove,
  PictionaryWordDifficulty,
  Pixel,
  TownEmitter,
} from '../../types/CoveyTownSocket';
import PictionaryGameArea from './PictionaryGameArea';
import * as PictionaryGameModule from './PictionaryGame';
import Game from './Game';
import { EASY_WORDS } from './PictionaryDictionary';

class TestingGame extends Game<PictionaryGameState, PictionaryMove> {
  private _wordList: string[];

  public constructor() {
    super({
      drawer: undefined,
      guesser: undefined,
      word: 'Test',
      difficulty: 'No difficulty',
      teamA: { letter: 'A', players: [], score: 0 },
      teamB: { letter: 'B', players: [], score: 0 },
      usedWords: [],
      timer: 120, // seconds
      round: 1,
      status: 'WAITING_FOR_PLAYERS',
      board: undefined,
      guess: undefined,
    });
    this._wordList = EASY_WORDS;
  }

  public applyMove(move: GameMove<PictionaryMove>): void {}

  protected _join(player: Player): void {}

  protected _leave(player: Player): void {}

  public draw(drawing: Pixel[]): void {}

  public erase(drawing: Pixel[]): void {}

  public reset(): void {}

  public tickDown(): void {}

  public startGame(difficulty: PictionaryWordDifficulty): void {}
}

describe('PictionaryGameArea', () => {
  let gameArea: PictionaryGameArea;
  let player1: Player;
  let player2: Player;
  let player3: Player;
  let player4: Player;
  let interactableUpdateSpy: jest.SpyInstance;
  let game: TestingGame;

  beforeEach(() => {
    const gameConstructorSpy = jest.spyOn(PictionaryGameModule, 'default');
    gameConstructorSpy.mockClear();
    game = new TestingGame();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore (Testing without using the real game class)
    gameConstructorSpy.mockReturnValue(game);

    player1 = createPlayerForTesting();
    player2 = createPlayerForTesting();
    player3 = createPlayerForTesting();
    player4 = createPlayerForTesting();

    gameArea = new PictionaryGameArea(
      '123',
      { x: 0, y: 0, width: 100, height: 100 },
      mock<TownEmitter>(),
    );

    gameArea.add(player1);
    game.join(player1);
    gameArea.add(player2);
    game.join(player2);
    gameArea.add(player3);
    game.join(player3);
    gameArea.add(player4);
    game.join(player4);
    game.state.drawer = player1.id;
    game.state.guesser = player2.id;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore (Test requires access to protected method)
    interactableUpdateSpy = jest.spyOn(gameArea, '_emitAreaChanged');
  });

  describe('handleCommand', () => {
    describe('JoinGame command', () => {
      describe('when no game is in progress', () => {
        it('as new game should be created and call _emitAreaChanged', () => {
          gameArea.handleCommand({ type: 'JoinGame' }, player1);
          expect(game).toBeDefined();
          if (!game) {
            throw new Error('Game was not created by the first call to join');
          }
          expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
          interactableUpdateSpy.mockClear();
        });
      });
      describe('when game is in progress', () => {
        it('should add the player to the existing game if already in progress', () => {
          gameArea.handleCommand({ type: 'JoinGame' }, player1);
          expect(game).toBeDefined();
          if (!game) {
            throw new Error('Game was not created by the first call to join');
          }
          const joinSpy = jest.spyOn(game, 'join');
          gameArea.handleCommand({ type: 'JoinGame' }, player2);
          expect(joinSpy).toHaveBeenCalledWith(player2);
          expect(interactableUpdateSpy).toHaveBeenCalledTimes(2);
        });
        it('should not call _emitAreaChanged if the game throws an error', () => {
          gameArea.handleCommand({ type: 'JoinGame' }, player1);
          if (!game) {
            throw new Error('Game was not created by the first call to join');
          }
          interactableUpdateSpy.mockClear();

          const joinSpy = jest.spyOn(game, 'join').mockImplementationOnce(() => {
            throw new Error('Test Error');
          });
          expect(() => gameArea.handleCommand({ type: 'JoinGame' }, player2)).toThrowError(
            'Test Error',
          );
          expect(joinSpy).toHaveBeenCalledWith(player2);
          expect(interactableUpdateSpy).not.toHaveBeenCalled();
          interactableUpdateSpy.mockClear();
        });
      });
    });
    describe('GameMove Command', () => {
      // describe('Should throw error when no game is in progess', () => {
      //   const command = { type: 'GameMove', move: { guess: 'Test' }, gameID: '0' };
      //   const moveCommand = command as GameMoveCommand<PictionaryMove>;
      //   expect(() => gameArea.handleCommand(moveCommand, player1)).toThrowError(
      //     GAME_NOT_IN_PROGRESS_MESSAGE,
      //   );
      // });
    });
    describe('LeaveGame command', () => {
      describe('when no game in progress', () => {
        it('should throw an error', () => {
          expect(() =>
            gameArea.handleCommand({ type: 'LeaveGame', gameID: nanoid() }, player1),
          ).toThrowError(GAME_NOT_IN_PROGRESS_MESSAGE);
          expect(interactableUpdateSpy).not.toHaveBeenCalled();
        });
      });
      describe('when game in progress', () => {
        it('should throw an error when the game ID does not match', () => {
          gameArea.handleCommand({ type: 'JoinGame' }, player1);
          interactableUpdateSpy.mockClear();
          expect(() =>
            gameArea.handleCommand({ type: 'LeaveGame', gameID: nanoid() }, player1),
          ).toThrowError(GAME_ID_MISSMATCH_MESSAGE);
          expect(interactableUpdateSpy).not.toHaveBeenCalled();
        });
        it('should not call _emitAreaChanged if the game throws an error', () => {
          gameArea.handleCommand({ type: 'JoinGame' }, player1);
          if (!game) {
            throw new Error('Game was not created by the first call to join');
          }
          interactableUpdateSpy.mockClear();
          const leaveSpy = jest.spyOn(game, 'leave').mockImplementationOnce(() => {
            throw new Error('Test Error');
          });
          expect(() =>
            gameArea.handleCommand({ type: 'LeaveGame', gameID: game.id }, player1),
          ).toThrowError('Test Error');
          expect(leaveSpy).toHaveBeenCalledWith(player1);
          expect(interactableUpdateSpy).not.toHaveBeenCalled();
        });
      });
    });
    describe('PictionaryStartGame command', () => {
      it('when there is no game, it should throw an error and not call _emitAreaChanged', () => {
        expect(() =>
          gameArea.handleCommand(
            { type: 'PictionaryStartGame', difficulty: 'Easy', gameID: nanoid() },
            player1,
          ),
        ).toThrowError(GAME_NOT_IN_PROGRESS_MESSAGE);
      });
    });
    describe('TickDown command', () => {
      it('when there is no game, it should throw an error and not call _emitAreaChanged', () => {
        expect(() =>
          gameArea.handleCommand(
            { type: 'PictionaryStartGame', difficulty: 'Easy', gameID: nanoid() },
            player1,
          ),
        ).toThrowError(GAME_NOT_IN_PROGRESS_MESSAGE);
      });
    });
    describe('DrawGame command', () => {
      it('should add the player to the existing game if already in progress', () => {
        const pixel: Pixel = { x: 0, y: 0, color: `#${'0000FF'}` };
        const command = { type: 'DrawCommand', drawing: [pixel] };
        const drawCommand = command as DrawCommand;
        gameArea.handleCommand(drawCommand, game.state.drawer as unknown as Player);
        expect(interactableUpdateSpy).toHaveBeenCalled();
        interactableUpdateSpy.mockClear();
      });
    });
    describe('EraseCommand', () => {
      test('command should called', () => {
        const pixel: Pixel = { x: 0, y: 0, color: `#${'0000FF'}` };
        interactableUpdateSpy.mockClear();
        game.state.drawer = player1.id;
        gameArea.handleCommand(
          { type: 'EraseCommand', drawing: [pixel] },
          game.state.drawer as unknown as Player,
        );
        expect(interactableUpdateSpy).toHaveBeenCalled();
      });
    });
    describe('ResetCommand', () => {
      test('command should called', () => {
        const pixel: Pixel = { x: 0, y: 0, color: `#${'0000FF'}` };
        interactableUpdateSpy.mockClear();
        gameArea.handleCommand(
          { type: 'ResetCommand', drawing: [pixel] },
          game.state.drawer as unknown as Player,
        );
        expect(interactableUpdateSpy).toHaveBeenCalled();
      });
    });
    describe('Given Invalid command', () => {
      it('should throw an error', () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore (Testing an invalid command, only possible at the boundary of the type system)
        expect(() => gameArea.handleCommand({ type: 'InvalidCommand' }, player1)).toThrowError(
          INVALID_COMMAND_MESSAGE,
        );
        expect(interactableUpdateSpy).not.toHaveBeenCalled();
      });
    });
  });
});