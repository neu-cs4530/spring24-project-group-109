import React from '@chakra-ui/react';
import { PictionaryGameProps } from './PictionaryBoard';
import useTownController from '../../../../hooks/useTownController';
import { useContext } from 'react';
import pictionaryColorOptions, { PictionaryColorOptionsType } from './PictionaryBoardContext';

/**
 * Component that renders the erase and reset buttons for the Pictionary whiteboard
 */
function PictionaryButtons({ pictionaryAreaController }: PictionaryGameProps): JSX.Element {
  const { color } = useContext(pictionaryColorOptions) as PictionaryColorOptionsType;
  const townController = useTownController();
  const eraseButton = (
    <button>
      {color} = {`#${'FFFFFF'}`}
      Erase Button
    </button>
  );
  const resetButton = (
    <button
      onClick={async () => {
        await pictionaryAreaController.reset();
      }}>
      ResetButton
    </button>
  );
  return (
    <>
      {pictionaryAreaController.getDrawer()?.id === townController.ourPlayer.id &&
        eraseButton &&
        resetButton}
    </>
  );
}

export default PictionaryButtons;
