const App = new (class App
{
    public async start()
    {
        const result = await fetch("manifest.json");
        const manifest = await result.json();

        this.name = manifest.name;
        this.version = manifest.version;
        this.buildDate = new Date(manifest["build-date"]);
        console.log("Running: " + this.name + " v" + this.version);

        await Views.ShowSplash();

        console.log("loaded");

        this.InputManager = new InputManager();
        this.KeyboardManager = new KeyboardManager();
        this.KeyboardManager.InputManager = this.InputManager;

        await UI.Navigator.navigate("left", Views.Info);
        Views.loadRight();

        Game.start();
    }

    public name: string;
    public version: string;
    public buildDate: Date;

    public InputManager: InputManager;
    public KeyboardManager: KeyboardManager;
    public ImageSelector?: ImageSelector;
})();