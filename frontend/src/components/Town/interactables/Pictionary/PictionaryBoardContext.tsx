import { createContext } from 'react';
import { Color } from '../../../../types/CoveyTownSocket';

// TODO: JAVA DOCS
export type PictionaryColorOptionsType = {
  color: Color;
  setColor: (color: Color) => void;
};
// eslint-disable-next-line @typescript-eslint/naming-convention
export const PictionaryColorOptions = createContext<PictionaryColorOptionsType | undefined>(
  undefined,
);
