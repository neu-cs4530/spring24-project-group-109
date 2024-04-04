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
  const [timer, setTimer] = useState<number>(pictionaryAreaController.getTimer());
  const [color, setColor] = useState<Color>('#000000');
  const [board, setBoard] = useState(pictionaryAreaController.board);

  const toast = useToast();

  // TODO: TOAST FOR ROUND SWITCH / TIMER IS ABOUT TO RUN OUT

  //for updating round state
  useEffect(() => {
    console.log('enter use effect');
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
      setTimer(pictionaryAreaController.getTimer());
      // setColor(pictionaryAreaController.getColor());
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
    console.log('before game updating');
    pictionaryAreaController.addListener('gameUpdated', updateGameState);
    pictionaryAreaController.addListener('gameEnd', onGameEnd);
    return () => {
      console.log('after game updating');
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
    // if (gameStatus === 'WAITING_TO_START') {
    //   gameStatusText = <b>Game in {gameStatus}</b>;
    // }
  }
  const gameStatusTextPlayers = (
    <>
      Game is{' '}
      {gameStatus === 'WAITING_TO_START' ? (
        <>
          waiting for difficulty selection. teamA:{teamA.map(id => id?.userName)}, teamB:
          {teamB.map(id => id?.userName)}
          {pictionaryAreaController.getTeam()}
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
      Game in progress, round: {pictionaryAreaController.getRound() + 1}, currently:{' '}
      {pictionaryAreaController.getTeam()} turn, Team A score:{' '}
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
            <ListItem>Team A: {teamA.map(id => id?.userName) || '(No player yet!)'}</ListItem>
            <ListItem>Team B: {teamB.map(id => id?.userName) || '(No player yet!)'}</ListItem>
          </List>
        </>
      ) : (pictionaryAreaController.status === 'WAITING_TO_START' &&
          pictionaryAreaController.getDifficulty() === 'No difficulty') ||
        pictionaryAreaController.status === 'OVER' ? (
        <Flex flexDirection='row'>
          {gameStatusTextPlayers}
          <Flex flexDirection='row'>
            <Container flexDirection='column'>
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
            </Container>
            <Container flexDirection='column'>
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
              </Button>
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
            </Container>
            <Container flexDirection='column'>
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
            </Container>
          </Flex>
        </Flex>
      ) : (
        <pictionaryColorOptions.Provider value={{ color: color, setColor: setColor }}>
          {color}
          <Flex flexDirection='row'>
            <Heading size='s'>{gameStatusTextScore}</Heading>
            {timer}
            {<> Make a guess with no spaces </>}
            <Container flexDirection='column'>
              <Heading size='lg'>
                {pictionaryAreaController.getDrawer()?.id === townController.ourPlayer.id
                  ? `${word}`
                  : ''}
              </Heading>
              <PictionaryBoard
                pictionaryAreaController={pictionaryAreaController}></PictionaryBoard>
              {console.log(board)}
              <Flex flexDirection='row'>
                <PictionaryColor></PictionaryColor>
                <PictionaryButtons
                  pictionaryAreaController={pictionaryAreaController}></PictionaryButtons>
                <Button
                  type='button'
                  onClick={async () => {
                    setColor('#FFFFFF');
                  }}>
                  Erase Button
                </Button>
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
            </Container>
          </Flex>
        </pictionaryColorOptions.Provider>
      )}
    </Heading>
  );
}
