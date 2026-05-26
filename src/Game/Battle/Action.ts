namespace Game.Battle
{
    export interface Action
    {
        name: string;
        icon: string;
        description: string;

        actionCost?: number;
        energyCost?: number;
        cooldownCost?: number;
        cooldown?: number;

        target: ActionTarget;

        available?(state: Game.Battle.State): boolean;
        activationText(state: Game.Battle.State): Node;
        execute(state: Game.Battle.State): void;
    }

    export type ActionTarget = "enemy" | "self";
}