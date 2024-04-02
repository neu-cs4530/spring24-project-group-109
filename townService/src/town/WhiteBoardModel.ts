import InvalidParametersError, { INVALID_DRAW_MESSAGE } from '../lib/InvalidParametersError';
import { Color, Pixel } from '../types/CoveyTownSocket';

const WHITEBOARD_HEIGHT = 30;
const WHITEBOARD_WIDTH = 30;

/**
 * WhiteBoardModel is a class that represents a whiteboard.
 */
export default class WhiteBoardModel {
  board: Color[][]; // Do we need to initialize this? or add const/let

  public constructor() {
    this.board = this._getBoard();
  }

  /**
   * Draws a given drawing on the whiteboard. The drawing is a list of pixels.
   * @param drawing The drawing to be drawn on the whiteboard.
   * @throws InvalidParametersError if the drawing is out of bounds.
   * @returns void and updates the whiteboard.
   */
  public draw(drawing: Pixel[]): void {
    drawing.forEach((pixel: Pixel) => {
      if (
        pixel.x < 0 ||
        pixel.x >= WHITEBOARD_HEIGHT ||
        pixel.y < 0 ||
        pixel.y >= WHITEBOARD_WIDTH
      ) {
        throw new InvalidParametersError(INVALID_DRAW_MESSAGE);
      }
    });
    drawing.forEach((pixel: Pixel) => {
      this.board[pixel.x][pixel.y] = pixel.color;
    });
  }

  /**
   * Erase a given drawing on the whiteboard. The drawing is a list of pixels.
   * @param drawing The drawing to be erased on the whiteboard.
   * @throws InvalidParametersError if the drawing is out of bounds.
   * @returns void and updates the whiteboard.
   */
  public erase(drawing: Pixel[]): void {
    drawing.forEach((pixel: Pixel) => {
      if (
        pixel.x < 0 ||
        pixel.x >= WHITEBOARD_HEIGHT ||
        pixel.y < 0 ||
        pixel.y >= WHITEBOARD_WIDTH
      ) {
        throw new InvalidParametersError(INVALID_DRAW_MESSAGE);
      }
    });
    drawing.forEach((pixel: Pixel) => {
      this.board[pixel.x][pixel.y] = `#${'FFFFFF'}`;
    });
  }

  /**
   * Reset the whiteboard to its initial blank state.
   */
  public reset(): void {
    this.board = this._getBoard();
  }

  private _getBoard(): Color[][] {
    const board: Color[][] = [];
    for (let i = 0; i < WHITEBOARD_HEIGHT; i += 1) {
      const row: Color[] = [];
      for (let j = 0; j < WHITEBOARD_WIDTH; j += 1) {
        row.push(`#${'FFFFFF'}`);
      }
      board.push(row);
    }
    return board;
  }
}
