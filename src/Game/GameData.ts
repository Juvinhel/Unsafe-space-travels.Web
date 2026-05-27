namespace Game
{
    export interface GameData
    {
        storyLink?: string;
        position?: Game.World.Point & { map: string; };

        smartphone: boolean;
        backpack: boolean;
        bodyScanner: boolean;
        quests: Quest[],
        maps: { [link: string]: { objects: Game.World.Obj[]; }; };
        story: { [link: string]: object; };

        player: Player;
    }

    export let data: GameData;

    export let defaultData: GameData = {
        storyLink: null,
        position: null,
        smartphone: false,
        backpack: false,
        bodyScanner: false,
        quests: [],
        maps: {},
        story: {},
        player: {
            name: "Player",
            body: {
                mutations: [],
                augmentations: []
            },
            backpack:
            {
                money: 0,
                items: [
                    new DataBase.Items.Consumables.ChocolateBar(),
                ],
                quickSlots: Array.createFixed(3, "Items.Consumables.ChocolateBar"),
            },
            stats: {
                level: 1,
                actionCount: 3,
                health: 100,
                maxHealth: 100,
                energy: 0,
                maxEnergy: 100,
                arousal: 0,
                maxArousal: 100,
            },

            expertise: {
                skills: [
                    new DataBase.Skills.Punch(),
                    new DataBase.Skills.Kick(),
                    new DataBase.Skills.CalmDown(),
                    new DataBase.Skills.ImpactFist(),
                    new DataBase.Skills.Escape(),
                    new DataBase.Skills.Firestorm(),
                    new DataBase.Skills.HighKick()
                ],
                quickslots: Array.createFixed(9, "Skills.Punch", "Skills.Kick", "Skills.HighKick", "Skills.ImpactFist", "Skills.Escape", "Skills.CalmDown"),
            }
        }
    };
}