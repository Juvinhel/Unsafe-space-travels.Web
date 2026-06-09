@Game.Serializer.known()
export class Punch extends Game.Battle.Skill
{
    public name = "Punch";
    public icon = "img/icons/battle/skills/punch.svg";
    public description = "Punch your enemy.";
    public actionCost = 1;
    public energyCost = 0;
    public cooldownCost = 0;
    public cooldown = 0;
    public target = "enemy" as const;
    public category = "attack" as const;

    public available(state: Game.Battle.State): boolean
    {
        return true;
    }

    public activationText(state: Game.Battle.State): Node
    {
        return <span>Punch your enemy in the face.</span>;
    }

    public async execute(state: Game.Battle.State): Promise<void>
    {
        state.opponent.stats.health -= 10;
    }
}