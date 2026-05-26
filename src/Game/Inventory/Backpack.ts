namespace Game.Inventory
{
    export interface Backpack
    {
        money: number;
        items: { [name: string]: number; };
        quickSlots: FixedLengthArray<string, 3>;
    }

    export function isInQuickSlot(item: string | Item): boolean
    {
        const itemName = typeof item === "string" ? item : DataBase.findQualifiedName(item);
        return Game.data.player.backpack.quickSlots.includes(itemName);
    }

    export function equipItem(item: string | Item): boolean
    {
        const itemName = typeof item === "string" ? item : DataBase.findQualifiedName(item);
        if (isInQuickSlot(itemName)) return false;

        for (let i = 0; i < Game.data.player.backpack.quickSlots.length; ++i)
            if (!Game.data.player.backpack.quickSlots[i])
            {
                Game.data.player.backpack.quickSlots[i] = itemName;
                return true;
            }
        return false;
    }

    export function unequipItem(item: string | Item): boolean
    {
        const itemName = typeof item === "string" ? item : DataBase.findQualifiedName(item);
        for (let i = 0; i < Game.data.player.backpack.quickSlots.length; ++i)
            if (Game.data.player.backpack.quickSlots[i] == itemName)
            {
                Game.data.player.backpack.quickSlots[i] = null;
                return true;
            }
        return false;
    }

    export const backpackManager = new class BackpackManager
    {
        public add(item: string, quantity: number = 1)
        {
            let count = Game.data.player.backpack.items[item];
            if (!count) count = 0;
            count += quantity;
            if (count <= 0)
                delete Game.data.player.backpack[item];
            else
                Game.data.player.backpack[item] = count;
        }

        public remove(item: string, quantity: number = 1)
        {
            this.add(item, -quantity);
        }
    }();
}