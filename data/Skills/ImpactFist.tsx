@Game.Serializer.known()
export class ImpactFist extends Game.Battle.Skill
{
    public name = "Impact Fist";
    public icon = "img/icons/battle/skills/impact-fist.svg";
    public description = "Punch your enemy with all your power leaving a heavy impact.";
    public actionCost = 1;
    public energyCost = 0;
    public cooldownCost = 1;
    public cooldown = 0;
    public target = "enemy" as const;
    public category = "attack" as const;

    public available(state: Game.Battle.State): boolean
    {
        return true;
    }

    public activationText(state: Game.Battle.State): Node
    {
        return <span>{ this.description }</span>;
    }
    public async execute(state: Game.Battle.State): Promise<void>
    {
        state.opponent.stats.health -= 30;
    }
}