import React, { useEffect, useState } from 'react';
import { useInteractableAreaController } from '../../../../classes/TownController';
import PictionaryAreaController from '../../../../classes/interactable/PictionaryAreaController';
import useTownController from '../../../../hooks/useTownController';
import { Color, GameResult, GameStatus, InteractableID } from '../../../../types/CoveyTownSocket';
import PlayerController from '../../../../classes/PlayerController';
import { Button, Container, Flex, Heading, Input, useToast } from '@chakra-ui/react';
import pictionaryColorOptions from './PictionaryBoardContext';
import PictionaryBoard from './PictionaryBoard';
import PictionaryColor from './PictionaryColor';
import PictionaryButtons from './PictionaryButtons';
import { List, ListItem } from '@chakra-ui/react';

export default function PictionaryArea({
  interactableID,
}: {
  interactableID: InteractableID;
}): JSX.Element {
  const pictionaryAreaController =
    useInteractableAreaController<PictionaryAreaController>(interactableID);
  const townController = useTownController();

  const [drawer, setDrawer] = useState<PlayerController | undefined>(
    pictionaryAreaController.getDrawer(),
  );
  const [guesser, setGuesser] = useState<PlayerController | undefined>(
    pictionaryAreaController.getGuesser(),
  );
  const [round, setRound] = useState<number>(pictionaryAreaController.getRound());
  const [teamA, setTeamA] = useState<PlayerController[]>(
    pictionaryAreaController.getTeamAPlayers(),
  );
  const [teamB, setTeamB] = useState<PlayerController[]>(
    pictionaryAreaController.getTeamBPlayers(),
  );

  const [word, setWord] = useState<string>(pictionaryAreaController.getWord());
  const [guess, setGuess] = useState<string>(pictionaryAreaController.getGuess());

  const [aScore, setAScore] = useState<number>(pictionaryAreaController.getTeamAScore());
  const [bScore, setBScore] = useState<number>(pictionaryAreaController.getTeamBScore());

  const [joiningGame, setJoiningGame] = useState(false);
  const [gameStatus, setGameStatus] = useState<GameStatus>(pictionaryAreaController.status);

  const toast = useToast();

  //for updating round state
  useEffect(() => {
    const updateGameState = () => {
      setTeamA(pictionaryAreaController.getTeamAPlayers());
      setTeamB(pictionaryAreaController.getTeamBPlayers());
      setWord(pictionaryAreaController.getWord());
      setWord(pictionaryAreaController.getGuess());
      setDrawer(pictionaryAreaController.getDrawer());
      setGuesser(pictionaryAreaController.getGuesser());
      setRound(pictionaryAreaController.getRound());
      setGameStatus(pictionaryAreaController.status);
    };
    const onGameEnd = () => {
      const winner = pictionaryAreaController.winner;
      if (!winner) {
        toast({
          title: 'Game over',
          description: 'Game ended without a winner',
          status: 'info',
        });
      }
    };
    pictionaryAreaController.addListener('gameUpdated', updateGameState);
    pictionaryAreaController.addListener('gameEnd', onGameEnd);
    return () => {
      pictionaryAreaController.removeListener('gameUpdated', updateGameState);
      pictionaryAreaController.removeListener('gameEnd', onGameEnd);
    };
  }, [townController, pictionaryAreaController, toast]);

  let gameStatusText = <></>;

  if (gameStatus === 'WAITING_FOR_PLAYERS') {
    const joinGameButton = (
      <Button
        onClick={async () => {
          setJoiningGame(true);
          try {
            await pictionaryAreaController.joinGame();
          } catch (e) {
            console.error(e);
            toast({
              title: 'Error joining test game',
              description: (e as Error).toString(),
              status: 'error',
            });
          }
          setJoiningGame(false);
        }}
        isLoading={joiningGame}
        disabled={joiningGame}>
        Join New Game
      </Button>
    );
    gameStatusText = <b>Game . {joinGameButton}</b>;
  if (gameStatus === 'WAITING_TO_START') {

  }

  return (
    <>
      {gameStatusText}
      <List aria-label='list of players in the game'>
        <ListItem>Team A: {teamA.map(id => id?.userName) || '(No player yet!)'}</ListItem>
        <ListItem>Team B: {teamB.map(id => id?.userName) || '(No player yet!)'}</ListItem>
      </List>
    </>
  );
}
