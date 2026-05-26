/// <reference path="../Interop/Bridge.ts" />

namespace Game
{
    export type SaveState =
        {
            id: string; // GUID for Save
            version: string; // Game Version
            date: Date;
            playTime: Time;
            name: string;

            data: GameData;
        };

    export interface SaveManager
    {
        get slots(): AsyncIterablePromise<number>;
        get saveStates(): AsyncIterablePromise<[number, SaveState]>;

        save(slot: number, saveState: SaveState): Promise<void>;
        load(slot: number): Promise<SaveState>;
        delete(slot: number): Promise<void>;
    }

    export function serializeSaveState(saveState: SaveState): string
    {
        return YAML.stringify(saveState);
    }

    export function deserializeSaveState(data: string): SaveState
    {
        return YAML.parse(data) as SaveState;
    }

    export class WebSaveManager implements SaveManager
    {
        private prefix = "saveState-";

        get slots(): AsyncIterablePromise<number>
        {
            return new AsyncIterablePromise<number>(this.getSlots());
        }

        private async * getSlots()
        {
            for (let i = 0; i < localStorage.length; ++i)
            {
                const key = localStorage.key(i);
                if (key.startsWith(this.prefix))
                {
                    const slot = parseInt(key.splitFirst("-")[1]);
                    if (!isNaN(slot)) yield slot;
                }
            }
        }

        get saveStates(): AsyncIterablePromise<[number, SaveState]>
        {
            return new AsyncIterablePromise<[number, SaveState]>(this.getSaveStates());
        }

        private async * getSaveStates(): AsyncIterable<[number, SaveState]>
        {
            for await (const slot of this.slots)
                yield [slot, await this.load(slot)];
        }

        async save(slot: number, saveState: SaveState)
        {
            const text = serializeSaveState(saveState);
            localStorage.setItem(this.prefix + slot, text);
        }

        async load(slot: number): Promise<SaveState>
        {
            const text = localStorage.getItem(this.prefix + slot);
            return deserializeSaveState(text);
        }

        async delete(slot: number)
        {
            localStorage.delete(this.prefix + slot);
        }
    }

    export class LocalSaveManager implements SaveManager
    {
        get slots(): AsyncIterablePromise<number>
        {
            return new AsyncIterablePromise<number>(this.getSlots());
        }

        private async * getSlots()
        {
            const fileNames = await Interop.Bridge.SaveGames();
            return fileNames.map(f => parseInt(f)).filter(x => !isNaN(x));
        }

        get saveStates(): AsyncIterablePromise<[number, SaveState]>
        {
            return new AsyncIterablePromise<[number, SaveState]>(this.getSaveStates());
        }

        private async * getSaveStates(): AsyncIterable<[number, SaveState]>
        {
            for await (const slot of this.slots)
                yield [slot, await this.load(slot)];
        }

        async save(slot: number, saveState: SaveState)
        {
            await Interop.Bridge.SaveGame(slot.toFixed(), serializeSaveState(saveState));
        }

        async load(slot: number): Promise<SaveState>
        {
            return deserializeSaveState(await Interop.Bridge.LoadGame(slot.toFixed()));
        }

        async delete(slot: number)
        {
            await Interop.Bridge.DeleteGame(slot.toFixed());
        }
    }

    export const SaveManager: SaveManager = Interop.Bridge ? new LocalSaveManager() : new WebSaveManager();
}