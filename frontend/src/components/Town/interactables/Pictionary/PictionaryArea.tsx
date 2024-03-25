import { useEffect, useState } from 'react';
import { useInteractableAreaController } from '../../../../classes/TownController';
import PictionaryAreaController from '../../../../classes/interactable/PictionaryAreaController';
import useTownController from '../../../../hooks/useTownController';
import { Color, GameResult, GameStatus, InteractableID } from '../../../../types/CoveyTownSocket';
import PlayerController from '../../../../classes/PlayerController';
import { useToast } from '@chakra-ui/react';
import { set } from 'lodash';

function PictionaryArea({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  const pictionaryAreaController =
    useInteractableAreaController<PictionaryAreaController>(interactableID);
  const townController = useTownController();
  const [drawer, setDrawer] = useState<PlayerController | undefined>(
    pictionaryAreaController.getDrawer,
  );
  const [guesser, setGuesser] = useState<PlayerController | undefined>(
    pictionaryAreaController.getGuesser,
  );
  const [word, setWord] = useState<string>(pictionaryAreaController.getWord);
  // TODO: ADD GUESS COMPONENT TO BACK END
  const [guess, setGuess] = useState<string>(pictionaryAreaController.getGuess);
  const [color, setColor] = useState<Color>('#000000');
  const [history, setHistory] = useState<GameResult[]>(pictionaryAreaController.history);
  // TODO: FIND STATUS
  const [gameStatus, setGameStatus] = useState<GameStatus>(pictionaryAreaController.status);
  const [observers, setObservers] = useState<PlayerController[]>(
    pictionaryAreaController.observers,
  );
  const [joiningGame, setJoiningGame] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const updateGameState = () => {
      setHistory(pictionaryAreaController.history);
      setGameStatus(pictionaryAreaController.status);
      setObservers(pictionaryAreaController.observers);
      setDrawer(pictionaryAreaController.getDrawer);
      setGuesser(pictionaryAreaController.getGuesser);
    };
    pictionaryAreaController.addListener('gameUpdated', updateGameState);
    const onGameEnd = () => {};
    pictionaryAreaController.addListener('gameEnd', onGameEnd);
    return () => {
      pictionaryAreaController.removeListener('gameUpdated', updateGameState);
      pictionaryAreaController.removeListener('gameEnd', onGameEnd);
    };
  }, [townController, pictionaryAreaController, toast]);
}
