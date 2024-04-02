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
  TownEmitter,
} from '../../types/CoveyTownSocket';
import PictionaryGameArea from './PictionaryGameArea';
import * as PictionaryGameModule from './PictionaryGame';
import Game from './Game';
import PictionaryGame from './PictionaryGame';

class TestingGame extends Game<PictionaryGameState, PictionaryMove> {
    public constructor() {
        super({
            word: 'test',
            teamA: {letter: 'A', players: [], score: 0},
            teamB: {letter: 'B', players: [], score: 0},
            usedWords: [],
            timer: 0,
            round: 0,
            status: 'WAITING_TO_START'
        });
    }

    public applyMove(move: GameMove<PictionaryMove>): void { }

    protected _join(player: Player): void { }

    protected _leave(player: Player): void { }

}

describe('PictionaryGameArea', () => {
    let gameArea: PictionaryGameArea;
    let player1: Player;
    let player2: Player;
    let interactableUpdateSpy: jest.SpyInstance;
    let game: TestingGame;

    beforeEach(() => {
        const gameConstructorSpy = jest.spyOn(PictionaryGameModule, 'default');
        game = new TestingGame(); // Pass an empty object as the argument to the constructor
        gameConstructorSpy.mockReturnValue(game);

        player1 = createPlayerForTesting();
        player2 = createPlayerForTesting();
        gameArea = new PictionaryGameArea(
            nanoid(),
            { x: 0, y: 0, width: 100, height: 100 },
            mock<TownEmitter>(),
        );
        gameArea.add(player1);
        gameArea.add(player2);
        interactableUpdateSpy = jest.spyOn(gameArea, '_emitAreaChanged');
    });

    describe('handleCommand', () => {
        describe('JoinGame command', () => {
            it('should create a new game and emit area change if no game is in progress', () => {
                gameArea.handleCommand({ type: 'JoinGame' }, player1);
                expect(gameArea.game).toBeDefined();
                expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
            });

            it('should add the player to the existing game if already in progress', () => {
                gameArea.handleCommand({ type: 'JoinGame' }, player1);
                interactableUpdateSpy.mockClear();
                gameArea.handleCommand({ type: 'JoinGame' }, player2);
                expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
            });
        });

        describe('GameMove command', () => {
            beforeEach(() => {
                gameArea.handleCommand({ type: 'JoinGame' }, player1);
                gameArea.handleCommand({ type: 'JoinGame' }, player2);
            });

            it('should apply a move if the game is in progress', () => {
                const move: PictionaryMove = { guess: 'test' };
                const applyMoveSpy = jest.spyOn(game, 'applyMove');
                gameArea.handleCommand({ type: 'GameMove', gameID: game.id, move }, player1);
                expect(applyMoveSpy).toHaveBeenCalledWith({ playerID: player1.id, gameID: game.id, move });
                expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
            });

            it('should throw an error if no game is in progress', () => {
                gameArea.handleCommand({ type: 'LeaveGame', gameID: game.id }, player1); // End the game
                expect(() => gameArea.handleCommand({
                    type: 'GameMove',
                    gameID: game.id,
                    move: { guess: 'test' }
                }, player1)).toThrow(GAME_NOT_IN_PROGRESS_MESSAGE);
            });
        });

        describe('LeaveGame command', () => {
            beforeEach(() => {
                gameArea.handleCommand({ type: 'JoinGame' }, player1);
            });

            it('should allow a player to leave the game', () => {
                const leaveSpy = jest.spyOn(game, 'leave');
                gameArea.handleCommand({ type: 'LeaveGame', gameID: game.id }, player1);
                expect(leaveSpy).toHaveBeenCalledWith(player1);
                expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
            });

            it('should throw an error if no game is in progress', () => {
                gameArea.handleCommand({ type: 'LeaveGame', gameID: game.id }, player1); // End the game
                expect(() => gameArea.handleCommand({ type: 'LeaveGame', gameID: game.id }, player1))
                    .toThrow(GAME_NOT_IN_PROGRESS_MESSAGE);
            });
        });
    });
});