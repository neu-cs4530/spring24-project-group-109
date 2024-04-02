import WhiteBoardArea from './WhiteBoardArea';
import { Pixel } from '../types/CoveyTownSocket';

// To Do: Add test for throwing an error if there is no board but that is not possible in the current implementation
// Might be able to get rid of it the code in the WhiteBoardArea class
describe('WhiteBoardArea', () => {
  let whiteBoardArea: WhiteBoardArea;
  let interactableUpdateSpy: jest.SpyInstance;
  let interactableUpdateSpyE: jest.SpyInstance;
  let interactableUpdateSpyR: jest.SpyInstance;
  beforeEach(() => {
    whiteBoardArea = new WhiteBoardArea();
    interactableUpdateSpy = jest.spyOn(whiteBoardArea, 'draw');
    interactableUpdateSpyE = jest.spyOn(whiteBoardArea, 'erase');
    interactableUpdateSpyR = jest.spyOn(whiteBoardArea, 'reset');
  });
  describe('handleCommand for draw', () => {
    test('command should called', () => {
      const pixel: Pixel = { x: 0, y: 0, color: `#${'0000FF'}` };
      interactableUpdateSpy.mockClear();
      expect(whiteBoardArea.handleCommand({ type: 'DrawCommand', drawing: [pixel] }));
      expect(interactableUpdateSpy).toHaveBeenCalled();
    });
  });
  describe('handleCommand for erase', () => {
    test('command should called', () => {
      const pixel: Pixel = { x: 0, y: 0, color: `#${'0000FF'}` };
      interactableUpdateSpy.mockClear();
      expect(whiteBoardArea.handleCommand({ type: 'EraseCommand', drawing: [pixel] }));
      expect(interactableUpdateSpyE).toHaveBeenCalled();
    });
  });
  describe('handleCommand for reset', () => {
    test('command should called', () => {
      const pixel: Pixel = { x: 0, y: 0, color: `#${'0000FF'}` };
      interactableUpdateSpy.mockClear();
      expect(whiteBoardArea.handleCommand({ type: 'ResetCommand', drawing: [pixel] }));
      expect(interactableUpdateSpyR).toHaveBeenCalled();
    });
  });
});
