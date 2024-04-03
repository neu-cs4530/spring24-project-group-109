import { Color } from '../../../../types/CoveyTownSocket';
import React from 'react';

/**
 * The type of the context that provides the color options for the Pictionary game
 */
export type PictionaryColorOptionsType = {
  color: Color;
  setColor: (color: Color) => void;
};
const pictionaryColorOptions = React.createContext<PictionaryColorOptionsType | undefined>(
  undefined,
);

export default pictionaryColorOptions;
