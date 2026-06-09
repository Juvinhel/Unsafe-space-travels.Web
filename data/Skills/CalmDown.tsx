@Game.Serializer.known()
export class CalmDown extends Game.Battle.Skill
{
    public name = "Calm Down";
    public icon = "img/icons/battle/skills/calm-down.svg";
    public description = "Reduce your arousal by 20.";
    public actionCost = 1;
    public energyCost = 0;
    public cooldownCost = 0;
    public cooldown = 0;
    public target = "self" as const;
    public category = "utility" as const;

    public available(state: Game.Battle.State): boolean
    {
        return true;
    }

    public activationText(state: Game.Battle.State): Node
    {
        return <span>Reduces arousal by 20.</span>;
    }
    public execute(state: Game.Battle.State): void
    {
        state.self.stats.arousal -= 20;
    }
}