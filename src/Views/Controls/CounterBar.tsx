namespace Views.Controls
{
    export class CounterBar extends UI.Elements.CustomElement
    {
        constructor ()
        {
            super();

            this.shadowRoot.appendChild(this.build());

            this.root = this.shadowRoot.getElementById("counter-bar-root") as HTMLDivElement;
        }

        private root: HTMLDivElement;

        private build()
        {
            return (<div id="counter-bar-root">
                <slot />
            </div>);
        }

        static get observedAttributes() { return ["src", "value", "max"]; }
        attributeChangedCallback(name: string, oldValue: string, newValue: string)
        {
            if (oldValue === newValue) return;
            switch (name)
            {
                case "src":
                    for (const img of this.root.querySelectorAll("img"))
                        img.src = this.src;
                    break;
                case "value": this.refreshValue(); break;
                case "max": this.refreshMax(); this.refreshValue(); break;
            }
        }

        public get src(): string { return this.getAttribute("src") ?? ""; }
        public set src(value: string) { this.setAttribute("src", value); }

        public get value(): number { return parseInt(this.getAttribute("value") ?? "0"); }
        public set value(value: number) { this.setAttribute("value", value.toFixed()); }

        public get max(): number { return parseInt(this.getAttribute("max") ?? "0"); }
        public set max(value: number) { this.setAttribute("max", value.toFixed()); }

        private refreshValue()
        {
            let i = 0;
            for (const img of this.root.querySelectorAll("img"))
                img.classList.toggle("disabled", i++ >= this.value);
        }

        private refreshMax()
        {
            while (this.root.lastElementChild && this.root.lastElementChild instanceof HTMLImageElement)
                this.root.lastElementChild.remove();
            for (let i = 0; i < this.max; i++)
                this.root.appendChild(<img src={ this.src } />);
        }
    }
}

customElements.define("counter-bar", Views.Controls.CounterBar);
declare namespace UI.Generator.JSX
{
    interface CustomElements
    {
        "counter-bar": Views.Controls.CounterBar;
    }
}