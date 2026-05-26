namespace Views.Inventory
{
    export function Inventory()
    {
        return (
            <div id="inventory">
                <tab-header class="category" selectedIndex={ 0 } onselectedindexchanged={ (e: UI.Elements.SelectedIndexChangedEvent) => categoryChanged(e) }>
                    { Game.Inventory.ItemCategory.map(ic => <h3><img src={ "img/icons/" + ic + ".svg" } />{ ic }</h3>) }
                </tab-header>
                <div>
                    <div class="details" />
                    <vertical-divider />
                    <div class="list">
                        <h3 class="backpack-items-title">Backpack</h3>
                        <div class="backpack-items-list" />
                        <div class="equipped-items">
                            <h3 class="equipped-items-title">Quickslot Items</h3>
                            <div class="equipped-items-list">
                                { Array.repeat(3).map(n => <div id={ "item-slot-" + n } class="item-slot"><span>item-slot-{ n + 1 }</span></div>) }
                            </div>
                        </div>
                    </div>
                </div>
            </div>);
    }

    function categoryChanged(e: UI.Elements.SelectedIndexChangedEvent)
    {
        const inventory = document.querySelector("#inventory");
        const list = inventory.querySelector(".backpack-items-list");
        const category = Game.Inventory.ItemCategory[e.newIndex];

        list.clearChildren();
        list.append(...(Object.entries(Game.data.player.backpack.items)
            .mapAndFilter(([name, quantity]) =>
            {
                if (quantity <= 0) return;
                const item = DataBase.find(name);
                item.quantity = quantity;
                if (category && item.category != category) return;
                return <action-button itemName={ DataBase.findQualifiedName(item) } item={ item } text={ item.name } icon={ item.icon } actionCost={ item.actionCost ?? 0 } quantityCost={ item.quantity } onclick={ () => showDetails(item) } />;
            })));

        refreshEquippedItems();
        refreshSelectedItems();
    }

    let currentItem: Game.Inventory.Consumable;
    function showDetails(item: Game.Inventory.Item)
    {
        currentItem = item as Game.Inventory.Consumable;
        refreshDetails();
    }

    function refreshSelectedItems()
    {
        const inventory = document.querySelector("#inventory");
        if (!inventory) return;
        const currentItemName = DataBase.findQualifiedName(currentItem);
        for (const actionButton of inventory.querySelectorAll("action-button"))
            actionButton.classList.toggle("checked", actionButton.getAttribute("itemName") == currentItemName);
    }

    function refreshDetails()
    {
        const inventory = document.querySelector("#inventory");
        if (!inventory) return;
        refreshSelectedItems();

        const details = inventory.querySelector(".details");
        details.clearChildren();
        if (!currentItem) return;

        const isInQuickSlot = Game.Inventory.isInQuickSlot(currentItem);
        details.append(
            <>
                <h2>{ currentItem.name }</h2>
                <img src={ currentItem.icon } />
                <div>
                    <label>Category:</label><span>{ currentItem.category }</span>
                    <p>{ currentItem.description }</p>
                    <label class="action-cost-text"><img src="img/icons/battle/action.svg" />Action Cost:</label><span class="action-cost-text">{ Integer.toString(currentItem.actionCost ?? 0) }</span>
                    <label class="energy-cost-text"><img src="img/icons/battle/energy.svg" />Energy Cost:</label><span class="energy-cost-text">{ Integer.toString(currentItem.energyCost ?? 0) }</span>
                    <label class="cooldown-cost-text"><img src="img/icons/battle/cooldown.svg" />Cooldown:</label><span class="cooldown-cost-text">{ Integer.toString(currentItem.cooldownCost ?? 0) }</span>
                    <label class="pre-cooldown-text"><img src="img/icons/battle/cooldown.svg" />Pre-cooldown:</label><span class="pre-cooldown-text">{ Integer.toString(currentItem.cooldown ?? 0) }</span>
                    <label class="quantity-text"><img src="img/icons/inventory/quantity.svg" />Quantity:</label><span class="quantity-text">{ currentItem.quantity ?? 0 }</span>
                </div>
                { isInQuickSlot ?
                    <button class="unequip" onclick={ () => unequipItem(currentItem) }>Unequip</button> :
                    <button class="equip" onclick={ () => equipItem(currentItem) }>Equip</button> }
            </>
        );
    }

    function equipItem(item: Game.Inventory.Item)
    {
        Game.Inventory.equipItem(item);
        refreshEquippedItems();
        refreshDetails();
    }

    function unequipItem(item: Game.Inventory.Item)
    {
        Game.Inventory.unequipItem(item);
        refreshEquippedItems();
        refreshDetails();
    }

    function refreshEquippedItems()
    {
        const inventory = document.querySelector("#inventory");
        const list = inventory.querySelector(".equipped-items-list");

        for (let i = 0; i < Game.data.player.backpack.quickSlots.length; ++i)
        {
            const slot = list.querySelector("#item-slot-" + i);
            while (slot.children.length > 1) slot.lastChild.remove();

            const itemName = Game.data.player.backpack.quickSlots[i];
            if (!itemName) continue;
            const item = DataBase.find(itemName);
            item.quantity = Game.data.player.backpack.items[itemName];
            slot.appendChild(<action-button itemName={ DataBase.findQualifiedName(item) } item={ item } text={ item.name } icon={ item.icon } actionCost={ item.actionCost ?? 0 } quantityCost={ item.quantity } onclick={ () => showDetails(item) } />);
        }
    }
}