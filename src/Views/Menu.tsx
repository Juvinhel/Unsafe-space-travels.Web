namespace Views
{
    export function ShowMenu(item?: string)
    {
        UI.Dialog.show(menu, { title: "Menu", allowClose: true, mode: "fill" }, item);
    }

    function tabItems(): UI.Elements.TabItem[]
    {
        return [
            Game.data.smartphone ? { title: "quests", icon: "img/icons/smartphone.svg", content: Quests.QuestLog } : null,
            Game.data.bodyScanner ? { title: "body", icon: "img/icons/body-scanner.svg", content: Body.BodyInfo } : null,
            { title: "skills", icon: "img/icons/skills.svg", content: Skills.Skills },
            { title: "inventory", icon: "img/icons/backpack.svg", content: Inventory.Inventory },
            //Game.data.backpack ? { title: "inventory", icon: "img/icons/backpack.svg", content: Inventory.Inventory } : null,
        ].filter(x => x);
    }

    function menu(item?: string)
    {
        return (<lazy-tab-control id="menu" class={ [receiveGlobalInputClass] }
            storeContent={ true }
            tabItems={ tabItems() }
            selectedIndex={ tabItems().findIndex(x => x.title == item) }
            onrendered={ (e: Event) =>
            {
                globalInput.registerEvent(e.currentTarget as Element,
                    (e: GlobalInputEvent) =>
                    {
                        if (e.input == "Back") UI.Dialog.close(e.currentTarget as Element);
                        e.preventDefault();
                    });
            } } />);
    }
};;