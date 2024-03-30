import React, { useContext } from 'react';
import pictionaryColorOptions, { PictionaryColorOptionsType } from './PictionaryBoardContext';
import { Box } from '@chakra-ui/react';
import { CirclePicker, ColorResult } from 'react-color';

export default function PictionaryColor(): JSX.Element {
  const { color, setColor } = useContext(pictionaryColorOptions) as PictionaryColorOptionsType;

  const handleColorChange = (newColor: ColorResult) => {
    setColor(`#${newColor.hex}`);
  };
  return (
    <Box mt='10px' mb='10px'>
      <CirclePicker color={color} onChangeComplete={handleColorChange} />
    </Box>
  );
}
