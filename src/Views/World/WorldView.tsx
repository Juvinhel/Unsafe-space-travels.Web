namespace Views.World
{
    export class WorldView extends HTMLElement
    {
        constructor ()
        {
            super();

            this.append(...this.build());
        }

        private * build()
        {
            yield this.movePad = new MovePad();
            yield this.titleHeading = <h2 /> as HTMLHeadingElement;
            yield this.mapView = new MapView();

            this.movePad.addEventListener(Views.World.MoveEventName, (e: CustomEvent<Game.World.Direction>) => this.mapView.player.move(e.detail));
            this.mapView.addEventListener(Views.World.RefreshMovementEventName, (e: CustomEvent<Game.World.Point>) => this.refreshMovePad());
        }

        public get loaded(): boolean { return this.classList.contains("loaded"); }
        private set loaded(value: boolean) { this.classList.toggle("loaded", value); }

        public mapView: MapView;
        public titleHeading: HTMLHeadingElement;
        public movePad: MovePad;

        public goto(map: Game.World.Map, playerPosition: Game.World.Point)
        {
            this.unload();
            this.loaded = true; // load first so scrolling in mapView works

            this.titleHeading.textContent = map.name;
            this.mapView.load(map, playerPosition);
            this.movePad.active = true;
            this.refreshMovePad();
        }

        public refreshMovePad()
        {
            this.movePad.canUp = this.mapView.player.canUp;
            this.movePad.canDown = this.mapView.player.canDown;
            this.movePad.canLeft = this.mapView.player.canLeft;
            this.movePad.canRight = this.mapView.player.canRight;
        }

        public unload()
        {
            this.titleHeading.textContent = "";
            this.movePad.active = false;
            this.mapView.unload();
            this.loaded = false;
        }

        public refreshObjects()
        {
            this.mapView.refreshObjects();
        }
    }
}
customElements.define("world-view", Views.World.WorldView);