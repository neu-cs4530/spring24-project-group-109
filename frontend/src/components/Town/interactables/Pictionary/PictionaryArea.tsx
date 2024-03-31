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
  const [guess, setGuess] = useState<string>(pictionaryAreaController.getGuess);
  const [color, setColor] = useState<Color>('#000000');
  const [history, setHistory] = useState<GameResult[]>(pictionaryAreaController.history);
  const [gameStatus, setGameStatus] = useState<GameStatus>(pictionaryAreaController.status);
  //   const [observers, setObservers] = useState<PlayerController[]>(
  //     pictionaryAreaController.observers,
  //   );
  const [timer, setTimer] = useState<number>(pictionaryAreaController.getTimer);
  const [joiningGame, setJoiningGame] = useState(false);
  const [startingGame, setStartingGame] = useState(false);
  const [leavingGame, setLeavingGame] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const updateGameState = () => {
      setHistory(pictionaryAreaController.history);
      setGameStatus(pictionaryAreaController.status);
      // setObservers(pictionaryAreaController.observers);
      setDrawer(pictionaryAreaController.getDrawer);
      setGuesser(pictionaryAreaController.getGuesser);
      setWord(pictionaryAreaController.getWord);
      setTimer(pictionaryAreaController.getTimer);
    };
    pictionaryAreaController.addListener('gameUpdated', updateGameState);
    const onGameEnd = () => {
      const winner = pictionaryAreaController.winner;
      if (!winner) {
        toast({
          title: 'Game over',
          description: 'Game ended in a tie',
          status: 'info',
        });
      } else if (winner === townController.ourPlayer) {
        toast({
          title: 'Game over',
          description: 'You won!',
          status: 'success',
        });
      } else {
        toast({
          title: 'Game over',
          description: `You lost :(`,
          status: 'error',
        });
      }
    };
    pictionaryAreaController.addListener('gameEnd', onGameEnd);
    return () => {
      pictionaryAreaController.removeListener('gameUpdated', updateGameState);
      pictionaryAreaController.removeListener('gameEnd', onGameEnd);
    };
  }, [townController, pictionaryAreaController, toast]);

  const gameStatusTextPlayers = (
    <>
      Game in {'WAITING_FOR_PLAYERS'}, teamA:{pictionaryAreaController.getTeamAPlayers}, teamB:
      {pictionaryAreaController.getTeamBPlayers}
      {pictionaryAreaController.getTeam}
    </>
  );
  const gameStatusTextScore = (
    <>
      Game in progress, round: {pictionaryAreaController.getRound}, currently:{' '}
      {pictionaryAreaController.getTeam} turn, Team A score:{' '}
      {pictionaryAreaController.getTeamAScore}, Team B score:{' '}
      {pictionaryAreaController.getTeamBScore}
    </>
  );
  if (gameStatus === 'IN_PROGRESS') {
    // HOLD
  } else {
    // let joinGameButton = <></>;
    if (
      pictionaryAreaController.status === 'WAITING_FOR_PLAYERS' &&
      !pictionaryAreaController.isPlayer
    ) {
      //   joinGameButton = (
      //     <Button
      //       type='button'
      //       onClick={async () => {
      //         setJoiningGame(true);
      //         try {
      //           await pictionaryAreaController.joinGame();
      //         } catch (err) {
      //           toast({
      //             title: 'Error joining game',
      //             description: (err as Error).toString(),
      //             status: 'error',
      //           });
      //         }
      //         setJoiningGame(false);
      //       }}
      //       isLoading={joiningGame}
      //       disabled={joiningGame}>
      //       Join Game
      //     </Button>
      //   );
    }
  }
  return (
    // TODO PUT EMH BUTTONS IN COLUMNS
    <Heading as='h4'>
      {pictionaryAreaController.status === 'WAITING_FOR_PLAYERS' ? (
        <Flex flexDirection='row'>
          {gameStatusTextPlayers}
          <Button
            type='button'
            onClick={async () => {
              setStartingGame(true);
              await pictionaryAreaController.startGame('Easy');
              setStartingGame(false);
            }}
            isLoading={startingGame}
            disabled={startingGame}>
            Start Easy Game
          </Button>
          <Button
            type='button'
            onClick={async () => {
              setStartingGame(true);
              await pictionaryAreaController.startGame('Medium');
              setStartingGame(false);
            }}
            isLoading={startingGame}
            disabled={startingGame}>
            Start Medium Game
          </Button>
          <Button
            type='button'
            onClick={async () => {
              setStartingGame(true);
              await pictionaryAreaController.startGame('Hard');
              setStartingGame(false);
            }}
            isLoading={startingGame}
            disabled={startingGame}>
            Start Hard Game
          </Button>
        </Flex>
      ) : (
        <pictionaryColorOptions.Provider value={{ color, setColor }}>
          <Flex flexDirection='row'>
            {gameStatusTextScore}
            {timer}
            <Container flexDirection='column'>
              <Heading as='h4'>{pictionaryAreaController.getDrawer() ? `${word}` : ''}</Heading>
              <PictionaryBoard
                pictionaryAreaController={pictionaryAreaController}></PictionaryBoard>
              <Flex flexDirection='row'>
                <PictionaryColor></PictionaryColor>
                <PictionaryButtons
                  pictionaryAreaController={pictionaryAreaController}></PictionaryButtons>
              </Flex>
            </Container>
            <Container flexDirection='column'>
              <Button
                type='button'
                onClick={async () => {
                  setLeavingGame(true);
                  await pictionaryAreaController.leaveGame();
                  setLeavingGame(false);
                }}
                isLoading={leavingGame}
                disabled={leavingGame}>
                Leave Game
              </Button>
              <Input
                placeholder='Guess'
                value={guess}
                onChange={event => setGuess(event.target.value)}
              />
              <Button
                onClick={async () => {
                  try {
                    await pictionaryAreaController.makeMove(guess).then(() => {
                      setGuess('');
                      if (guess == word) {
                        toast({
                          title: 'Correct Guess!',
                          description: 'You guessed the word!',
                          status: 'success',
                        });
                      } else {
                        toast({
                          title: 'Incorrect Guess',
                          description: 'Try again',
                        });
                      }
                    });
                  } catch (err) {
                    toast({
                      title: 'Error making move',
                      description: (err as Error).toString(),
                      status: 'error',
                    });
                  }
                }}>
                Guess
              </Button>
            </Container>
          </Flex>
        </pictionaryColorOptions.Provider>
      )}
    </Heading>
    // TODO: FIGURE OUT WHAT THE COLUMN THINGS IS
  );
}
export default PictionaryArea;
