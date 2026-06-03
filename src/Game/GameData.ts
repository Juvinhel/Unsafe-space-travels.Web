namespace Game
{
    export interface GameData
    {
        position?: Game.World.Point & { map: string; };

        smartphone: boolean;
        backpack: boolean;
        bodyScanner: boolean;
        quests: Quest[],
        maps: { [link: string]: { objects: Game.World.Obj[]; }; };
        story: { [link: string]: object; };
        characters: { [name: string]: Character; };

        player: Player;
    }

    export let data: GameData;

    export let defaultData: GameData = {
        position: null,
        smartphone: false,
        backpack: false,
        bodyScanner: false,
        quests: [],
        maps: {},
        story: {},
        characters: {},
        player: {
            name: "Player",
            body: {
                feminity: -100,
                //mutations: [],
                //augmentations: []
            },
            backpack:
            {
                money: 0,
                items: [],
                quickSlots: Array.createFixed(3),
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
                skills: [],
                quickslots: Array.createFixed(9),
            }
        }
    };
}