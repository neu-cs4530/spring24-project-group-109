import assert from 'assert';
import { mock } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import {
  Color,
  GameResult,
  GameStatus,
  PictionaryMove,
  PictionaryTeam,
  PictionaryWordDifficulty,
  PlayerID,
} from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import TownController from '../TownController';
import { NO_GAME_IN_PROGRESS_ERROR } from './GameAreaController';
import PictionaryAreaController from './PictionaryAreaController';

describe('PictionaryAreaController', () => {
  const ourPlayer = new PlayerController(nanoid(), nanoid(), {
    x: 0,
    y: 0,
    moving: false,
    rotation: 'front',
  });
  const otherPlayers = [
    new PlayerController(nanoid(), nanoid(), { x: 0, y: 0, moving: false, rotation: 'front' }),
    new PlayerController(nanoid(), nanoid(), { x: 0, y: 0, moving: false, rotation: 'front' }),
    new PlayerController(nanoid(), nanoid(), { x: 0, y: 0, moving: false, rotation: 'front' }),
    new PlayerController(nanoid(), nanoid(), { x: 0, y: 0, moving: false, rotation: 'front' }),
  ];

  const mockTownController = mock<TownController>();
  Object.defineProperty(mockTownController, 'ourPlayer', {
    get: () => ourPlayer,
  });
  Object.defineProperty(mockTownController, 'players', {
    get: () => [ourPlayer, ...otherPlayers],
  });
  mockTownController.getPlayer.mockImplementation(playerID => {
    const p = mockTownController.players.find(player => player.id === playerID);
    assert(p);
    return p;
  });
  function pictionaryAreaControllerWithProps({
    _id,
    history,
    status,
    gameInstanceID,
    teamA,
    teamB,
  }: {
    _id?: string;
    history?: GameResult[];
    status?: GameStatus;
    gameInstanceID?: string;
    winner?: PlayerID;
    drawer?: PlayerID;
    guesser?: PlayerID;
    word?: string;
    difficulty: PictionaryWordDifficulty;
    teamA: PictionaryTeam;
    teamB: PictionaryTeam;
    usedWords: string[];
    timer: number;
    round: number;
    guess?: string;
    board: Color[][];
  }) {
    const id = _id || `INTERACTABLE-ID-${nanoid()}`;
    const instanceID = gameInstanceID || `GAME-INSTANCE-ID-${nanoid()}`;
    const players = [];
    if (teamA) players.push(teamA.players[0], teamA.players[1]);
    if (teamB) players.push(teamB.players[0], teamB.players[1]);
    const ret = new PictionaryAreaController(
      id,
      {
        id,
        occupants: players,
        history: history || [],
        type: 'PictionaryArea',
        game: undefined || {
          id: instanceID,
          players: players,
          state: {
            status: status || 'IN_PROGRESS',
            word: '',
            usedWords: [],
            timer: 120,
            round: 1,
            difficulty: 'No difficulty',
            teamA: { letter: 'A', players: [], score: 0 },
            teamB: { letter: 'B', players: [], score: 0 },
            board: [],
          },
        },
      },
      mockTownController,
    );
    if (players) {
      ret.occupants = players
        .map(eachID => mockTownController.players.find(eachPlayer => eachPlayer.id === eachID))
        .filter(eachPlayer => eachPlayer) as PlayerController[];
    }
    return ret;
  }
  describe('Properties at the start of the game', () => {
    describe('board', () => {
      it('returns blank white board', () => {
        const controller = pictionaryAreaControllerWithProps({
          board: [],
          difficulty: 'No difficulty',
          teamA: { letter: 'A', players: [], score: 0 },
          teamB: { letter: 'B', players: [], score: 0 },
          usedWords: [],
          timer: 120,
          round: 1,
        });
        //Expect correct number of rows
        expect(controller.board.length).toBe(35);
        for (let i = 0; i < 35; i++) {
          //Expect correct number of columns
          expect(controller.board[i].length).toBe(50);
          for (let j = 0; j < 50; j++) {
            //Expect each cell to be empty
            expect(controller.board[i][j]).toBe(`#${'FFFFFF'}`);
          }
        }
      });
    });
    describe('players', () => {
      it('returns the 1st player of teamA if there is a player', () => {
        const controller = pictionaryAreaControllerWithProps({
          difficulty: 'No difficulty',
          teamA: { letter: 'A', players: [ourPlayer.id], score: 0 },
          teamB: { letter: 'B', players: [], score: 0 },
          usedWords: [],
          timer: 120,
          round: 1,
          board: [],
        });
        expect(controller.getTeamAPlayers()[0]).toBe(ourPlayer);
      });
      it('returns the 1st player of teamA if there is a player', () => {
        const controller = pictionaryAreaControllerWithProps({
          difficulty: 'No difficulty',
          teamA: { letter: 'A', players: [ourPlayer.id], score: 0 },
          teamB: { letter: 'B', players: [], score: 0 },
          usedWords: [],
          timer: 120,
          round: 1,
          board: [],
        });
        expect(controller.getTeamAPlayers()[0]).toBe(ourPlayer);
      });
      it('returns the 1st player of teamA if there is a player', () => {
        const controller = pictionaryAreaControllerWithProps({
          difficulty: 'No difficulty',
          teamA: { letter: 'A', players: [ourPlayer.id], score: 0 },
          teamB: { letter: 'B', players: [], score: 0 },
          usedWords: [],
          timer: 120,
          round: 1,
          board: [],
        });
        expect(controller.getTeamAPlayers()[0]).toBe(ourPlayer);
      });
      it('returns the 2nd player of teamA if there is a player', () => {
        const controller = pictionaryAreaControllerWithProps({
          difficulty: 'No difficulty',
          teamA: { letter: 'A', players: [ourPlayer.id, otherPlayers[0].id], score: 0 },
          teamB: { letter: 'B', players: [], score: 0 },
          usedWords: [],
          timer: 120,
          round: 1,
          board: [],
        });
        expect(controller.getTeamAPlayers()[1]).toBe(otherPlayers[0].id);
      });
    });

    describe('winner', () => {
      it('returns the winner if there is a winner', () => {
        const controller = pictionaryAreaControllerWithProps({
          winner: ourPlayer.id,
          difficulty: 'No difficulty',
          teamA: { letter: 'A', players: [], score: 0 },
          teamB: { letter: 'B', players: [], score: 0 },
          usedWords: [],
          timer: 120,
          round: 1,
          board: [],
        });
        expect(controller.winner).toBe(ourPlayer);
      });
      it('returns undefined if there is no winner', () => {
        const controller = pictionaryAreaControllerWithProps({
          winner: undefined,
          difficulty: 'No difficulty',
          teamA: { letter: 'A', players: [], score: 0 },
          teamB: { letter: 'B', players: [], score: 0 },
          usedWords: [],
          timer: 120,
          round: 1,
          board: [],
        });
        expect(controller.winner).toBeUndefined();
      });
    });
    describe('getTimer', () => {
      it('returns the current time left from the game state', () => {
        const controller = pictionaryAreaControllerWithProps({
          difficulty: 'No difficulty',
          teamA: { letter: 'A', players: [], score: 0 },
          teamB: { letter: 'B', players: [], score: 0 },
          usedWords: [],
          timer: 120,
          round: 1,
          board: [],
        });
        expect(controller.getTimer).toBe(120);
      });
    });
    describe('getRound', () => {
      it('returns the current round from the game state', () => {
        const controller = pictionaryAreaControllerWithProps({
          difficulty: 'No difficulty',
          teamA: { letter: 'A', players: [], score: 0 },
          teamB: { letter: 'B', players: [], score: 0 },
          usedWords: [],
          timer: 120,
          round: 1,
          board: [],
        });
        expect(controller.getRound).toBe(1);
      });
    });
    describe('getDifficulty', () => {
      it('returns the player selected difficulty', () => {
        const controller = pictionaryAreaControllerWithProps({
          difficulty: 'Easy',
          teamA: { letter: 'A', players: [], score: 0 },
          teamB: { letter: 'B', players: [], score: 0 },
          usedWords: [],
          timer: 120,
          round: 1,
          board: [],
        });
        expect(controller.getDifficulty).toBe('Easy');
      });
    });
    describe('getGuess', () => {
      it('returns the guess from the game state', () => {
        const controller = pictionaryAreaControllerWithProps({
          difficulty: 'No difficulty',
          teamA: { letter: 'A', players: [], score: 0 },
          teamB: { letter: 'B', players: [], score: 0 },
          usedWords: [],
          timer: 120,
          round: 1,
          board: [],
          guess: 'Test Guess',
        });
        expect(controller.getGuess).toBe('Test Guess');
      });
    });
    describe('getWord', () => {
      it('returns the Word to draw', () => {
        const controller = pictionaryAreaControllerWithProps({
          difficulty: 'No difficulty',
          teamA: { letter: 'A', players: [], score: 0 },
          teamB: { letter: 'B', players: [], score: 0 },
          usedWords: [],
          timer: 120,
          round: 1,
          board: [],
          word: 'Test Word',
        });
        expect(controller.getGuess).toBe('Test Word');
      });
    });
    describe('isOurTurn', () => {
      it('returns true if it is our turn', () => {
        const controller = pictionaryAreaControllerWithProps({
          difficulty: 'No difficulty',
          teamA: { letter: 'A', players: [ourPlayer.id, otherPlayers[0].id], score: 0 },
          teamB: { letter: 'B', players: [], score: 0 },
          usedWords: [],
          timer: 120,
          round: 1,
          board: [],
          guesser: ourPlayer.id,
        });
        expect(controller.isOurTurn).toBe(true);
      });
      it('returns false if it is not our turn', () => {
        const controller = pictionaryAreaControllerWithProps({
          difficulty: 'No difficulty',
          teamA: { letter: 'A', players: [ourPlayer.id, otherPlayers[0].id], score: 0 },
          teamB: { letter: 'B', players: [], score: 0 },
          usedWords: [],
          timer: 120,
          round: 1,
          board: [],
          guesser: undefined,
        });
        expect(controller.isOurTurn).toBe(false);
      });
    });
    describe('isPlayer', () => {
      it('returns true if we are a player', () => {
        const controller = pictionaryAreaControllerWithProps({
          difficulty: 'No difficulty',
          teamA: { letter: 'A', players: [ourPlayer.id, otherPlayers[0].id], score: 0 },
          teamB: { letter: 'B', players: [], score: 0 },
          usedWords: [],
          timer: 120,
          round: 1,
          board: [],
          guesser: ourPlayer.id,
        });
        expect(controller.isPlayer).toBe(true);
      });
      it('returns false if we are not a player', () => {
        const controller = pictionaryAreaControllerWithProps({
          difficulty: 'No difficulty',
          teamA: { letter: 'A', players: [], score: 0 },
          teamB: { letter: 'B', players: [], score: 0 },
          usedWords: [],
          timer: 120,
          round: 1,
          board: [],
        });
        expect(controller.isPlayer).toBe(false);
      });
    });
    describe('getTeamAScore', () => {
      it('returns a number if Team has a score', () => {
        const controller = pictionaryAreaControllerWithProps({
          difficulty: 'No difficulty',
          teamA: { letter: 'A', players: [ourPlayer.id, otherPlayers[0].id], score: 1 },
          teamB: { letter: 'B', players: [], score: 0 },
          usedWords: [],
          timer: 120,
          round: 1,
          board: [],
        });
        expect(controller.getTeamAScore).toBe(1);
      });
      it('return 0 if teamA has no Points', () => {
        const controller = pictionaryAreaControllerWithProps({
          difficulty: 'No difficulty',
          teamA: { letter: 'A', players: [ourPlayer.id, otherPlayers[0].id], score: 0 },
          teamB: { letter: 'B', players: [], score: 0 },
          usedWords: [],
          timer: 120,
          round: 1,
          board: [],
        });
        expect(controller.getTeamAScore).toBe(0);
      });
    });
    describe('getTeamBScore', () => {
      it('returns a number if Team has a score', () => {
        const controller = pictionaryAreaControllerWithProps({
          difficulty: 'No difficulty',
          teamA: { letter: 'A', players: [], score: 0 },
          teamB: { letter: 'B', players: [ourPlayer.id, otherPlayers[0].id], score: 1 },
          usedWords: [],
          timer: 120,
          round: 1,
          board: [],
        });
        expect(controller.getTeamAScore).toBe(1);
      });
      it('return 0 if team has no Points', () => {
        const controller = pictionaryAreaControllerWithProps({
          difficulty: 'No difficulty',
          teamA: { letter: 'A', players: [], score: 0 },
          teamB: { letter: 'B', players: [ourPlayer.id, otherPlayers[0].id], score: 1 },
          usedWords: [],
          timer: 120,
          round: 1,
          board: [],
        });
        expect(controller.getTeamAScore).toBe(0);
      });
    });
    describe('getTeamAPlayer', () => {
      it('returns the player in team 1', () => {
        const controller = pictionaryAreaControllerWithProps({
          difficulty: 'No difficulty',
          teamA: { letter: 'A', players: [ourPlayer.id, otherPlayers[0].id], score: 1 },
          teamB: { letter: 'B', players: [], score: 0 },
          usedWords: [],
          timer: 120,
          round: 1,
          board: [],
        });
        expect(controller.getTeamAPlayers).toBeDefined();
      });
    });
    describe('getTeamBPlayers', () => {
      it('returns the player in Team B', () => {
        const controller = pictionaryAreaControllerWithProps({
          difficulty: 'No difficulty',
          teamA: { letter: 'A', players: [], score: 0 },
          teamB: { letter: 'B', players: [ourPlayer.id, otherPlayers[0].id], score: 1 },
          usedWords: [],
          timer: 120,
          round: 1,
          board: [],
        });
        expect(controller.getTeamBPlayers).toBeDefined();
      });
      it('return 0 if team has no Points', () => {
        const controller = pictionaryAreaControllerWithProps({
          difficulty: 'No difficulty',
          teamA: { letter: 'A', players: [], score: 0 },
          teamB: { letter: 'B', players: [ourPlayer.id, otherPlayers[0].id], score: 1 },
          usedWords: [],
          timer: 120,
          round: 1,
          board: [],
        });
        expect(controller.getTeamAScore).toBe(0);
      });
    });
    describe('Drawing and Guessing', () => {
      describe('getDrawer', () => {
        it('returns the assigned drawer that is drawing', () => {
          const controller = pictionaryAreaControllerWithProps({
            difficulty: 'No difficulty',
            teamA: { letter: 'A', players: [], score: 0 },
            teamB: { letter: 'B', players: [ourPlayer.id, otherPlayers[0].id], score: 1 },
            usedWords: [],
            timer: 120,
            round: 1,
            board: [],
            drawer: ourPlayer.id,
          });
          expect(controller.getDrawer()).toBe(ourPlayer);
        });
        it('return undefined if there is no drawer', () => {
          const controller = pictionaryAreaControllerWithProps({
            difficulty: 'No difficulty',
            teamA: { letter: 'A', players: [], score: 0 },
            teamB: { letter: 'B', players: [ourPlayer.id, otherPlayers[0].id], score: 1 },
            usedWords: [],
            timer: 120,
            round: 1,
            board: [],
          });
          expect(controller.getDrawer()).toBeUndefined();
        });
      });
      describe('getGuesser', () => {
        it('returns the assigned guesser that is guessing', () => {
          const controller = pictionaryAreaControllerWithProps({
            difficulty: 'No difficulty',
            teamA: { letter: 'A', players: [], score: 0 },
            teamB: { letter: 'B', players: [ourPlayer.id, otherPlayers[0].id], score: 1 },
            usedWords: [],
            timer: 120,
            round: 1,
            board: [],
            guesser: ourPlayer.id,
          });
          expect(controller.getGuess()).toBe(ourPlayer);
        });
        it('return undefined if there is no drawer', () => {
          const controller = pictionaryAreaControllerWithProps({
            difficulty: 'No difficulty',
            teamA: { letter: 'A', players: [], score: 0 },
            teamB: { letter: 'B', players: [ourPlayer.id, otherPlayers[0].id], score: 1 },
            usedWords: [],
            timer: 120,
            round: 1,
            board: [],
          });
          expect(controller.getGuesser()).toBeUndefined();
        });
      });
      describe('getTeam', () => {
        it('returns the Team that drawing', () => {
          const controller = pictionaryAreaControllerWithProps({
            difficulty: 'No difficulty',
            teamA: { letter: 'A', players: [], score: 0 },
            teamB: { letter: 'B', players: [ourPlayer.id, otherPlayers[0].id], score: 1 },
            usedWords: [],
            timer: 120,
            round: 1,
            board: [],
            guesser: ourPlayer.id,
          });
          expect(controller.getTeam()).toBe('B');
        });
        it('return undefined if there is no drawer', () => {
          const controller = pictionaryAreaControllerWithProps({
            difficulty: 'No difficulty',
            teamA: { letter: 'A', players: [ourPlayer.id, otherPlayers[0].id], score: 0 },
            teamB: { letter: 'B', players: [], score: 1 },
            usedWords: [],
            timer: 120,
            round: 1,
            board: [],
            guesser: ourPlayer.id,
          });
          expect(controller.getTeam()).toBe('A');
        });
      });
    });
    describe('isActive', () => {
      it('returns true if the game is not empty and it is not over', () => {
        const controller = pictionaryAreaControllerWithProps({
          difficulty: 'No difficulty',
          teamA: { letter: 'A', players: [], score: 0 },
          teamB: { letter: 'B', players: [ourPlayer.id, otherPlayers[0].id], score: 1 },
          usedWords: [],
          timer: 120,
          round: 1,
          board: [],
          status: 'IN_PROGRESS',
        });
        expect(controller.isActive()).toBe(true);
      });
      it('returns false if the game is empty', () => {
        const controller = pictionaryAreaControllerWithProps({
          difficulty: 'No difficulty',
          teamA: { letter: 'A', players: [], score: 0 },
          teamB: { letter: 'B', players: [ourPlayer.id, otherPlayers[0].id], score: 1 },
          usedWords: [],
          timer: 120,
          round: 1,
          board: [],
          status: 'OVER',
        });
        expect(controller.isActive()).toBe(false);
      });
    });
  });
  describe('startGame', () => {
    it('sends a StartGame command to the server', async () => {
      const controller = pictionaryAreaControllerWithProps({
        difficulty: 'No difficulty',
        teamA: { letter: 'A', players: [ourPlayer.id, otherPlayers[0].id], score: 0 },
        teamB: { letter: 'B', players: [otherPlayers[1].id, otherPlayers[0].id], score: 0 },
        usedWords: [],
        timer: 120,
        round: 1,
        board: [],
        status: 'WAITING_TO_START',
      });
      const instanceID = nanoid();
      mockTownController.sendInteractableCommand.mockImplementationOnce(async () => {
        return { gameID: instanceID };
      });
      await controller.joinGame();

      mockTownController.sendInteractableCommand.mockClear();
      mockTownController.sendInteractableCommand.mockImplementationOnce(async () => {});
      await controller.startGame('Easy');
      expect(mockTownController.sendInteractableCommand).toHaveBeenCalledWith(controller.id, {
        type: 'StartGame',
        gameID: instanceID,
      });
    });
    it('Does not catch any errors from the server', async () => {
      const controller = pictionaryAreaControllerWithProps({
        difficulty: 'No difficulty',
        teamA: { letter: 'A', players: [ourPlayer.id, otherPlayers[0].id], score: 0 },
        teamB: { letter: 'B', players: [otherPlayers[1].id, otherPlayers[0].id], score: 0 },
        usedWords: [],
        timer: 120,
        round: 1,
        board: [],
        status: 'WAITING_TO_START',
      });
      const instanceID = nanoid();
      mockTownController.sendInteractableCommand.mockImplementationOnce(async () => {
        return { gameID: instanceID };
      });
      await controller.joinGame();

      mockTownController.sendInteractableCommand.mockClear();
      const uniqueError = `Test Error ${nanoid()}`;
      mockTownController.sendInteractableCommand.mockImplementationOnce(async () => {
        throw new Error(uniqueError);
      });
      await expect(() => controller.startGame('Easy')).rejects.toThrowError(uniqueError);
      expect(mockTownController.sendInteractableCommand).toHaveBeenCalledWith(controller.id, {
        type: 'StartGame',
        gameID: instanceID,
      });
    });
    it('throws an error if the game is not startable', async () => {
      const controller = pictionaryAreaControllerWithProps({
        difficulty: 'No difficulty',
        teamA: { letter: 'A', players: [ourPlayer.id, otherPlayers[0].id], score: 0 },
        teamB: { letter: 'B', players: [otherPlayers[1].id, otherPlayers[0].id], score: 0 },
        usedWords: [],
        timer: 120,
        round: 1,
        board: [],
        status: 'IN_PROGRESS',
      });
      const instanceID = nanoid();
      mockTownController.sendInteractableCommand.mockImplementationOnce(async () => {
        return { gameID: instanceID };
      });
      await controller.joinGame();
      mockTownController.sendInteractableCommand.mockClear();
      await expect(controller.startGame('Easy')).rejects.toThrowError();
      expect(mockTownController.sendInteractableCommand).not.toHaveBeenCalled();
    });
  });
  describe('[T1.4] makeMove', () => {
    describe('With no game in progress', () => {
      it('Throws an error if game status is not IN_PROGRESS', async () => {
        const controller = pictionaryAreaControllerWithProps({
          difficulty: 'No difficulty',
          teamA: { letter: 'A', players: [ourPlayer.id, otherPlayers[0].id], score: 0 },
          teamB: { letter: 'B', players: [otherPlayers[1].id, otherPlayers[0].id], score: 0 },
          usedWords: [],
          timer: 120,
          round: 1,
          board: [],
          status: 'WAITING_FOR_PLAYERS',
        });
        await expect(() => controller.makeMove('guess')).rejects.toThrowError(
          NO_GAME_IN_PROGRESS_ERROR,
        );
      });
    });
    describe('With a game in progress', () => {
      let controller: PictionaryAreaController;
      beforeEach(async () => {
        controller = pictionaryAreaControllerWithProps({
          difficulty: 'Easy',
          teamA: { letter: 'A', players: [ourPlayer.id, otherPlayers[0].id], score: 0 },
          teamB: { letter: 'B', players: [otherPlayers[1].id, otherPlayers[0].id], score: 0 },
          usedWords: [],
          timer: 120,
          round: 1,
          board: [],
          status: 'IN_PROGRESS',
        });
      });
      describe('making a guess', () => {
        it('allows the guess', async () => {
          controller.makeMove('guess');
          expect(controller.getGuess).toBe('guess');
        });
      });
    });
  });
});
