import React, { useContext } from 'react';
import pictionaryColorOptions, { PictionaryColorOptionsType } from './PictionaryBoardContext';
import { Box } from '@chakra-ui/react';
import { CirclePicker, ColorResult } from 'react-color';

/**
 * Component that allows the user to select a color for the Pictionary game
 */
export default function PictionaryColor(): JSX.Element {
  const { color, setColor } = useContext(pictionaryColorOptions) as PictionaryColorOptionsType;

  // TODO - can change to type any and explain linter error (turns yellow)
  const handleColorChange = (newColor: ColorResult) => {
    setColor(`${newColor.hex}`);
  };
  return (
    <Box mt='10px' mb='10px'>
      <CirclePicker color={color.substring(2)} onChangeComplete={handleColorChange} />
    </Box>
  );
}
