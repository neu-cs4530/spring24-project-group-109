import React, { Button } from '@chakra-ui/react';
import { PictionaryGameProps } from './PictionaryBoard';
import useTownController from '../../../../hooks/useTownController';
import { useContext } from 'react';
import pictionaryColorOptions, { PictionaryColorOptionsType } from './PictionaryBoardContext';

// TODO: CHECK ASYNC (NEEDED FOR RESET)
function PictionaryButtons({ pictionaryAreaController }: PictionaryGameProps): JSX.Element {
  const { color } = useContext(pictionaryColorOptions) as PictionaryColorOptionsType;
  const townController = useTownController();
  let eraseButton = <></>;
  let resetButton = <></>;
  return (
    <>
      {pictionaryAreaController.getDrawer()?.id === townController.ourPlayer.id &&
        (eraseButton = (
          <button>
            {color} = {`#${'FFFFFF'}`}
            Erase Button
          </button>
        )) &&
        (resetButton = (
          <button
            onClick={async () => {
              await pictionaryAreaController.reset();
            }}>
            ResetButton
          </button>
        ))}
    </>
  );
}

export default PictionaryButtons;
