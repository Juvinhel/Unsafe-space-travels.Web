namespace Game.Inventory
{
    export interface Backpack
    {
        money: number;
        items: Item[];
        quickSlots: FixedLengthArray<string, 3>;
    }

    export function isInQuickSlot(item: string | Item): boolean
    {
        const itemName = typeof item === "string" ? item : Data.getType(item);
        return Game.data.player.backpack.quickSlots.includes(itemName);
    }

    export function equipItem(item: string | Item): boolean
    {
        const itemName = typeof item === "string" ? item : Data.getType(item);
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
        const itemName = typeof item === "string" ? item : Data.getType(item);
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
        public add(item: string | Item, quantity?: number)
        {
            item = typeof item === "string" ? Data.create(item) as Item : item;

            if ("quantity" in item)
            {
                if (quantity != null) item.quantity = quantity;

                const inventoryItem = Game.data.player.backpack.items.first(x => x.constructor == item.constructor);
                if (!inventoryItem)
                    Game.data.player.backpack.items.push(item);
                else
                    inventoryItem.quantity += item.quantity;
            }
            else
            {
                //singleton
                if (quantity != null) throw new Error("Item is a singleton");
                Game.data.player.backpack.items.push(item);
            }
        }

        public remove(item: string | Item, quantity: number = null): boolean
        {
            item = typeof item === "string" ? Data.create(item) as Item : item;
            if ("quantity" in item)
            {
                const inventoryItem = Game.data.player.backpack.items.first(x => x.constructor == item.constructor);
                if (!inventoryItem) return false;
                if (inventoryItem.quantity < quantity) return false;
                inventoryItem.quantity -= quantity;
                return true;
            }
            else
            {
                //singleton
                if (quantity != null) throw new Error("Item is a singleton");
                Game.data.player.backpack.items.removeIf(x => x == item);
            }
        }
    }();
}