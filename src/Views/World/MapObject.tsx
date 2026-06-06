namespace Views.World
{
    export class MapObject extends HTMLElement
    {
        constructor (object: Game.World.Object)
        {
            super();

            this.object = object;
            this.refresh();
        }

        static get observedAttributes()
        {
            return ["x", "y", "img"];
        }

        attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null)
        {
            switch (name)
            {
                case "x": this.style.gridColumn = (this.x + 1).toString(); break;
                case "y": this.style.gridRow = (this.y + 1).toString(); break;
                case "img": this.style.backgroundImage = this.img ? "url('" + this.img + "')" : "none"; break;
            }
        }

        public get x(): number { return parseInt(this.getAttribute("x")); }
        public set x(value: number) { this.setAttribute("x", value.toFixed(0)); }

        public get y(): number { return parseInt(this.getAttribute("y")); }
        public set y(value: number) { this.setAttribute("y", value.toFixed(0)); }

        public get img(): string { return this.getAttribute("img"); }
        public set img(value: string)
        {
            if (value) this.setAttribute("img", value);
            else this.removeAttribute("img");
        }

        private internalType: string;
        public get type(): string { return this.internalType; }
        public set type(value: string)
        {
            this.classList.remove(this.internalType?.toLowerCase());
            this.classList.add(value?.toLowerCase());
            this.internalType = value;
        }

        public object: Game.World.Object;

        public refresh()
        {
            this.x = this.object.x;
            this.y = this.object.y;
            this.img = this.object.img;
            this.type = Game.Serializer.getType(this.object);
            this.hidden = !!this.object.hidden;
        }
    }
}
customElements.define("map-object", Views.World.MapObject);