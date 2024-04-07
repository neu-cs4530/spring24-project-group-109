import React, { Button } from '@chakra-ui/react';
import { PictionaryGameProps } from './PictionaryBoard';
import useTownController from '../../../../hooks/useTownController';

/**
 * Component that renders the erase and reset buttons for the Pictionary whiteboard
 */
function PictionaryButtons({ pictionaryAreaController }: PictionaryGameProps): JSX.Element {
  const townController = useTownController();
  const resetButton = (
    <Button
      onClick={async () => {
        await pictionaryAreaController.reset();
      }}>
      ResetButton
    </Button>
  );
  return (
    <>{pictionaryAreaController.getDrawer()?.id === townController.ourPlayer.id && resetButton}</>
  );
}

export default PictionaryButtons;
