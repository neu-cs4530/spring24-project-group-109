import React, { useContext, useEffect, useState } from 'react';
import PictionaryAreaController from '../../../../classes/interactable/PictionaryAreaController';
import useTownController from '../../../../hooks/useTownController';
import { Color } from '../../../../types/CoveyTownSocket';
import { PictionaryColorOptions, PictionaryColorOptionsType } from './PictionaryBoardContext';

// TODO: MAKE A CONSTANTS FILE FOR THESE
const WHITEBOARD_HEIGHT = 10;
const WHITEBOARD_WIDTH = 10;

// TODO: JAVADOC
export type PictionaryGameProps = {
  pictionaryAreaController: PictionaryAreaController;
};

/**
 * A component that renders the Pictionary whiteboard
 *
 * Renders the Pictionary board as a "StyledPictionaryBoard", which consists of a "StyledPictionaryCanvas"
 * and a "StyledPictionaryWord" that displays the word that the drawer is drawing.
 *
 * The board is re-rendered whenever the word changes, and the canvas is re-rendered whenever the drawing
 * changes.
 *
 * If the current player is the drawer, then the "StyledPictionaryCanvas" is clickable, and clicking on it
 * will draw on the canvas. If there is an error drawing, then a toast will be displayed with the error
 * message as the description of the toast.
 *
 * @param gameAreaController the controller for the Pictionary game
 */
export default function PictionaryBoard({
  pictionaryAreaController,
}: PictionaryGameProps): JSX.Element {
  const townController = useTownController();
  const [board, setBoard] = useState<Color[][]>(pictionaryAreaController.board);
  const [shouldDraw, setShouldDraw] = useState<boolean>(false);
  const { color } = useContext(PictionaryColorOptions) as PictionaryColorOptionsType;

  const handleBoardChanges = (newBoard: Color[][]) => {
    setBoard(newBoard);
  };
  useEffect(() => {
    pictionaryAreaController.addListener('boardChanged', handleBoardChanges);
    return () => {
      pictionaryAreaController.removeListener('boardChanged', handleBoardChanges);
    };
  }, [pictionaryAreaController]);

  return (
    <table
      style={{
        border: '1px solid black',
        width: WHITEBOARD_WIDTH * 10,
        height: WHITEBOARD_HEIGHT * 10,
      }}>
      <tbody>
        {board.map((row, rowIndex) => {
          return (
            <tr key={rowIndex}>
              {row.map((_, colIndex) => {
                return (
                  <td
                    key={rowIndex * WHITEBOARD_WIDTH + colIndex}
                    style={{
                      width: 10, // MIGHT NEED TO MAKE WHITEBOARD PIXEL
                      height: 10,
                      backgroundColor: board[rowIndex][colIndex],
                    }}
                    onMouseDown={() => setShouldDraw(true)}
                    onMouseUp={() => setShouldDraw(false)}
                    onMouseEnter={async () => {
                      if (
                        shouldDraw &&
                        pictionaryAreaController.getDrawer()?.id === townController.ourPlayer.id
                      ) {
                        await pictionaryAreaController.draw([
                          { x: rowIndex, y: colIndex, color: color },
                        ]);
                      }
                    }}
                  />
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
