import React, { useEffect, useState, useRef } from 'react';
import { useInteractableAreaController } from '../../../../classes/TownController';
import PictionaryAreaController from '../../../../classes/interactable/PictionaryAreaController';
import useTownController from '../../../../hooks/useTownController';
import { Color, GameStatus, InteractableID } from '../../../../types/CoveyTownSocket';
import PlayerController from '../../../../classes/PlayerController';
import { Button, Container, Flex, Heading, Input, useToast } from '@chakra-ui/react';
import pictionaryColorOptions from './PictionaryBoardContext';
import PictionaryBoard from './PictionaryBoard';
import PictionaryColor from './PictionaryColor';
import PictionaryButtons from './PictionaryButtons';
import { List, ListItem } from '@chakra-ui/react';

/**
 * The PictionaryArea component renders the Pictionary game area.
 * It renders the current state of the area, optionally allowing the player to join the game.
 *
 * It uses Chakra-UI components (does not use other GUI widgets)
 *
 * It uses the PictionaryAreaController to get the current state of the game.
 * It listens for the 'gameUpdated' and 'gameEnd' events on the controller, and re-renders accordingly.
 * It subscribes to these events when the component mounts, and unsubscribes when the component unmounts. It also unsubscribes when the gameAreaController changes.
 *
 * It renders the following:
 * - A list of players' id and what team they are assigned to
 *    - If there is no player in the game, the username is '(No player yet!)'
 * - A message indicating the current game status:
 *    - If the game is in progress, the message is 'Game in progress, whose turn it is, the round number, the timer, and each team's score.
 *    - Otherwise the message is 'Game {not yet started | over}.'
 * - If the game is in status WAITING_TO_START, 3 different buttons are displayed to select the difficulty of the game
 *    - Clicking the button calls the startGame method on the gameAreaController
 *    - Before calling startGame method, the button is disabled and has the property isLoading set to true, and is re-enabled when the method call completes
 *    - If the method call fails, a toast is displayed with the error message as the description of the toast (and status 'error')
 *    - Once the player joins the game, the button dissapears
 * - The PictionaryBoard component, which is passed the current gameAreaController as a prop
 *
 * - When the game ends, a toast is displayed with the result of the game:
 *    - Tie: description 'Game ended in a tie'
 *    - Our player won: description 'Winner: Team A/B'
 *
 */
export default function PictionaryArea({
  interactableID,
}: {
  interactableID: InteractableID;
}): JSX.Element {
  const pictionaryAreaController =
    useInteractableAreaController<PictionaryAreaController>(interactableID);
  const townController = useTownController();

  const roundTime = 120;

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

  const [joiningGame, setJoiningGame] = useState(false);
  const [startingGame, setStartingGame] = useState(false);
  const [leavingGame, setLeavingGame] = useState(false);
  const [gameStatus, setGameStatus] = useState<GameStatus>(pictionaryAreaController.status);
  const [timer, setTimer] = useState<number>(roundTime);
  const [color, setColor] = useState<Color>('#000000');
  const [board, setBoard] = useState(pictionaryAreaController.board);
  const [focus, setFocus] = useState(false);

  const guessInputRef = useRef<HTMLInputElement | null>(null);

  const toast = useToast();

  // TODO: TOAST FOR ROUND SWITCH / TIMER IS ABOUT TO RUN OUT
  //for updating the timer every second of the game
  useEffect(() => {
    const interval = setInterval(() => {
      if (timer > 0) {
        setTimer(timer - 1);
      } else if (timer <= 0) {
        pictionaryAreaController.nextRound();
        setTimer(roundTime);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    if (focus) {
      townController.pause();
    } else {
      townController.unPause();
    }
  }, [focus, townController]);
  useEffect(() => {
    console.log('get to here');
    if (!guessInputRef.current) {
      console.log('no ref');
    }
    if (gameStatus) {
      console.log('focus');
      guessInputRef.current?.focus();
    }
  }, [focus]);

  //for updating round state
  useEffect(() => {
    //console.log('enter use effect');
    const updateGameState = () => {
      setTeamA(pictionaryAreaController.getTeamAPlayers());
      setTeamB(pictionaryAreaController.getTeamBPlayers());
      setWord(pictionaryAreaController.getWord());
      setDrawer(pictionaryAreaController.getDrawer());
      setGuesser(pictionaryAreaController.getGuesser());
      setRound(pictionaryAreaController.getRound());
      setGameStatus(pictionaryAreaController.status);
      setBoard(pictionaryAreaController.board);
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
      Game in progress Round: {pictionaryAreaController.getRound()} Currently:{' '}
      {pictionaryAreaController.getTeam()} turn <br /> Team A score:{' '}
      {pictionaryAreaController.getTeamAScore()}, Team B score:{' '}
      {pictionaryAreaController.getTeamBScore()}
    </>
  );

  return (
    <Heading size='s'>
      {pictionaryAreaController.status === 'WAITING_FOR_PLAYERS' ||
      pictionaryAreaController.status === 'OVER' ? (
        <>
          {joinGameButton}
          <List aria-label='list of players in the game'>
            <ListItem>
              Team A: {teamA.map(id => id?.userName + ', ').join('\n') || '(No player yet!)\n'}
            </ListItem>
            <ListItem>
              Team B: {teamB.map(id => id?.userName + ', ').join('\n') || '(No player yet!)\n'}
            </ListItem>
          </List>
        </>
      ) : pictionaryAreaController.status === 'WAITING_TO_START' &&
        pictionaryAreaController.getDifficulty() === 'No difficulty' ? (
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
              {guesser?.id === townController.ourPlayer.id ? (
                <Flex flexDirection='row'>
                  Make a guess with no spaces
                  <Input
                    ref={guessInputRef}
                    onFocus={() => setFocus(true)}
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
