import React, { useContext } from 'react';
import pictionaryColorOptions, { PictionaryColorOptionsType } from './PictionaryBoardContext';
import { Box } from '@chakra-ui/react';
import { CirclePicker } from 'react-color';

/**
 * Component that allows the user to select a color for the Pictionary game
 */
export default function PictionaryColor(): JSX.Element {
  const { color, setColor } = useContext(pictionaryColorOptions) as PictionaryColorOptionsType;

  // Made newColor type to be any in order to be able to convert between a Color type and a ColorResult hex type
  const handleColorChange = (newColor: any) => {
    setColor(newColor.hex);
  };
  return (
    <Box mt='10px' mb='10px'>
      <CirclePicker color={color.substring(2)} onChangeComplete={handleColorChange} />
    </Box>
  );
}
