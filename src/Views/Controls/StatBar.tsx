namespace Views.Controls
{
    export type StatBarMode = typeof StatBar.modes[number];
    export class StatBar extends UI.Elements.CustomElement
    {
        constructor ()
        {
            super();

            this.shadowRoot.appendChild(this.build());

            this.root = this.shadowRoot.getElementById("stat-bar-root") as HTMLDivElement;
            this.track = this.root.querySelector("#stat-bar-track") as HTMLDivElement;
            this.backgroundTrack = this.root.querySelector("#stat-bar-background-track") as HTMLDivElement;
            this.text = this.root.querySelector("#stat-bar-text") as HTMLDivElement;

            this.addEventListener("click", this.on_click);
        }

        private root: HTMLDivElement;
        private track: HTMLDivElement;
        private backgroundTrack: HTMLDivElement;
        private text: HTMLSpanElement;

        private build()
        {
            return (<div id="stat-bar-root">
                <div id="stat-bar-background-track" />
                <div id="stat-bar-inner">
                    <div id="stat-bar-track" />
                </div>
                <span id="stat-bar-text" />
                <slot />
            </div>);
        }

        static get observedAttributes() { return ["value", "max", "mode", "background-value", "background-max"]; }
        attributeChangedCallback(name: string, oldValue: string, newValue: string)
        {
            if (oldValue === newValue) return;
            switch (name)
            {
                case "value": this.refreshTrack(); break;
                case "max": this.refreshTrack(); break;
                case "background-value": this.refreshBackgroundTrack(); break;
                case "background-max": this.refreshBackgroundTrack(); break;
                case "mode": this.refreshText(); break;
            }
        }

        connectedCallback()
        {
            StatBar.instances.push(this);
        }

        disconnectedCallback()
        {
            StatBar.instances.remove(this);
        }

        public get value(): number { return parseInt(this.getAttribute("value") ?? "0"); }
        public set value(value: number) { this.setAttribute("value", value.toFixed()); }

        public get max(): number { return parseInt(this.getAttribute("max") ?? "0"); }
        public set max(value: number) { this.setAttribute("max", value.toFixed()); }

        public get backgroundValue(): number { return parseInt(this.getAttribute("background-value") ?? "0"); }
        public set backgroundValue(value: number) { this.setAttribute("background-value", value.toFixed()); }

        public get backgroundMax(): number { return parseInt(this.getAttribute("background-max") ?? "0"); }
        public set backgroundMax(value: number) { this.setAttribute("background-max", value.toFixed()); }

        public get mode(): StatBarMode { return this.getAttribute("mode") as StatBarMode ?? "percent"; }
        public set mode(value: StatBarMode) { this.setAttribute("mode", value); }

        public static modes = ["percent", "absolute", "none"] as const;

        private refreshTrack()
        {
            let percent = 0;
            try { percent = (this.value / this.max) * 100; } catch { }
            percent = isNaN(percent) ? 0 : percent;

            this.track.style.width = percent.toFixed(2) + "%";
            this.tooltip = this.value.toFixed() + "/" + this.max.toFixed();
            this.refreshText();
        }

        private refreshBackgroundTrack()
        {
            let percent = 0;
            try { percent = (this.backgroundValue / this.backgroundMax) * 100; } catch { }
            percent = isNaN(percent) ? 0 : percent;

            this.backgroundTrack.style.width = percent.toFixed(2) + "%";

            this.refreshText();
        }

        private refreshText()
        {
            switch (this.mode)
            {
                case "absolute": this.text.textContent = this.value.toFixed() + "/" + this.max.toFixed();; break;
                case "percent":
                    let percent = 0;
                    try { percent = (this.value / this.max) * 100; } catch { }
                    percent = isNaN(percent) ? 0 : percent;
                    this.text.textContent = percent.toFixed(2) + "%";
                    break;
                default:
                case "none":
                    this.text.textContent = "";
                    break;
            }
        }

        private static instances: StatBar[] = [];
        private on_click = function (this: StatBar)
        {
            let i = StatBar.modes.indexOf(this.mode);
            ++i;
            if (i >= StatBar.modes.length) i = 0;

            for (const statBar of StatBar.instances)
                statBar.mode = StatBar.modes[i];
        }.bind(this);
    }
}

customElements.define("stat-bar", Views.Controls.StatBar);
declare namespace UI.Generator.JSX
{
    interface CustomElements
    {
        "stat-bar": Views.Controls.StatBar;
    }
}