namespace Views.Battle
{
    export class ActionLine extends UI.Elements.CustomElement
    {
        constructor ()
        {
            super();

            this.shadowRoot.appendChild(this.build());

            this.root = this.shadowRoot.getElementById("action-line-root") as HTMLDivElement;
            this.iconDiv = this.shadowRoot.getElementById("action-line-icon") as HTMLDivElement;
            this.nameSpan = this.shadowRoot.getElementById("action-line-name") as HTMLSpanElement;
            this.actionCostSpan = this.shadowRoot.getElementById("action-line-action-cost") as HTMLSpanElement;
        }

        private root: HTMLDivElement;
        private iconDiv: HTMLDivElement;
        private nameSpan: HTMLSpanElement;
        private actionCostSpan: HTMLSpanElement;

        private build()
        {
            return (<div id="action-line-root">
                <div id="action-line-icon" />
                <span id="action-line-name" />
                <span id="action-line-action-cost" />
                <slot />
            </div>);
        }

        static get observedAttributes() { return ["icon", "name", "action-cost"]; }
        attributeChangedCallback(name: string, oldValue: string, newValue: string)
        {
            if (oldValue == newValue) return;
            switch (name)
            {
                case "icon": this.iconDiv.style.backgroundImage = "url('" + newValue + "')"; break;
                case "name": this.nameSpan.textContent = newValue; break;
                case "action-cost":
                    {
                        const value = Integer.parse(newValue);
                        this.actionCostSpan.textContent = value == 0 || Number.isNaN(value) ? null : Integer.toString(value);
                        break;
                    }
            }
        }

        public get icon(): string { return this.getAttribute("icon"); }
        public set icon(value: string) { this.setAttribute("icon", value); }

        public get name(): string { return this.getAttribute("name"); }
        public set name(value: string) { this.setAttribute("name", value); }

        public get actionCost(): number { return parseInt(this.getAttribute("action-cost") ?? "0"); }
        public set actionCost(value: number) { this.setAttribute("action-cost", Integer.toString(value)); }

        public action: Game.Battle.Action;
    }
}

customElements.define("action-line", Views.Battle.ActionLine);
declare namespace UI.Generator.JSX
{
    interface CustomElements
    {
        "action-line": Views.Battle.ActionLine;
    }
}