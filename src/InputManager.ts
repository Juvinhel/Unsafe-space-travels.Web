class InputManager
{
    constructor ()
    {
        for (const input of Inputs)
            this.InputStates[input] = false;
    }

    private enabled: boolean = true;
    public get Enabled(): boolean { return this.enabled; }
    public set Enabled(value: boolean)
    {
        this.enabled = value;
        if (!this.enabled)
            for (const input of Inputs)
                this.InputStates[input] = false;
    }

    public InitialPressSpeed: number = 500;
    public PressSpeed: number = 100;

    public InputStates: { [key in Input]: boolean } = {} as any;
    private pressedInputs: { [key in Input]?: number; } = {};

    public Down(input: Input)
    {
        if (!this.enabled) return;
        if (!(input in this.pressedInputs))
        {
            this.InputStates[input] = true;

            this.keyDown(input);
            const repeatPress = () =>
            {
                if (input in this.pressedInputs)
                {
                    this.keyPress(input);
                    this.pressedInputs[input] = setTimeout(repeatPress, this.PressSpeed);
                }
            };
            this.pressedInputs[input] = setTimeout(repeatPress, this.InitialPressSpeed);
        }
    }

    public Up(input: Input)
    {
        if (!this.enabled) return;
        if (input in this.pressedInputs)
        {
            this.InputStates[input] = false;
            this.keyUp(input);
            clearTimeout(this.pressedInputs[input]);
            delete this.pressedInputs[input];
        }
    }

    private keyDown(input: Input) { this.fireGlobalEvent(input, "Down"); }
    private keyPress(input: Input) { this.fireGlobalEvent(input, "Press"); }
    private keyUp(input: Input) { this.fireGlobalEvent(input, "Up"); }

    private fireGlobalEvent(input: Input, state: InputState)
    {
        const inputReceivers = [...document.querySelectorAll("." + receiveGlobalInputClass)];
        inputReceivers.sort(function (a, b)
        {
            if (a === b) return 0;
            const comp = a.compareDocumentPosition(b);
            console.log(a, b, comp.toString(2));
            if (comp & 2)
                // b comes before a
                return -1;
            return 1;
        });
        for (const element of inputReceivers)
            if (!this.dispatchGlobalEvent(element, input, state))
                return;
    }

    private dispatchGlobalEvent(element: Element, input: Input, state: InputState): boolean
    {
        const event = new CustomEvent(globalInputEventName, { bubbles: false, cancelable: true }) as GlobalInputEvent;
        event.input = input;
        event.state = state;
        element.dispatchEvent(event);
        return !event.defaultPrevented;
    }
}

const Inputs = ["Up", "Left", "Down", "Right", "OK", "Back", "Previous", "Next"] as const;
type Input = typeof Inputs[number];
type InputState = "Down" | "Up" | "Press";

const globalInput = new class GlobalInput
{
    public registerEvent(element: Element, listener: (e: GlobalInputEvent) => void)
    {
        element.addEventListener(globalInputEventName, listener, { passive: false, capture: false });
        element.classList.toggle(receiveGlobalInputClass, true);
    }

    public removeEvent(element: Element, listener: (e: GlobalInputEvent) => void)
    {
        element.removeEventListener(globalInputEventName, listener, { capture: false });
        element.classList.toggle(receiveGlobalInputClass, false);
    }
}();

interface GlobalInputEvent extends CustomEvent
{
    input: Input;
    state: InputState;
}

const receiveGlobalInputClass = "receive-global-input";
const globalInputEventName = "globalinput";