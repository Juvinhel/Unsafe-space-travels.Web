namespace Views.World
{
    export const MoveEventName = "movepadmove";

    export class MovePad extends UI.Elements.CustomElement
    {
        constructor ()
        {
            super();

            this.shadowRoot.appendChild(this.build());

            this.root = this.shadowRoot.getElementById("move-pad-root") as HTMLDivElement;
            this.upButton = this.shadowRoot.getElementById("move-pad-up") as HTMLButtonElement;
            this.downButton = this.shadowRoot.getElementById("move-pad-down") as HTMLButtonElement;
            this.leftButton = this.shadowRoot.getElementById("move-pad-left") as HTMLButtonElement;
            this.rightButton = this.shadowRoot.getElementById("move-pad-right") as HTMLButtonElement;

            globalInput.registerEvent(this, this.globalInput.bind(this));
        }

        private root: HTMLDivElement;
        private upButton: HTMLButtonElement;
        private downButton: HTMLButtonElement;
        private leftButton: HTMLButtonElement;
        private rightButton: HTMLButtonElement;

        public active: boolean = false;

        private build()
        {
            return (<div id="move-pad-root">
                <button id="move-pad-up" onclick={ () => this.up() }></button>
                <button id="move-pad-down" onclick={ () => this.down() }></button>
                <button id="move-pad-left" onclick={ () => this.left() }></button>
                <button id="move-pad-right" onclick={ () => this.right() }></button>
            </div>);
        }

        public get canUp(): boolean { return !this.upButton.disabled; }
        public set canUp(value: boolean) { this.upButton.disabled = !value; }

        public get canDown(): boolean { return !this.downButton.disabled; }
        public set canDown(value: boolean) { this.downButton.disabled = !value; }

        public get canLeft(): boolean { return !this.leftButton.disabled; }
        public set canLeft(value: boolean) { this.leftButton.disabled = !value; }

        public get canRight(): boolean { return !this.rightButton.disabled; }
        public set canRight(value: boolean) { this.rightButton.disabled = !value; }

        private up()
        {
            if (!this.active) return;

            if (this.canUp)
            {
                const event = new CustomEvent(MoveEventName, { detail: "Up" });
                this.dispatchEvent(event);
            }
        }

        private down()
        {
            if (!this.active) return;

            if (this.canDown)
            {
                const event = new CustomEvent(MoveEventName, { detail: "Down" });
                this.dispatchEvent(event);
            }
        }

        private left()
        {
            if (!this.active) return;

            if (this.canLeft)
            {
                const event = new CustomEvent(MoveEventName, { detail: "Left" });
                this.dispatchEvent(event);
            }
        }

        private right()
        {
            if (!this.active) return;

            if (this.canRight)
            {
                const event = new CustomEvent(MoveEventName, { detail: "Right" });
                this.dispatchEvent(event);
            }
        }

        private globalInput(e: GlobalInputEvent)
        {
            switch (e.state)
            {
                case "Down": if (this.inputDown(e.input)) e.preventDefault(); break;
                case "Press": if (this.inputPress(e.input)) e.preventDefault(); break;
            }
        }

        private inputDown(input: Input): boolean
        {
            switch (input)
            {
                case "Up": this.up(); return true;
                case "Down": this.down(); return true;
                case "Left": this.left(); return true;
                case "Right": this.right(); return true;
            }
            return false;
        }

        private inputPress(input: Input): boolean
        {
            switch (input)
            {
                case "Up": this.up(); return true;
                case "Down": this.down(); return true;
                case "Left": this.left(); return true;
                case "Right": this.right(); return true;
            }
        }
    }
}
customElements.define("move-pad", Views.World.MovePad);