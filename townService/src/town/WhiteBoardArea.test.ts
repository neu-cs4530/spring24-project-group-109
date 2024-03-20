import WhiteBoardArea from './WhiteBoardArea';
import { Pixel, Player } from '../types/CoveyTownSocket';
import { createPlayerForTesting } from '../TestUtils';
import PictionaryGame from './games/PictionaryGame';
import { INVALID_DRAWER_MESSAGE } from '../lib/InvalidParametersError';

// To Do: Add test for throwing an error if there is no board but that is not possible in the current implementation
// Might be able to get rid of it the code in the WhiteBoardArea class
describe('WhiteBoardArea', () => {
  let whiteBoardArea: WhiteBoardArea;
  // let pixel: Pixel;
  let player: Player;
  let player2: Player;
  let game: PictionaryGame;
  let interactableUpdateSpy: jest.SpyInstance;
  let interactableUpdateSpyE: jest.SpyInstance;
  let interactableUpdateSpyR: jest.SpyInstance;
  beforeEach(() => {
    whiteBoardArea = new WhiteBoardArea();
    player = createPlayerForTesting();
    game = new PictionaryGame();
    game.state.drawer = player.id;
    player2 = createPlayerForTesting();
    game.state.guesser = player2.id;
    interactableUpdateSpy = jest.spyOn(whiteBoardArea, 'draw');
    interactableUpdateSpyE = jest.spyOn(whiteBoardArea, 'erase');
    interactableUpdateSpyR = jest.spyOn(whiteBoardArea, 'reset');
  });
  describe('handleCommand for draw', () => {
    test('command should called', () => {
      const pixel: Pixel = { x: 0, y: 0, color: `#${'0000FF'}` };
      interactableUpdateSpy.mockClear();
      expect(whiteBoardArea.handleCommand({ type: 'DrawCommand', drawing: [pixel] }, player, game));
      expect(interactableUpdateSpy).toHaveBeenCalled();
    });
  });
  describe('handleCommand for erase', () => {
    test('command should called', () => {
      const pixel: Pixel = { x: 0, y: 0, color: `#${'0000FF'}` };
      interactableUpdateSpy.mockClear();
      expect(
        whiteBoardArea.handleCommand({ type: 'EraseCommand', drawing: [pixel] }, player, game),
      );
      expect(interactableUpdateSpyE).toHaveBeenCalled();
    });
  });
  describe('handleCommand for reset', () => {
    test('command should called', () => {
      const pixel: Pixel = { x: 0, y: 0, color: `#${'0000FF'}` };
      interactableUpdateSpy.mockClear();
      expect(
        whiteBoardArea.handleCommand({ type: 'ResetCommand', drawing: [pixel] }, player, game),
      );
      expect(interactableUpdateSpyR).toHaveBeenCalled();
    });
  });
  describe('Player', () => {
    test('drawing but is the guesser', () => {
      const pixel: Pixel = { x: 0, y: 0, color: `#${'0000FF'}` };
      expect(() =>
        whiteBoardArea.handleCommand({ type: 'DrawCommand', drawing: [pixel] }, player2, game),
      ).toThrowError(INVALID_DRAWER_MESSAGE);
    });
  });
});
