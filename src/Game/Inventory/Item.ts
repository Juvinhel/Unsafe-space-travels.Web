namespace Game.Inventory
{
    export interface Item
    {
        constructor: Function;
        icon: string;
        name: string;
        description: string;
        category: ItemCategory;
        quantity?: number;
    }

    export const ItemCategory = ["weapon", "armor", "consumable", "quest"] as const;
    export type ItemCategory = typeof ItemCategory[number];
}