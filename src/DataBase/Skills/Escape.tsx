namespace DataBase.Skills
{
    export class Escape implements Game.Battle.Skill
    {
        public name = "Escape";
        public icon = "img/icons/battle/skills/escape.svg";
        public description = "Escape from the battle.";
        public actionCost = Number.POSITIVE_INFINITY;
        public energyCost = 0;
        public cooldownCost = 0;
        public cooldown = 0;
        public target = "self" as const;
        public category = "utility" as const;
        public available(state: Game.Battle.State): boolean
        {
            return state.selfActions.length == 0;
        }
        public activationText(state: Game.Battle.State): Node
        {
            return <span>Try to escape from battle.</span>;
        }
        public async execute(state: Game.Battle.State): Promise<void>
        {
            //TODO percent
            state.self.escaped = true;
        }
    }
}