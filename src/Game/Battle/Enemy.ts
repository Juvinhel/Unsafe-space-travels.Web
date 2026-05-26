namespace Game.Battle
{
    export type Enemy = {
        name: string;

        actionCount?: number;

        health: number;
        maxHealth: number;

        shield?: number;
        maxShield?: number;

        arousal: number;
        maxArousal: number;

        sensitivity?: number;
        maxSensitivity?: number;

        energy?: number;
        maxEnergy?: number;

        knownSkills: string[];
    };
}