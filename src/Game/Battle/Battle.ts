namespace Game.Battle
{
    export async function begin(enemy: Enemy): Promise<Result>
    {
        const battleView = new Views.Battle.BattleView(initPlayer(), initEnemy(enemy));
        await UI.Dialog.show(battleView, { allowClose: false, mode: "full" });
        return battleView.result;
    }

    export type Result = "win-damage" | "win-arousal" | "win-escape" | "loose-damage" | "loose-arousal" | "loose-escape";

    function initPlayer(): Combatant
    {
        return {
            name: Game.data.player.name,
            skills: Game.data.player.expertise.quickslots.mapAndFilter(name =>
            {
                const skill = Game.data.player.expertise.skills.first(x => Serializer.getType(x) == name);
                if (!skill) return undefined;
                skill.cooldown ??= 0;
                return skill;
            }),
            items: Game.data.player.backpack.quickSlots.mapAndFilter(itemName =>
            {
                const item = Serializer.create(itemName) as Game.Inventory.Consumable;
                if (!item) return undefined;
                item.cooldown ??= 0;
                item.quantity = Game.data.player.backpack.items[itemName];
                if (item.quantity <= 0) return undefined;
                return item;
            }) as Game.Inventory.Consumable[],
            stats: {
                actionCount: Game.data.player.stats.actionCount,
                maxActionCount: Game.data.player.stats.actionCount,
                health: Game.data.player.stats.health,
                maxHealth: Game.data.player.stats.maxHealth,
                shield: 0,
                maxShield: Game.data.player.stats.maxHealth,
                arousal: Game.data.player.stats.arousal,
                maxArousal: Game.data.player.stats.maxArousal,
                sensitivity: 0,
                maxSensitivity: 3 * Game.data.player.stats.maxArousal,
                energy: Game.data.player.stats.energy,
                maxEnergy: Game.data.player.stats.maxEnergy,
            }
        };
    }

    function initEnemy(enemy: Enemy): Combatant
    {
        return {
            name: enemy.name,
            skills: enemy.knownSkills.mapAndFilter(name =>
            {
                const skill = Serializer.create(name) as Game.Battle.Skill;
                if (!skill) return undefined;
                skill.cooldown ??= 0;
                return skill;
            }),
            items: [],
            stats: {
                actionCount: enemy.actionCount ?? 3,
                maxActionCount: Game.data.player.stats.actionCount,
                health: enemy.health,
                maxHealth: enemy.maxHealth,
                shield: enemy.shield ?? 0,
                maxShield: enemy.maxShield ?? enemy.maxHealth,
                arousal: enemy.arousal,
                maxArousal: enemy.maxArousal,
                sensitivity: enemy.sensitivity ?? 0,
                maxSensitivity: enemy.maxSensitivity ?? 3 * enemy.maxArousal,
                energy: enemy.energy ?? 0,
                maxEnergy: enemy.maxEnergy ?? 100,
            }
        };
    }
}