namespace Views.World
{
    export class MapObject extends HTMLElement
    {
        constructor (object: Game.World.Obj)
        {
            super();

            this.object = object;
            this.refresh();
        }

        static get observedAttributes()
        {
            return ["x", "y", "width", "height", "img"];
        }

        attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null)
        {
            switch (name)
            {
                case "x": this.style.gridColumnStart = (this.x + 1).toFixed(0); break;
                case "y": this.style.gridRowStart = (this.y + 1).toFixed(0); break;

                case "width": this.style.gridColumnEnd = (this.x + this.width + 1).toFixed(0); break;
                case "height": this.style.gridRowEnd = (this.y + this.height + 1).toFixed(0); break;

                case "img": this.style.backgroundImage = this.img ? "url('" + this.img + "')" : "none"; break;
            }
        }

        public get x(): number { return parseInt(this.getAttribute("x")); }
        public set x(value: number) { this.setAttribute("x", value.toFixed(0)); }

        public get y(): number { return parseInt(this.getAttribute("y")); }
        public set y(value: number) { this.setAttribute("y", value.toFixed(0)); }

        public get width(): number { return parseInt(this.getAttribute("width")); }
        public set width(value: number) { this.setAttribute("width", value.toFixed(0)); }

        public get height(): number { return parseInt(this.getAttribute("height")); }
        public set height(value: number) { this.setAttribute("height", value.toFixed(0)); }

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
            if (this.internalType) this.classList.remove(this.internalType.toLowerCase());
            if (value) this.classList.add(value.toLowerCase());
            this.internalType = value;
        }

        public object: Game.World.Obj;

        public refresh()
        {
            this.x = this.object.x;
            this.y = this.object.y;
            this.width = this.object.width;
            this.height = this.object.height;
            this.img = this.object.img;
            this.type = Game.Serializer.tryGetType(this.object);
            this.hidden = !!this.object["hidden"];
        }
    }
}
customElements.define("map-object", Views.World.MapObject);