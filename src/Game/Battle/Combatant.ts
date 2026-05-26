namespace Game.Battle
{
    export type Combatant =
        {
            name: string;
            skills: Skill[];
            items: Inventory.Consumable[],
            stats: Stats;
            escaped?: boolean;
        };

    export type Stats = {
        actionCount: number;
        maxActionCount: number;

        health: number;
        maxHealth: number;

        shield: number;
        maxShield: number;

        arousal: number;
        maxArousal: number;

        sensitivity: number;
        maxSensitivity: number;

        energy: number;
        maxEnergy: number;
    };
}