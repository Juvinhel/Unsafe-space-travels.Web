namespace Game.Battle
{
    export type State = {
        turn: number,
        self: Combatant,
        opponent: Combatant,
        selfActions: Action[],
        opponentActions: Action[];
    };
}