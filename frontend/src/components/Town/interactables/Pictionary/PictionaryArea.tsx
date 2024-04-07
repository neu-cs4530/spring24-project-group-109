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

  // const [aScore, setAScore] = useState<number>(pictionaryAreaController.getTeamAScore());
  // const [bScore, setBScore] = useState<number>(pictionaryAreaController.getTeamBScore());

  const [joiningGame, setJoiningGame] = useState(false);
  const [startingGame, setStartingGame] = useState(false);
  const [leavingGame, setLeavingGame] = useState(false);
  const [gameStatus, setGameStatus] = useState<GameStatus>(pictionaryAreaController.status);
  //const [timer, setTimer] = useState<number>(pictionaryAreaController.getTimer());
  const [timer, setTimer] = useState<number>(60);
  const [color, setColor] = useState<Color>('#000000');
  const [board, setBoard] = useState(pictionaryAreaController.board);

  const toast = useToast();

  // TODO: TOAST FOR ROUND SWITCH / TIMER IS ABOUT TO RUN OUT

  //for updating the timer every second of the game
  useEffect(() => {
    const interval = setInterval(() => {
      if (timer > 0) {
        setTimer(timer - 1);
        pictionaryAreaController.tickDown();
      } else if (timer <= 0) {
        pictionaryAreaController.tickDown();
        setTimer(60);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [timer, pictionaryAreaController]);

  //for updating round state
  useEffect(() => {
    //console.log('enter use effect');
    const updateGameState = () => {
      setTeamA(pictionaryAreaController.getTeamAPlayers());
      setTeamB(pictionaryAreaController.getTeamBPlayers());
      setWord(pictionaryAreaController.getWord());
      setGuess(pictionaryAreaController.getGuess());
      setDrawer(pictionaryAreaController.getDrawer());
      setGuesser(pictionaryAreaController.getGuesser());
      setRound(pictionaryAreaController.getRound());
      setGameStatus(pictionaryAreaController.status);
      setBoard(pictionaryAreaController.board);
      // setColor(pictionaryAreaController.getColor());
    };
    const onGameEnd = () => {
      const winner = pictionaryAreaController.winner;
      if (winner === ' ') {
        toast({
          title: 'Game over',
          description: 'Game ended in a tie',
          status: 'info',
        });
      } else {
        toast({
          title: 'Game over',
          description: `Winner: Team ` + winner,
          status: 'error',
        });
      }
    };
    //console.log('before game updating');
    pictionaryAreaController.addListener('gameUpdated', updateGameState);
    pictionaryAreaController.addListener('gameEnd', onGameEnd);
    return () => {
      //console.log('after game updating');
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
    gameStatusText = <b>{joinGameButton}</b>;
    // if (gameStatus === 'WAITING_TO_START') {
    //   gameStatusText = <b>Game in {gameStatus}</b>;
    // }
  }
  const gameStatusTextPlayers = (
    <>
      Game is{' '}
      {gameStatus === 'WAITING_TO_START' ? (
        <>
          waiting for difficulty selection. <br /> Team A:{' '}
          {teamA.map(id => id?.userName + ', ').join('\n')}
          Team B: <br /> {' ' + teamB.map(id => id?.userName + ', ').join('\n')} <br />
        </>
      ) : (
        <>
          over! Team A score: {pictionaryAreaController.getTeamAScore()}, Team B score:{' '}
          {pictionaryAreaController.getTeamBScore()}{' '}
        </>
      )}
    </>
  );
  const gameStatusTextScore = (
    <>
      Game in progress Round: {pictionaryAreaController.getRound() + 1} Currently:{' '}
      {pictionaryAreaController.getTeam()} turn <br /> Team A score:{' '}
      {pictionaryAreaController.getTeamAScore()}, Team B score:{' '}
      {pictionaryAreaController.getTeamBScore()}
    </>
  );

  return (
    <Heading size='s'>
      {pictionaryAreaController.status === 'WAITING_FOR_PLAYERS' ? (
        <>
          {gameStatusText}
          <List aria-label='list of players in the game'>
            <ListItem>
              Team A: {teamA.map(id => id?.userName + ', ').join('\n') || '(No player yet!)\n'}
            </ListItem>
            <ListItem>
              Team B: {teamB.map(id => id?.userName + ', ').join('\n') || '(No player yet!)\n'}
            </ListItem>
          </List>
        </>
      ) : (pictionaryAreaController.status === 'WAITING_TO_START' &&
          pictionaryAreaController.getDifficulty() === 'No difficulty') ||
        pictionaryAreaController.status === 'OVER' ? (
        <Flex flexDirection='column'>
          {gameStatusTextPlayers}
          <br />
          <Flex flexDirection='row'>
            <Flex flexDirection='row'>
              <Button
                type='button'
                onClick={async () => {
                  setStartingGame(true);
                  await pictionaryAreaController.startGame('Easy');
                  setStartingGame(false);
                }}
                isLoading={startingGame}
                disabled={startingGame}>
                Easy Game
              </Button>
            </Flex>
            <Flex flexDirection='column'>
              <Button
                type='button'
                onClick={async () => {
                  setStartingGame(true);
                  await pictionaryAreaController.startGame('Medium');
                  setStartingGame(false);
                }}
                isLoading={startingGame}
                disabled={startingGame}>
                Medium Game
              </Button>{' '}
              <br />
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
            </Flex>
            <Flex flexDirection='column'>
              <Button
                type='button'
                onClick={async () => {
                  setStartingGame(true);
                  await pictionaryAreaController.startGame('Hard');
                  setStartingGame(false);
                }}
                isLoading={startingGame}
                disabled={startingGame}>
                Hard Game
              </Button>
            </Flex>
          </Flex>
        </Flex>
      ) : (
        <pictionaryColorOptions.Provider value={{ color: color, setColor: setColor }}>
          <Flex flexDirection='column'>
            <Heading size='s'>{gameStatusTextScore}</Heading>
            Time left: {timer + ' seconds'} <br />
            <Container flexDirection='column'>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Heading size='lg'>
                  {pictionaryAreaController.getDrawer()?.id === townController.ourPlayer.id
                    ? `Word: ${word}`
                    : ''}
                </Heading>
                Draw slowly!
                <PictionaryBoard
                  pictionaryAreaController={pictionaryAreaController}></PictionaryBoard>
              </div>
              <Flex flexDirection='row'>
                {pictionaryAreaController.getDrawer()?.id === townController.ourPlayer.id ? (
                  <PictionaryColor></PictionaryColor>
                ) : (
                  ''
                )}
                <Flex flexDirection='column'>
                  {' '}
                  <br />
                  <PictionaryButtons
                    pictionaryAreaController={pictionaryAreaController}></PictionaryButtons>{' '}
                  <br />
                  {pictionaryAreaController.getDrawer()?.id === townController.ourPlayer.id ? (
                    <Button
                      type='button'
                      onClick={async () => {
                        setColor('#FFFFFF');
                      }}>
                      Erase Button
                    </Button>
                  ) : (
                    ''
                  )}
                </Flex>
              </Flex>
            </Container>
            <Container flexDirection='column'>
              {' '}
              <br />
              {pictionaryAreaController.getGuesser()?.id === townController.ourPlayer.id ? (
                <Flex flexDirection='row'>
                  Make a guess with no spaces
                  <Input
                    placeholder='Guess'
                    value={guess}
                    onChange={event => setGuess(event.target.value)}
                  />
                  <Flex flexDirection='column'>
                    <Button
                      onClick={async () => {
                        try {
                          await pictionaryAreaController.makeMove(guess).then(() => {
                            setGuess('');
                            if (guess === word) {
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
                  </Flex>
                  <br />
                </Flex>
              ) : (
                ''
              )}
              <Flex flexDirection='column'>
                <br />
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
              </Flex>
            </Container>
          </Flex>
        </pictionaryColorOptions.Provider>
      )}
    </Heading>
  );
}
