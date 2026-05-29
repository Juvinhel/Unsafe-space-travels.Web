namespace Game
{
    export type Player = Character &
    {
        backpack: Inventory.Backpack;
        expertise: Expertise;
        stats: Stats;
    };
}