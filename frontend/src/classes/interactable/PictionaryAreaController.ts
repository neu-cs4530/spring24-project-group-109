import _ from 'lodash';
import {
    GameArea,
    GameStatus,
    PictionaryGameState,
    PictionaryMove,
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
        const drawer = this._model.game?.state.drawer;
        if (drawer) {
            return this._players.find(player => player.id === drawer);
        }
        return undefined;
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
    
    /**
     * Updates the internal state of this PictionaryAreaController to match the new model.
     */
    protected _updateFrom(newModel: GameArea<PictionaryGameState>): void {
        // not implemented
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
}
