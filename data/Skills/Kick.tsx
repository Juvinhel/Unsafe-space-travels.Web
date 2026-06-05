@Game.Serializer.known()
export class Kick implements Game.Battle.Skill
{
    public name = "Kick";
    public icon = "img/icons/battle/skills/kick.svg";
    public description = "Kick your enemy.";
    public actionCost = 2;
    public energyCost = 0;
    public cooldownCost = 0;
    public cooldown = 0;
    public target = "enemy" as const;
    public category = "attack" as const;
    public activationText(state: Game.Battle.State): Node
    {
        return <span>Kick your enemy in the face.</span>;
    }
    public async execute(state: Game.Battle.State): Promise<void>
    {
        state.opponent.stats.health -= 10;
    }
}