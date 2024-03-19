import { createPlayerForTesting } from '../../TestUtils';
import {
    GAME_FULL_MESSAGE,
    GAME_NOT_IN_PROGRESS_MESSAGE,
    BOARD_POSITION_NOT_EMPTY_MESSAGE,
    MOVE_NOT_YOUR_TURN_MESSAGE,
    PLAYER_ALREADY_IN_GAME_MESSAGE,
    PLAYER_NOT_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';
import PictionaryGame from './PictionaryGame';
import Player from '../../lib/Player';
import { PictionaryMove } from '../../types/CoveyTownSocket';

describe('PictionaryGame', () => {
    let game: PictionaryGame;

    beforeEach(() => {
        game = new PictionaryGame();
    });

    describe('_join', () => {
        it('should throw an error if the player is already in the game', () => {
            const player = createPlayerForTesting();
            game.join(player);
            expect(() => game.join(player)).toThrowError(PLAYER_ALREADY_IN_GAME_MESSAGE);
            const player2 = createPlayerForTesting();
            game.join(player2);
            expect(() => game.join(player2)).toThrowError(PLAYER_ALREADY_IN_GAME_MESSAGE);
        });
        it('should throw an error if the game is full', () => {
            const player1 = createPlayerForTesting();
            const player2 = createPlayerForTesting();
            const player3 = createPlayerForTesting();
            const player4 = createPlayerForTesting();
            const player5 = createPlayerForTesting();
            game.join(player1);
            game.join(player2);
            game.join(player3);
            game.join(player4);
            expect(() => game.join(player5)).toThrowError(GAME_FULL_MESSAGE);
        });
        describe('When the player can be added', () => {
            it('makes the first and second players part of team A', () => {
                const player = createPlayerForTesting();
                const player2 = createPlayerForTesting();
                game.join(player);
                expect(game.state.teamA?.players).toContain(player.id);
                game.join(player2);
                expect(game.state.teamA?.players).toContain(player2.id);
                expect(game.state.teamB?.players).toHaveLength(0);
            });
            it('makes the third and fourth players part of team B', () => {
                const player1 = createPlayerForTesting();
                const player2 = createPlayerForTesting();
                const player3 = createPlayerForTesting();
                const player4 = createPlayerForTesting();
                game.join(player1);
                game.join(player2);
                game.join(player3);
                expect(game.state.teamB?.players).toHaveLength(0);
                game.join(player4);
                expect(game.state.teamB?.players).toContain(player4.id);
            });
            it('sets the game status to IN_PROGRESS when the game is full', () => {
                const player1 = createPlayerForTesting();
                const player2 = createPlayerForTesting();
                const player3 = createPlayerForTesting();
                const player4 = createPlayerForTesting();
                game.join(player1);
                game.join(player2);
                game.join(player3);
                expect(game.state.status).toEqual('WAITING_FOR_PLAYERS');
                game.join(player4);
                expect(game.state.status).toEqual('IN_PROGRESS');
                expect(game.state.winner).toBeUndefined();
            });
        });
    });
    describe('_leave', () => {
        it('should throw an error if the player is not in the game', () => {
            expect(() => game.leave(createPlayerForTesting())).toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
            // TODO weaker test suite only does one of these - above or below
            const player = createPlayerForTesting();
            game.join(player);
            expect(() => game.leave(createPlayerForTesting())).toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
        });
        describe('when the player is in the game', () => {
            describe('when the game is in progress, it should set the game status to OVER and declare the other team the winner', () => {
                test('when the player is on team A', () => {
                    const player1 = createPlayerForTesting();
                    const player2 = createPlayerForTesting();
                    const player3 = createPlayerForTesting();
                    const player4 = createPlayerForTesting();
                    game.join(player1);
                    game.join(player2);
                    game.join(player3);
                    game.join(player4);
                    game.leave(player1);
                    expect(game.state.status).toBe('OVER');
                    expect(game.state.winner).toBe('B');
                });
                test('when the player is on team B', () => {
                    const player1 = createPlayerForTesting();
                    const player2 = createPlayerForTesting();
                    const player3 = createPlayerForTesting();
                    const player4 = createPlayerForTesting();
                    game.join(player1);
                    game.join(player2);
                    game.join(player3);
                    game.join(player4);
                    game.leave(player3);
                    expect(game.state.status).toBe('OVER');
                    expect(game.state.winner).toBe('A');
                });
            });
            it('when the game is not in progress, it should set the game status to WAITING_FOR_PLAYERS and remove the player', () => {
                const player1 = createPlayerForTesting();
                game.join(player1);
                expect(game.state.teamA?.players).toContain(player1.id);
                expect(game.state.teamB?.players).toHaveLength(0);
                expect(game.state.status).toEqual('WAITING_FOR_PLAYERS');
                expect(game.state.winner).toBeUndefined();
                game.leave(player1);
                expect(game.state.teamA?.players).toHaveLength(0);
                expect(game.state.teamB?.players).toHaveLength(0);
                expect(game.state.status).toEqual('WAITING_FOR_PLAYERS');
                expect(game.state.winner).toBeUndefined();
            });
        });
    });
});
