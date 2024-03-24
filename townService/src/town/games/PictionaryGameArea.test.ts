import { mock } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { createPlayerForTesting } from '../../TestUtils';
import {
    GAME_ID_MISSMATCH_MESSAGE,
    GAME_NOT_IN_PROGRESS_MESSAGE,
    INVALID_COMMAND_MESSAGE,
} from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import {
    GameInstanceID,
    GameMove,
    PictionaryGameState,
    PictionaryMove,
    TownEmitter,
} from '../../types/CoveyTownSocket';
import PictionaryGameArea from './PictionaryGameArea';
import * as PictionaryGameModule from './PictionaryGame';
import Game from './Game';

class TestingGame extends Game<PictionaryGameState, PictionaryMove> {
        
    public applyMove(move: GameMove<PictionaryMove>): void {}

    protected _join(player: Player): void {}
    
    protected _leave(player: Player): void {}


}