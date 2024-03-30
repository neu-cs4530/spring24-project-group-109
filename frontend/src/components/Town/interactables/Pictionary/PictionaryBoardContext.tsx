import { Color } from '../../../../types/CoveyTownSocket';
import React from 'react';

// TODO: JAVA DOCS
export type PictionaryColorOptionsType = {
  color: Color;
  setColor: (color: Color) => void;
};
const pictionaryColorOptions = React.createContext<PictionaryColorOptionsType | undefined>(
  undefined,
);

export default pictionaryColorOptions;
