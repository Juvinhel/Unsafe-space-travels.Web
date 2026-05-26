namespace Game
{
    export interface Player
    {
        name: string;
        body: Body;
        backpack: Inventory.Backpack;
        stats: Stats;
    };
}