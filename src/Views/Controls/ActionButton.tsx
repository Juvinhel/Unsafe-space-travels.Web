namespace Views.Controls
{
    export class ActionButton extends UI.Elements.CustomElement
    {
        constructor ()
        {
            super();

            this.shadowRoot.appendChild(this.build());

            this.root = this.shadowRoot.getElementById("action-button-root") as HTMLDivElement;
            this.iconDiv = this.root.querySelector("#action-button-icon") as HTMLDivElement;
            this.textSpan = this.root.querySelector("#action-button-text") as HTMLSpanElement;
            this.actionCostTextSpan = this.root.querySelector("#action-button-action-cost-text") as HTMLSpanElement;
            this.energyCostTextSpan = this.root.querySelector("#action-button-energy-cost-text") as HTMLSpanElement;
            this.quantityCostTextSpan = this.root.querySelector("#action-button-quantity-cost-text") as HTMLSpanElement;
        }

        private root: HTMLDivElement;
        private iconDiv: HTMLDivElement;
        private textSpan: HTMLSpanElement;
        private actionCostTextSpan: HTMLSpanElement;
        private energyCostTextSpan: HTMLSpanElement;
        private quantityCostTextSpan: HTMLSpanElement;

        private build()
        {
            return (<div id="action-button-root">
                <div id="action-button-icon" />
                <span id="action-button-text" />
                <span id="action-button-action-cost-text" />
                <span id="action-button-energy-cost-text" />
                <span id="action-button-quantity-cost-text" />
            </div>);
        }

        static get observedAttributes() { return ["text", "icon", "action-cost", "energy-cost", "quantity-cost"]; }
        attributeChangedCallback(name: string, oldValue: string, newValue: string)
        {
            if (oldValue == newValue) return;
            switch (name)
            {
                case "text": this.textSpan.textContent = newValue; break;
                case "icon": this.iconDiv.style.backgroundImage = "url('" + newValue + "')"; break;
                case "action-cost":
                    {
                        const value = Integer.parse(newValue);
                        this.actionCostTextSpan.textContent = value == 0 || Number.isNaN(value) ? null : Integer.toString(value);
                        break;
                    }
                case "energy-cost":
                    {
                        const value = Integer.parse(newValue);
                        this.energyCostTextSpan.textContent = value == 0 || Number.isNaN(value) ? null : Integer.toString(value);
                        break;
                    }
                case "quantity-cost":
                    {
                        const value = Integer.parse(newValue);
                        this.quantityCostTextSpan.textContent = value == 0 || Number.isNaN(value) ? null : Integer.toString(value);
                        break;
                    }
            }
        }

        public get text(): string { return this.getAttribute("text"); }
        public set text(value: string) { this.setAttribute("text", value); }

        public get icon(): string { return this.getAttribute("icon"); }
        public set icon(value: string) { this.setAttribute("icon", value); }

        public get actionCost(): number { return parseInt(this.getAttribute("action-cost") ?? "0"); }
        public set actionCost(value: number) { this.setAttribute("action-cost", Integer.toString(value)); }

        public get energyCost(): number { return parseInt(this.getAttribute("energy-cost") ?? "0"); }
        public set energyCost(value: number) { this.setAttribute("energy-cost", Integer.toString(value)); }

        public get quantityCost(): number { return parseInt(this.getAttribute("quantity-cost") ?? "0"); }
        public set quantityCost(value: number) { this.setAttribute("quantity-cost", Integer.toString(value)); }
    }
}

customElements.define("action-button", Views.Controls.ActionButton);
declare namespace UI.Generator.JSX
{
    interface CustomElements
    {
        "action-button": Views.Controls.ActionButton;
    }
}