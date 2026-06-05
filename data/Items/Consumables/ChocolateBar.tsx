@Game.Serializer.known()
export class ChocolateBar implements Game.Inventory.Consumable
{
    public get name() { return "Chocolate bar"; }
    public get icon() { return "/img/icons/inventory/items/consumables/chocolate-bar.svg"; }
    public get description() { return "A tasty chocolate bar. Restores 20 HP."; }
    public get category(): "consumable" { return "consumable"; };

    public get actionCost() { return 1; }
    public get target(): Game.Battle.ActionTarget { return "self"; }

    public activationText(state: Game.Battle.State): Node
    {
        return <span>Eat a chocolate bar</span>;
    }

    public execute(state: Game.Battle.State): void
    {
        state.self.stats.health += 20;
    }
}