namespace DataBase.Skills
{
    @known("Skills.HighKick")
    export class HighKick implements Game.Battle.Skill
    {
        public name = "High Kick";
        public icon = "img/icons/battle/skills/high-kick.svg";
        public description = "Can only be used after Kick.";
        public actionCost = 1;
        public energyCost = 0;
        public cooldownCost = 0;
        public cooldown = 0;
        public target = "enemy" as const;
        public category = "attack" as const;
        public available(state: Game.Battle.State): boolean
        {
            if (state.selfActions.last() instanceof Kick) return true;
            return false;
        }
        public activationText(state: Game.Battle.State): Node
        {
            return <span>Follow up with a high kick.</span>;
        }
        public async execute(state: Game.Battle.State): Promise<void>
        {
            state.opponent.stats.health -= 50;
        }
    }
}