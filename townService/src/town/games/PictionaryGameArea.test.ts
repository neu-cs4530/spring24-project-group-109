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
  GameInstanceID,
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
import PictionaryGame from './PictionaryGame';
import { EASY_WORDS } from './PictionaryDictionary';

class TestingGame extends Game<PictionaryGameState, PictionaryMove> {
  private _wordList: string[];
  public constructor() {
    super({
      word: 'test',
      teamA: { letter: 'A', players: [], score: 0 },
      teamB: { letter: 'B', players: [], score: 0 },
      usedWords: [],
      timer: 0,
      round: 0,
      status: 'WAITING_TO_START',
      difficulty: 'No difficulty',
      board: undefined,
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
  const gameConstructorSpy = jest.spyOn(PictionaryGameModule, 'default');
  let game: TestingGame;

  beforeEach(() => {
    gameConstructorSpy.mockClear();
    game = new TestingGame();
    gameConstructorSpy.mockReturnValue(game as unknown as PictionaryGame);

    player1 = createPlayerForTesting();
    player2 = createPlayerForTesting();
    player3 = createPlayerForTesting();
    player4 = createPlayerForTesting();

    gameArea = new PictionaryGameArea(
      nanoid(),
      { x: 0, y: 0, width: 100, height: 100 },
      mock<TownEmitter>(),
    );

    gameArea.add(player1);
    game.join(player1);
    gameArea.add(player2);
    game.join(player2);
    interactableUpdateSpy = jest.spyOn(gameArea as any, '_emitAreaChanged');
  });

  describe('handleCommand', () => {
    describe('JoinGame command', () => {
      it('should add the player to the existing game if already in progress', () => {
        gameArea.handleCommand({ type: 'JoinGame' }, player1);
        // interactableUpdateSpy.mockClear();
        gameArea.handleCommand({ type: 'JoinGame' }, player2);
        expect(interactableUpdateSpy).toHaveBeenCalledTimes(2); // Adjusted to 2 calls
      });
    });
  });
});

describe('WhiteBoardArea', () => {
    let gameArea: PictionaryGameArea;
    let game: TestingGame; // makes a PictionaryGame
    let player1: Player;
    let interactableUpdateSpy: jest.SpyInstance;
    let interactableUpdateSpyE: jest.SpyInstance;
    let interactableUpdateSpyR: jest.SpyInstance;
    const gameConstructorSpy = jest.spyOn(PictionaryGameModule, 'default');
    beforeEach(() => {
        
      gameArea = new PictionaryGameArea(      
        nanoid(),
      { x: 0, y: 0, width: 100, height: 100 },
      mock<TownEmitter>(),);
      player1 = createPlayerForTesting();
      interactableUpdateSpy = jest.spyOn(gameArea as any, '_emitAreaChanged');
    //   interactableUpdateSpyE = jest.spyOn(gameArea, 'erase');
    //   interactableUpdateSpyR = jest.spyOn(gameArea, 'reset');
      game = new TestingGame();
    gameConstructorSpy.mockReturnValue(game as unknown as PictionaryGame);
      game.state.drawer = player1.id;
    });
    describe('handleCommand for draw', () => {
      test('command should called', () => {
        const pixel: Pixel = { x: 0, y: 0, color: `#${'0000FF'}` };
        gameArea.handleCommand({ type: 'DrawCommand', drawing: [pixel] }, player1);
        interactableUpdateSpy.mockClear();
        expect(interactableUpdateSpy).toHaveBeenCalled();
      });
    });
    describe('handleCommand for erase', () => {
      test('command should called', () => {
        const pixel: Pixel = { x: 0, y: 0, color: `#${'0000FF'}` };
        interactableUpdateSpy.mockClear();
        gameArea.handleCommand({ type: 'EraseCommand', drawing: [pixel] }, player1);
        expect(interactableUpdateSpyE).toHaveBeenCalled();
      });
    });
    describe('handleCommand for reset', () => {
      test('command should called', () => {
        const pixel: Pixel = { x: 0, y: 0, color: `#${'0000FF'}` };
        interactableUpdateSpy.mockClear();
        gameArea.handleCommand({ type: 'ResetCommand', drawing: [pixel] }, player1);
        expect(interactableUpdateSpyR).toHaveBeenCalled();
      });
    });
  });
  