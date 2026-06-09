@Game.Serializer.known()
export class Firestorm extends Game.Battle.Skill
{
    public name = "Firestorm";
    public icon = "img/icons/battle/skills/firestorm.svg";
    public description = "A powerful fire attack that hits all enemies.";
    public actionCost = 1;
    public energyCost = 10;
    public cooldownCost = 1;
    public cooldown = 2; // initial cooldown
    public target = "enemy" as const;
    public category = "attack" as const;

    public available(state: Game.Battle.State): boolean
    {
        return true;
    }

    public activationText(state: Game.Battle.State): Node    
    {
        return <span>Cast Firestorm</span>;
    }
    public async execute(state: Game.Battle.State): Promise<void>
    {
        state.opponent.stats.health -= 30;
    }
}