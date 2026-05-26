namespace Game
{
    export type Savegame =
        {
            id: string; // GUID for Save
            version: string; // Game Version
            date: Date;
            playTime: Time;

            data: GameData;
        };

    export class SaveManager
    {
        public static get names(): Array<string>
        {
            return SaveStorage.names.sort();
        }

        public static exists(name: string): boolean
        {
            return SaveStorage.names.includes(name);
        }

        public static get savegames(): [string, Savegame][]
        {
            const savegames: [string, Savegame][] = [];
            for (const name of this.names)
                savegames.push([name, this.load(name)]);
            return savegames;
        }

        public static save(savegame: Savegame, name: string): string
        {
            const text = this.serialize(savegame);
            SaveStorage.save(name, text);
            return name;
        }

        public static load(name: string): Savegame
        {
            const text = SaveStorage.load(name);
            if (!text) return null;
            const savegame = this.deserialize(text);
            return savegame;
        }

        public static delete(name: string)
        {
            SaveStorage.delete(name);
        }

        public static serialize(savegame: Savegame): string
        {
            return YAML.stringify(savegame);
        }

        public static deserialize(data: string): Savegame
        {
            return YAML.parse(data) as Savegame;
        }
    }

    export const SaveStorage = new class SaveStorage
    {
        private prefix = "SaveGame-";

        public get names(): Array<string>
        {
            const ret: string[] = [];
            for (let i = 0; i < localStorage.length; ++i)
            {
                const key = localStorage.key(i);
                if (key.startsWith(this.prefix))
                {
                    const name = key.splitFirst("-")[1];
                    ret.push(name);
                }
            }
            return ret;
        }

        public load(name: string): string
        {
            return localStorage.getItem(this.prefix + name);
        }

        public save(name: string, data: string)
        {
            return localStorage.setItem(this.prefix + name, data);
        }

        public delete(name: string)
        {
            localStorage.delete(this.prefix + name);
        }
    }();
}