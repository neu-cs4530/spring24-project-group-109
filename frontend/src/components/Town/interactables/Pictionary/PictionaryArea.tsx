import { Button, Container, List, ListItem, useToast } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import PictionaryAreaController from '../../../../classes/interactable/PictionaryAreaController';
import PlayerController from '../../../../classes/PlayerController';
import { useInteractableAreaController } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import { GameStatus, InteractableID } from '../../../../types/CoveyTownSocket';

export default function PictionaryArea({
  interactableID,
}: {
  interactableID: InteractableID;
}): JSX.Element {
  //   const gameAreaController =
  //     useInteractableAreaController<PictionaryAreaController>(interactableID);
  //   const townController = useTownController();

  // state variables

  //useEffect
  return <Button>Test</Button>;
}
