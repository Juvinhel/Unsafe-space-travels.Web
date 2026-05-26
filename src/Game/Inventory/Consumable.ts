namespace Game.Inventory
{
    export interface Consumable extends Game.Inventory.Item, Game.Battle.Action
    {
        category: "consumable";
    }
}