namespace DataBase.Items.Consumables
{
    export class ChocolateBar implements Game.Inventory.Consumable
    {
        public name = "Chocolate bar";
        public icon = "/img/icons/inventory/items/consumables/chocolate-bar.svg";
        public description = "A tasty chocolate bar. Restores 20 HP.";
        public category = "consumable" as const;

        public actionCost = 1;
        public target = "self" as const;

        public activationText(state: Game.Battle.State): Node
        {
            return <span>Eat a chocolate bar</span>;
        }

        public execute(state: Game.Battle.State): void
        {
            state.self.stats.health += 20;
        }
    }
}