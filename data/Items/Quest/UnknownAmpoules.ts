@Game.Data.known("Items.Quest.UnknownAmpoules")
class UnknownAmpoules implements Game.Inventory.Item
{
    public icon = "img/icons/inventory/items/quest/unknown-ampoules.svg";
    public name = "Unknown Ampoules";
    public description = "3 ampoules with unknown content.";
    public category = "quest" as const;
}