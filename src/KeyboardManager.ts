class KeyboardManager
{
    constructor ()
    {
        this.LoadBindings();

        window.addEventListener('keydown', e => this.keyDown(e));
        window.addEventListener('keyup', e => this.keyUp(e));
    }

    private keyDown(e: KeyboardEvent)
    {
        if (!this.InputManager) return;
        for (const [input, binding] of Object.entries(this.Bindings))
            if (binding.includes(this.getKey(e.key)))
                this.InputManager.Down(input as Input);
    }

    private keyUp(e: KeyboardEvent)
    {
        if (!this.InputManager) return;
        for (const [input, binding] of Object.entries(this.Bindings))
            if (binding.includes(this.getKey(e.key)))
                this.InputManager.Up(input as Input);
    }

    private getKey(keyCode: string): string
    {
        if (keyCode == " ") return "Space";
        if (keyCode.length == 1) return keyCode.toUpperCase();
        return keyCode;
    }

    public InputManager: InputManager;

    public LoadBindings()
    {
        for (const input of Object.keys(this.Bindings))
        {
            const binding = this.getBindingFromStorage(input);
            if (binding) this.Bindings[input] = binding;
        }
    }

    public SaveBindings()
    {
        for (const [input, binding] of Object.entries(this.Bindings))
            this.saveBindingToStorage(input, binding);
    }

    private getBindingFromStorage(input: string): string[] | null
    {
        return localStorage.get<string[]>("keyboard-binding-" + input);
    }

    private saveBindingToStorage(input: string, binding: string[])
    {
        localStorage.set("keyboard-binding-" + input, binding);
    }

    public DefaultBindings: { [key in Input]: string[] } = {
        Up: ["ArrowUp", "W"],
        Down: ["ArrowDown", "S"],
        Left: ["ArrowLeft", "A"],
        Right: ["ArrowRight", "D"],

        OK: ["Enter", "Space"],
        Back: ["Escape"],
        Previous: ["Q"],
        Next: ["E"],
    };

    public Bindings: { [key in Input]: string[] } = Object.clone(this.DefaultBindings);
}