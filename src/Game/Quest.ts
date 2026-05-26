namespace Game
{
    export type Quest =
        {
            title: string;
            link: string;

            main?: boolean;
            completed?: boolean;
            subQuests?: Quest[];
        };

    export const questManager = new class QuestManager
    {
        public find(title: string): Game.Quest
        {
            return Game.data.quests.first(x => x.title == title);
        }

        public add(quest: Game.Quest): Game.Quest
        {
            Game.data.quests.push(quest);
            return quest;
        }
    }();
}