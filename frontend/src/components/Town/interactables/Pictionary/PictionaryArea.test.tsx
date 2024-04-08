export {};
/**
 * Joining the game:
 *
 * - From the coveyTown, click the space bar when you get near the Pictionary game tile
 * - To join the game, click the 'Join Game' button
 * - If you have already joined the game and your player ID shows up in the game and you are assigned to a team,
 * if you try to click the 'Join Game' button again, it will say you are already in the game
 * - If you are the first player to join the game, you will be assigned to team A
 * - If you are the second player to join the game, you will be assigned to team A
 * - If you are the third player to join the game, you will be assigned to team B
 * - If you are the fourth player to join the game, you will be assigned to team B
 * Once all members have joined the game, the game will go a screen where a player has to pick the level of the game difficulty to play
 * Once one of the players clicks the difficulty level, the game will start
 *
 *
 * Drawing on the whiteboard:
 *
 * - The first player who joins the game will first be assigned to the drawer. Only the drawer will be able to draw on the whiteboard, see color options, and see buttons to reset and erase the board.
 * - If the guesser on the team (the 2nd person to join) or someone from the opposing team tries to draw, nothing will show on the board.
 * - Non-drawer players will also not have access the colors, erase, or reset button.
 * - When the round switches to the round 2, the first player to join team B will be assigned the drawer.
 * This pattern will continue until all 4 players have had a chance to draw.
 * - Past drawers will not be able to draw on the board once the round is done and switches teams.
 *
 * Guessing and game functionality:
 * - Only the drawer is able to view the word that they are supposed to draw.
 * - Only the guesser will have a guess input box and a button to submit the guess.
 * - The guesser is able to see if the guess is correct or incorrect.
 * - If the guess is correct, the team will get a point and the other team's score will remain the same
 * - If the guess is incorrect, both teams' scores will remain the same.
 * - When the round switches, the current guesser will no longer be able to guess and the next guesser will be assigned and will see the guess box and button.
 * - When the timer runs out, the drawer will no longer be able to draw and the guesser will no longer be able to guess.
 * - The round will switch and increment up by 1.
 * - The game will display which team's turn it is to be drawing and guessing. This will switch and update as the rounds go on.
 * - The game has a total of 4 rounds.
 * - There are no invalid guesses. The only constraint is that the guesses cannot have a space. If a guess is attempted including a space, it will not show up in the textbox.
 *
 *
 * Ending the game
 * - The game will end after 4 rounds.
 * -If a team has a score greater than the other team, that team is declared the winner.
 */
