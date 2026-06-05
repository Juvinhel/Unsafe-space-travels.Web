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
                <button id="move-pad-up" state="Move" onclick={ () => this.up() } />
                <button id="move-pad-down" state="Move" onclick={ () => this.down() } />
                <button id="move-pad-left" state="Move" onclick={ () => this.left() } />
                <button id="move-pad-right" state="Move" onclick={ () => this.right() } />
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

        public get upState(): DirectionAction { return this.upButton.getAttribute("state") as DirectionAction; }
        public set upState(state: DirectionAction) { this.upButton.setAttribute("state", state); }

        public get downState(): DirectionAction { return this.downButton.getAttribute("state") as DirectionAction; }
        public set downState(state: DirectionAction) { this.downButton.setAttribute("state", state); }

        public get leftState(): DirectionAction { return this.leftButton.getAttribute("state") as DirectionAction; }
        public set leftState(state: DirectionAction) { this.leftButton.setAttribute("state", state); }

        public get rightState(): DirectionAction { return this.rightButton.getAttribute("state") as DirectionAction; }
        public set rightState(state: DirectionAction) { this.rightButton.setAttribute("state", state); }

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

    export type DirectionAction = "Move" | "Examine" | "Talk";
}
customElements.define("move-pad", Views.World.MovePad);