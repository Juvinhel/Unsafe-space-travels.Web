namespace Interop
{
    export interface Bridge
    {
        SaveFiles(): Promise<string[]>;

        LoadSaveFile(_fileName: string): Promise<string>;

        SaveSaveFile(_fileName: string, _data: string): Promise<string>;

        DeleteSaveFile(_fileName: string): Promise<boolean>;
    }

    //@ts-ignore
    export const Bridge: Bridge | null = window.chrome?.webview?.hostObjects?.bridge;
}