import _ from 'lodash';
import {
    Color,
    GameArea,
    GameStatus,
    InteractableCommand,
    PictionaryGameState,
    PictionaryMove,
    Pixel,
} from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import GameAreaController, {
    GameEventTypes,
    NO_GAME_IN_PROGRESS_ERROR,
    PLAYER_NOT_IN_GAME_ERROR,
} from './GameAreaController';

export type PictionaryEvents = GameEventTypes & {
    wordChanged: (word: string) => void;
    turnChanged: (isOurTurn: boolean) => void;
};

/**
 * This class is responsible for managing the state of the Pictionary game, and for sending commands to the server
 */
export default class PictionaryAreaController extends GameAreaController<
    PictionaryGameState,
    PictionaryEvents
>{

    /**
     * Returns true if the game is not over
     */
    public isActive(): boolean {
        return this._model.game?.state.status !== 'OVER';
    }

    /**
     * Returns the player who is drawing
     */
    public getDrawer(): PlayerController | undefined {
        console.log(this)
        const drawer = this._model.game?.state.drawer;
        if (drawer) {
            return this._players.find(player => player.id === drawer);
        }
        return undefined;
    }

    public getTeam() {
        if(this.getDrawer()?.id === this._model.game?.state.teamA.players[0]) {
            return 'A';
        } else {
            return 'B';
        }
    }

    /**
     * Returns the player who is guessing
     */
    public getGuesser(): PlayerController | undefined {
        const guesser = this._model.game?.state.guesser;
        if (guesser) {
            return this._players.find(player => player.id === guesser);
        }
        return undefined;
    }

    /**
     * Returns the current word that the drawer is drawing
     */
    public getWord(): string {
        return this._model.game?.state.word ?? '';
    }

    public getGuess(): string {
        return this._model.game?.state.guess ?? '';
    }

    get winner(): PlayerController | undefined {
        const winner = this._model.game?.state.winner;
        if (winner) {
          return this.occupants.find(eachOccupant => eachOccupant.id === winner);
        }
        return undefined;
      }

    /**
     * Returns the current difficulty of the game
     */
    public getDifficulty(): string {
        return this._model.game?.state.difficulty ?? '';
    }

    /**
     * Returns the words that have been used in the game
     */
    public getUsedWords(): string[] {
        return this._model.game?.state.usedWords ?? [];
    }

    /**
     * Returns the current timer value
     */
    public getTimer(): number {
        return this._model.game?.state.timer ?? 0;
    }

    /**
     * Returns the current round number
     */
    public getRound(): number {
        return this._model.game?.state.round ?? 0;
    }

    /**
     * Returns true if the player is in the game
     */
    public isPlayer(): boolean {
        return this._model.game?.players.includes(this._townController.ourPlayer.id) ?? false;
    }

    /**
     * Returns true if it is the player's team's turn
     */
    public isOurTurn(): boolean {
        return this.getDrawer()?.id === this._townController.ourPlayer.id || this.getGuesser()?.id === this._townController.ourPlayer.id;
    }

    /**
     * Returns team A's score
     */
    public getTeamAScore(): number {
        return this._model.game?.state.teamA.score ?? 0;
    }

    /**
     * Returns team B's score
     */
    public getTeamBScore(): number {
        return this._model.game?.state.teamB.score ?? 0;
    }

    public getTeamAPlayers(): string[] {
        return this._model.game?.state.teamA.players ?? []
    }

    public getTeamBPlayers(): string[] {
        return this._model.game?.state.teamB.players ?? []
    }

    get board(): Color[][] {
        return this._model.game?.state.board.board;
    }

    public async startGame(difficulty: string) {
        const instanceID = this._instanceID;
        if (instanceID) {
          await this._townController.sendInteractableCommand(this.id, {
            type: 'StartGame',
            gameID: instanceID,
          });
        }
    }

    /**
     * Sends a request to the server to draw a pixel which makes up a drawing
     * @param drawing list of pixels to draw
     */
    public async draw(drawing: Pixel[]) {
            await this._sendInteractableCommandHelper({
                    type: 'DrawCommand',
                    drawing,
            });
    }

    // TODO: IMPLEMENT WAITING TO START???
    get status(): GameStatus {
        const status = this._model.game?.state.status;
        if (!status) {
            return 'WAITING_FOR_PLAYERS';
        }
        return status;
    }

    /**
     * Sends a request to the server to erase a drawing on the whiteboard
     * @param drawing list of pixels that need to be erased
     */
    public async erase(drawing: Pixel[]) {
        await this._sendInteractableCommandHelper({
            type: 'EraseCommand',
            drawing,
        });
    }

    /**
     * Sends a request to the server to reset the whiteboard
     */
    public async reset() {
        await this._sendInteractableCommandHelper({
            type: 'ResetCommand',
        });
    }
    
    /**
     * Updates the internal state of this PictionaryAreaController to match the new model.
     */
    protected _updateFrom(newModel: GameArea<PictionaryGameState>): void {
        const oldModel = this._model;
        super._updateFrom(newModel);
        if(newModel) {
            // if board has changed (ex. new drawing)
            if (oldModel.game?.state.board.board !== newModel.game?.state.board.board) {
                this.emit('boardChanged', this.board);
            }
            // drawer has changed
            // is basically also checking isOurTurn
            if (oldModel.game?.state.drawer !== newModel.game?.state.drawer) {
                this.emit('drawerChanged', this.getDrawer());
            }
            // guesser has changed
            // is basically also checking isOurTurn
            if (oldModel.game?.state.guesser !== newModel.game?.state.guesser) {
                this.emit('guesserChanged', this.getGuesser());
            }
            // word to guess has changed
            if (oldModel.game?.state.word !== newModel.game?.state.word) {
                this.emit('wordChanged', this.getWord());
            }
            // a word has been added to the used words in the game
            if (oldModel.game?.state.usedWords !== newModel.game?.state.usedWords) {
                this.emit('usedWordsChanged', this.getUsedWords());
            }
            // timer has changed
            if (oldModel.game?.state.timer !== newModel.game?.state.timer) {
                this.emit('timerChanged', this.getTimer());
            }
            // round has changed
            if (oldModel.game?.state.round !== newModel.game?.state.round) {
                this.emit('roundChanged', this.getRound());
            }
            // check if team A scored
            if (oldModel.game?.state.teamA.score !== newModel.game?.state.teamA.score) {
                this.emit('teamAScoreChanged', this.getTeamAScore());
            }
            // check if team B scored
            if (oldModel.game?.state.teamB.score !== newModel.game?.state.teamB.score) {
                this.emit('teamBScoreChanged', this.getTeamBScore());
            }

        }
        

    }

    /**
     * Sends a request to the server to make a move in the game
     * 
     * If the game is not in progress, throws an error NO_GAME_IN_PROGRESS_ERROR
     * 
     * @param word The guess to make in the game 
     */
    public async makeMove(word: string): Promise<void> {
        const instanceID = this._instanceID;
        if (!instanceID || this._model.game?.state.status !== 'IN_PROGRESS') {
            throw new Error(NO_GAME_IN_PROGRESS_ERROR);
        }
        if (!this.isActive()) {
            throw new Error(NO_GAME_IN_PROGRESS_ERROR);
        }
        if (!this.isPlayer()) {
            throw new Error(PLAYER_NOT_IN_GAME_ERROR);
        }
        // const move: PictionaryMove = {
        //     guess: word,
        // };
        await this._townController.sendInteractableCommand(this.id, {
            type: 'GameMove',
            gameID: instanceID,
            move: {
                guess: word,
            }
        });
    }

    private async _sendInteractableCommandHelper(command: InteractableCommand) {
        const instanceID = this._instanceID;
        if (instanceID) {
            await this._townController.sendInteractableCommand(this.id, {
                gameID: instanceID,
                ...command,
            });
        } else {
            throw new Error('No instance ID yet');
        }
    }
}
