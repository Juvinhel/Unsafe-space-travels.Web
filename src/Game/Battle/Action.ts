namespace Game.Battle
{
    export interface Action
    {
        readonly name: string;
        readonly icon: string;
        readonly description: string;
        readonly target: ActionTarget;
        readonly actionCost?: number;
        readonly energyCost?: number;
        readonly cooldownCost?: number;

        cooldown?: number;
        available(state: Game.Battle.State): boolean;
        activationText(state: Game.Battle.State): Node;
        execute(state: Game.Battle.State): void;
    }

    export type ActionTarget = "enemy" | "self";
}