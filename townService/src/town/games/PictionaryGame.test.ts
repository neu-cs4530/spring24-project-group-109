import { createPlayerForTesting } from '../../TestUtils';
import {
  GAME_FULL_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  MOVE_NOT_YOUR_TURN_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
  INVALID_DRAW_MESSAGE,
} from '../../lib/InvalidParametersError';
import PictionaryGame from './PictionaryGame';
import Player from '../../lib/Player';
import { GameMove, PictionaryMove, Pixel } from '../../types/CoveyTownSocket';

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
        expect(game.state.teamB?.players).toHaveLength(0);
        game.join(player3);
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
        expect(game.state.status).toEqual('WAITING_TO_START');
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

  describe('applyMove', () => {
    describe('when given an invalid move', () => {
      it('should throw an error if the game is not in progress', () => {
        const player1 = createPlayerForTesting();
        game.join(player1);
        const move: GameMove<PictionaryMove> = {
          gameID: game.id,
          playerID: player1.id,
          move: { guess: 'test' },
        };
        expect(() => game.applyMove(move)).toThrowError(GAME_NOT_IN_PROGRESS_MESSAGE);
      });
      it('should throw an error if the move is not from the guesser', () => {
        const player1 = createPlayerForTesting();
        const player2 = createPlayerForTesting();
        const player3 = createPlayerForTesting();
        const player4 = createPlayerForTesting();
        game.join(player1);
        game.join(player2);
        game.join(player3);
        game.join(player4);
        // should not need the line below... state does not change in join game
        game.startGame('Easy');
        const move: GameMove<PictionaryMove> = {
          gameID: game.id,
          playerID: player2.id,
          move: { guess: 'test' },
        };
        expect(() => game.applyMove(move)).toThrowError(MOVE_NOT_YOUR_TURN_MESSAGE);
      });
      it('should throw an error if the move is not from a player in the game', () => {
        const player1 = createPlayerForTesting();
        const player2 = createPlayerForTesting();
        const player3 = createPlayerForTesting();
        const player4 = createPlayerForTesting();
        game.join(player1);
        game.join(player2);
        game.join(player3);
        game.join(player4);
        game.startGame('Easy');
        // should not need the line below... state does not change in join game
        const move: GameMove<PictionaryMove> = {
          gameID: game.id,
          playerID: createPlayerForTesting().id,
          move: { guess: 'test' },
        };
        expect(() => game.applyMove(move)).toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
      });
    });
    describe('when given a valid move', () => {
      let player1: Player;
      let player2: Player;
      let player3: Player;
      let player4: Player;
      beforeEach(() => {
        player1 = createPlayerForTesting();
        player2 = createPlayerForTesting();
        player3 = createPlayerForTesting();
        player4 = createPlayerForTesting();
        game.join(player1);
        game.join(player2);
        game.join(player3);
        game.join(player4);
        // should not need the line below... state does not change in join game
        expect(game.state.status).toEqual('WAITING_TO_START');
        game.startGame('Easy');
      });
      it('should update the team score', () => {
        game.state.word = 'test';
        game.state.guesser = player1.id;
        game.state.drawer = player2.id;
        game.applyMove({
          gameID: game.id,
          playerID: player1.id,
          move: { guess: 'test' },
        });
        expect(game.state.teamA?.score).toEqual(1);
        expect(game.state.teamB?.score).toEqual(0);
      });
      it('should update the used words', () => {
        game.state.word = 'test';
        game.state.guesser = player1.id;
        game.state.drawer = player2.id;
        game.applyMove({
          gameID: game.id,
          playerID: player1.id,
          move: { guess: 'test' },
        });
        expect(game.state.usedWords).toContain('test');
      });
      it('should choose a new word', () => {
        game.state.word = 'test';
        game.state.guesser = player1.id;
        game.state.drawer = player2.id;
        game.applyMove({
          gameID: game.id,
          playerID: player1.id,
          move: { guess: 'test' },
        });
        expect(game.state.word).not.toEqual('test');
      });
    });
    describe('next round', () => {
      let player1: Player;
      let player2: Player;
      let player3: Player;
      let player4: Player;
      beforeEach(() => {
        player1 = createPlayerForTesting();
        player2 = createPlayerForTesting();
        player3 = createPlayerForTesting();
        player4 = createPlayerForTesting();
        game.join(player1);
        game.join(player2);
        game.join(player3);
        game.join(player4);
        // should not need the line below... state does not change in join game
        expect(game.state.status).toEqual('WAITING_TO_START');
        game.startGame('Easy');
        expect(game.state.status).toEqual('IN_PROGRESS');
      });
      it('ends the game if the round is equal to 5', () => {
        game.state.round = 4;
        game.nextRound();
        expect(game.state.status).toEqual('OVER');
      });
      // it('should decrement the timer if the game is in progress', () => {
      //   game.state.timer = 5;
      //   game.nextRound();
      //   expect(game.state.timer).toEqual(4);
      // });
      // it('should increment the round and assign new roles if the timer is 0', () => {
      //   game.state.timer = 0;
      //   game.state.round = 1;
      //   game.state.drawer = player1.id;
      //   game.state.guesser = player2.id;
      //   game.tickDown();
      //   expect(game.state.round).toEqual(2);
      //   expect(game.state.drawer).toEqual(player2.id);
      //   expect(game.state.guesser).toEqual(player1.id);
      // });
    });
  });
  describe('board tests', () => {
    let player1: Player;
    let player2: Player;
    let player3: Player;
    let player4: Player;
    beforeEach(() => {
      player1 = createPlayerForTesting();
      player2 = createPlayerForTesting();
      player3 = createPlayerForTesting();
      player4 = createPlayerForTesting();
      game.join(player1);
      game.join(player2);
      game.join(player3);
      game.join(player4);
      // should not need the line below... state does not change in join game
      expect(game.state.status).toEqual('WAITING_TO_START');
      game.startGame('Easy');
      expect(game.state.status).toEqual('IN_PROGRESS');
    });
    it('should create a new whiteboard', () => {
      expect(game.state.board?.length).toEqual(35);
    });
    it('should draw a pixel on the whiteboard', () => {
      const pixel: Pixel = { x: 0, y: 0, color: `#${'0000FF'}` };
      game.draw([pixel]);
      expect(game.state.board?.[0][0]).toBe(`#${'0000FF'}`);
    });
    it('should draw pixels on the whiteboard', () => {
      const pixels: Pixel[] = [0, 1, 2, 3, 4, 5].map(posn => ({
        x: posn,
        y: posn,
        color: `#${'0000FF'}`,
      }));
      game.draw(pixels);
      [0, 1, 2, 3, 4, 5].forEach(posn =>
        expect(game.state.board?.[posn][posn]).toBe(`#${'0000FF'}`),
      );
    });
    it('should erase a pixel on the whiteboard', () => {
      const pixel: Pixel = { x: 0, y: 0, color: `#${'0000FF'}` };
      game.draw([pixel]);
      game.erase([pixel]);
      expect(game.state.board?.[0][0]).toBe('#FFFFFF');
    });
    it('should erase pixels on the whiteboard', () => {
      const pixels: Pixel[] = [0, 1, 2, 3, 4, 5].map(posn => ({
        x: posn,
        y: posn,
        color: `#${'0000FF'}`,
      }));
      game.draw(pixels);
      game.erase(pixels);
      [0, 1, 2, 3, 4, 5].forEach(posn =>
        expect(game.state.board?.[posn][posn]).toBe(`#${'FFFFFF'}`),
      );
    });
    it('should reset the whiteboard', () => {
      const pixels: Pixel[] = [0, 1, 2, 3, 4, 5].map(posn => ({
        x: posn,
        y: posn,
        color: `#${'0000FF'}`,
      }));
      game.draw(pixels);
      game.reset();
      game.state.board?.forEach(row => {
        row.forEach(pixel => {
          expect(pixel).toBe(`#${'FFFFFF'}`);
        });
      });
    });
    it('should throw an error when drawing out of bounds', () => {
      const pixel: Pixel = { x: 50, y: 35, color: `#${'0000FF'}` };
      expect(() => game.draw([pixel])).toThrowError(INVALID_DRAW_MESSAGE);
    });

    it('should throw an error when erasing out of bounds', () => {
      const pixel: Pixel = { x: 50, y: 35, color: `#${'0000FF'}` };
      expect(() => game.erase([pixel])).toThrowError(INVALID_DRAW_MESSAGE);
    });
  });
});
