namespace Interop
{
    export interface Bridge
    {
        SaveGames(): Promise<string[]>;

        LoadGame(_fileName: string): Promise<string>;

        SaveGame(_fileName: string, _data: string): Promise<string>;

        DeleteGame(_fileName: string): Promise<boolean>;
    }

    //@ts-ignore
    export const Bridge: Bridge | null = window.chrome?.webview?.hostObjects?.bridge;
}