import { INVALID_DRAW_MESSAGE } from '../lib/InvalidParametersError';
import { Pixel } from '../types/CoveyTownSocket';
import WhiteBoardModel from './WhiteBoardModel';

describe('WhiteBoardModel', () => {
  let whiteBoardModel: WhiteBoardModel;
  beforeEach(() => {
    whiteBoardModel = new WhiteBoardModel();
  });

  it('should create a new whiteboard', () => {
    expect(whiteBoardModel.board.length).toEqual(10);
  });
  it('should draw a pixel on the whiteboard', () => {
    const pixel: Pixel = { x: 0, y: 0, color: `#${'0000FF'}` };
    whiteBoardModel.draw([pixel]);
    expect(whiteBoardModel.board[0][0]).toBe(`#${'0000FF'}`);
  });
  it('should draw pixels on the whiteboard', () => {
    const pixels: Pixel[] = [0, 1, 2, 3, 4, 5].map(posn => ({
      x: posn,
      y: posn,
      color: `#${'0000FF'}`,
    }));
    whiteBoardModel.draw(pixels);
    [0, 1, 2, 3, 4, 5].forEach(posn =>
      expect(whiteBoardModel.board[posn][posn]).toBe(`#${'0000FF'}`),
    );
  });
  it('should erase a pixel on the whiteboard', () => {
    const pixel: Pixel = { x: 0, y: 0, color: `#${'0000FF'}` };
    whiteBoardModel.draw([pixel]);
    whiteBoardModel.erase([pixel]);
    expect(whiteBoardModel.board[0][0]).toBe('#FFFFFF');
  });

  it('should erase pixels on the whiteboard', () => {
    const pixels: Pixel[] = [0, 1, 2, 3, 4, 5].map(posn => ({
      x: posn,
      y: posn,
      color: `#${'0000FF'}`,
    }));
    whiteBoardModel.draw(pixels);
    whiteBoardModel.erase(pixels);
    [0, 1, 2, 3, 4, 5].forEach(posn =>
      expect(whiteBoardModel.board[posn][posn]).toBe(`#${'FFFFFF'}`),
    );
  });
  it('should reset the whiteboard', () => {
    const pixels: Pixel[] = [0, 1, 2, 3, 4, 5].map(posn => ({
      x: posn,
      y: posn,
      color: `#${'0000FF'}`,
    }));
    whiteBoardModel.draw(pixels);
    whiteBoardModel.reset();
    whiteBoardModel.board.forEach(row => {
      row.forEach(pixel => {
        expect(pixel).toBe(`#${'FFFFFF'}`);
      });
    });
  });

  it('should throw an error when drawing out of bounds', () => {
    const pixel: Pixel = { x: 10, y: 10, color: `#${'0000FF'}` };
    expect(() => whiteBoardModel.draw([pixel])).toThrowError(INVALID_DRAW_MESSAGE);
  });

  it('should throw an error when erasing out of bounds', () => {
    const pixel: Pixel = { x: 10, y: 10, color: `#${'0000FF'}` };
    expect(() => whiteBoardModel.erase([pixel])).toThrowError(INVALID_DRAW_MESSAGE);
  });
});
