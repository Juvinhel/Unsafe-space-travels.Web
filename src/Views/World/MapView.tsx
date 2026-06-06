namespace Views.World
{
    export const RefreshMovementEventName = "refreshmovement";

    export class MapView extends UI.Elements.CustomElement
    {
        constructor ()
        {
            super();

            this.addEventListener("keydown", this.preventKeyBoardScroll.bind(this), { capture: true, passive: false });
            this.addEventListener("keypress", this.preventKeyBoardScroll.bind(this), { capture: true, passive: false });
            this.addEventListener("keyup", this.preventKeyBoardScroll.bind(this), { capture: true, passive: false });

            globalInput.registerEvent(this, this.globalInput.bind(this));

            this.shadowRoot.appendChild(this.build());
        }

        private coordinatesSpan: HTMLSpanElement;
        private gridDiv: HTMLDivElement;
        private playerDiv: HTMLDivElement;

        private build()
        {
            return (<div id="map-view-root">
                { this.coordinatesSpan = <span id="map-view-coordinates" /> as HTMLSpanElement }
                { this.gridDiv = <div id="map-view-grid" /> as HTMLDivElement }
            </div>);
        }

        public load(map: Game.World.Map, playerPosition: Game.World.Point)
        {
            console.log("map", map);
            this.map = map;
            this.playerPosition = playerPosition;

            this.gridDiv.style.setProperty("--tile-width", this.map.tilewidth + "px");
            this.gridDiv.style.setProperty("--tile-height", this.map.tileheight + "px");
            this.gridDiv.style.setProperty("--columns-count", this.map.width.toFixed());
            this.gridDiv.style.setProperty("--rows-count", this.map.height.toFixed());

            this.gridDiv.clearChildren();
            for (const layer of this.map.layers)
                this.gridDiv.append(<div class={ ["layer"] }>{ this.buildLayer(layer) }</div>);
            this.gridDiv.append(<div class={ ["layer", "ground-layer"] }>{ this.buildGround() }</div>);
            this.gridDiv.append(<div class={ ["layer", "player-layer"] }>{ this.playerDiv = <div class="player" style={ { gridColumn: 1, gridRow: 1 } } /> as HTMLDivElement }</div>);
            this.gridDiv.append(<div class={ ["layer", "object-layer"] }>{ this.buildObjects() }</div>);

            this.player.teleport(this.playerPosition);

            this.loaded = true;
        }

        public unload()
        {
            this.map = null;
            this.playerPosition = null;
            this.gridDiv.clearChildren();
            this.loaded = false;
        }

        public loaded: boolean = false;
        public map: Game.World.Map;
        public playerPosition: Game.World.Point;

        connectedCallback()
        {
        }

        private * buildGround()
        {
            for (const { x, y, value } of this.map.ground)
            {
                const style = {
                    gridColumn: x + 1,
                    gridRow: y + 1,
                } as UI.Style;
                yield <div class={ ["ground", value == "Passable" ? "passable" : "impassable"] } x-attribute={ x } y-attribute={ y } style={ style } onclick={ this.groundClick.bind(this) } />;
            }
        }

        private * buildLayer(layer: Game.World.Layer)
        {
            for (const { x, y, value } of layer.cells)
                if (value)
                {
                    const style = {
                        gridColumn: x + 1,
                        gridRow: y + 1,
                        backgroundImage: "url('" + value.link + "')",
                    } as UI.Style;
                    yield <div class={ ["tile"] } x-attribute={ x } y-attribute={ y } style={ style } />;
                }
        }

        private * buildObjects()
        {
            for (const object of this.map.objects.filter(x => x instanceof Game.World.Object))
                yield new MapObject(object);
        }

        public refreshObjects()
        {
            for (const objectElement of this.gridDiv.querySelectorAll("map-object") as NodeListOf<MapObject>)
                objectElement.refresh();
            this.dispatchEvent(new CustomEvent(RefreshMovementEventName, { detail: this.playerPosition }));
        }

        private scrollToPosition(p: Game.World.Point)
        {
            const ground = this.getGround(p);
            ground.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
        }

        private getGround(p: Game.World.Point)  
        {
            return this.gridDiv.querySelector(".ground[x='" + p.x + "'][y='" + p.y + "']");
        }

        public player = new class Player
        {
            constructor (mapView: MapView)
            {
                this.mapView = mapView;
            }

            /* private */ mapView: MapView;
            public get position() { return this.mapView.playerPosition; }
            private set position(value) { this.mapView.playerPosition = value; }

            public teleport(p: Game.World.Point)
            {
                this.goto(p);
                this.mapView.stopAutoMove();
            }

            public move(d: Game.World.Direction)
            {
                if (!Game.World.movementAllowed()) return;
                if (d == "Up" && !this.canUp) return;
                if (d == "Down" && !this.canDown) return;
                if (d == "Left" && !this.canLeft) return;
                if (d == "Right" && !this.canRight) return;

                const x = this.position.x + (d == "Left" ? -1 : d == "Right" ? 1 : 0);
                const y = this.position.y + (d == "Up" ? -1 : d == "Down" ? 1 : 0);

                this.goto({ x, y });
                this.mapView.stopAutoMove();
            }

            public goto(p: Game.World.Point)
            {
                this.mapView.enterPosition(p);
            }

            public get canUp(): boolean { return this.mapView.map.isPassable({ x: this.position.x, y: this.position.y - 1 }); }
            public get canDown(): boolean { return this.mapView.map.isPassable({ x: this.position.x, y: this.position.y + 1 }); }
            public get canLeft(): boolean { return this.mapView.map.isPassable({ x: this.position.x - 1, y: this.position.y }); }
            public get canRight(): boolean { return this.mapView.map.isPassable({ x: this.position.x + 1, y: this.position.y }); }

            public get upAction(): DirectionAction
            {
                const object = this.mapView.map.getTopObject({ x: this.position.x, y: this.position.y - 1 });
                if (!object) return "Move";
                if (object instanceof Game.World.Interactive) return object.action ?? "Examine";
                return "Move";
            }
            public get downAction(): DirectionAction
            {
                const object = this.mapView.map.getTopObject({ x: this.position.x, y: this.position.y + 1 });
                if (!object) return "Move";
                if (object instanceof Game.World.Interactive) return object.action ?? "Examine";
                return "Move";
            }
            public get leftAction(): DirectionAction
            {
                const object = this.mapView.map.getTopObject({ x: this.position.x - 1, y: this.position.y });
                if (!object) return "Move";
                if (object instanceof Game.World.Interactive) return object.action ?? "Examine";
                return "Move";
            }
            public get rightAction(): DirectionAction
            {
                const object = this.mapView.map.getTopObject({ x: this.position.x + 1, y: this.position.y });
                if (!object) return "Move";
                if (object instanceof Game.World.Interactive) return object.action ?? "Examine";
                return "Move";
            }
        }(this);

        private enterPosition(p: Game.World.Point): boolean
        {
            const object = this.map.getTopObject(p);
            if (!object || !object.blocking)
            {   // can enter new position
                this.playerPosition = p;
                Game.data.position = { map: this.map.link, x: this.playerPosition.x, y: this.playerPosition.y };

                this.playerDiv.style.gridColumn = (this.playerPosition.x + 1).toString();
                this.playerDiv.style.gridRow = (this.playerPosition.y + 1).toString();
                this.scrollToPosition(this.playerPosition);

                const ambients = this.map.getAmbients(this.playerPosition);
                const tales = ambients.map(x => x.tale.startsWith("/") ? x.tale : { link: this.map.link, text: x.tale });
                Game.Story.showAmbient(...tales);

                this.dispatchEvent(new CustomEvent(RefreshMovementEventName, { detail: this.playerPosition }));
                this.coordinatesSpan.innerText = this.playerPosition.x + ":" + this.playerPosition.y;
            }

            if (object)
            {   // interact with object
                this.stopAutoMove();
                if (object instanceof Game.World.Interactive)
                {
                    const tale = object.tale.startsWith("/") ? object.tale : { link: this.map.link, text: object.tale };
                    Game.Story.show(tale, object.action ?? "Examine", true);
                }
                return;
            }

            const events = this.map.getEvents(this.playerPosition);
            for (const event of events)
                if (event.probability && Math.random() < event.probability)
                {
                    this.stopAutoMove();
                    const tale = event.tale.startsWith("/") ? event.tale : { link: this.map.link, text: event.tale };
                    Game.Story.show(tale, "Event", false);
                }

            const encounters = this.map.getEncounters(this.playerPosition);
            for (const encounter of encounters)
                if (encounter.probability && Math.random() < encounter.probability)
                {
                    this.stopAutoMove();
                    //TODO:
                }
        }

        private preventKeyBoardScroll(e: KeyboardEvent)
        {
            //TODO: not working
            if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code))
                e.preventDefault();
        }

        private groundClick(e: Event)
        {
            const tile = e.currentTarget as HTMLDivElement;
            const x = parseInt(tile.getAttribute("x"));
            const y = parseInt(tile.getAttribute("y"));

            this.calculateAutoMove({ x, y });
            this.startAutoMove();
        }

        private globalInput(e: GlobalInputEvent)
        {
            if (!this.loaded) return;

            switch (e.state)
            {
                case "Down":
                case "Press":
                case "Up":
                    if (e.input == "Back")
                    {
                        this.stopAutoMove();
                        e.preventDefault();
                    }
                    break;
            }
        }

        //#region AutoMove
        private calculateAutoMove(to: Game.World.Point)
        {
            this.clearAutoMove();

            const from = this.player.position;
            if (!this.map.isPassable(to)) return;

            const astar = new Game.World.AStar(this.map);
            const path = astar.calculatePath(from, to);
            if (!path) return;

            for (const point of path)
            {
                const ground = this.getGround(point);
                ground.classList.add("auto-move");
            }
        }

        private clearAutoMove()
        {
            for (const ground of this.gridDiv.querySelectorAll(".ground"))
                ground.classList.remove("auto-move");
        }

        private autoMoveInterval: number;
        private startAutoMove()
        {
            if (!this.autoMoveInterval)
                this.autoMoveInterval = setInterval(this.doAutoMove.bind(this), (200));
        }

        private doAutoMove()
        {
            if (!Game.World.movementAllowed())
            {
                this.stopAutoMove();
                return;
            }

            const playerGround = this.getGround(this.playerPosition);
            if (!playerGround.classList.contains("auto-move"))
            {
                this.stopAutoMove();
                return;
            }

            const upTile = this.getGround({ x: this.playerPosition.x, y: this.playerPosition.y - 1 });
            const downTile = this.getGround({ x: this.playerPosition.x, y: this.playerPosition.y + 1 });
            const leftTile = this.getGround({ x: this.playerPosition.x - 1, y: this.playerPosition.y });
            const rightTile = this.getGround({ x: this.playerPosition.x + 1, y: this.playerPosition.y });

            const nextGround = [upTile, downTile, leftTile, rightTile].filter(t => t && t.classList.contains("auto-move")).first();
            if (!nextGround)
            {
                this.stopAutoMove();
                return;
            }

            playerGround.classList.remove("auto-move");
            const x = parseInt(nextGround.getAttribute("x"));
            const y = parseInt(nextGround.getAttribute("y"));
            this.player.goto({ x, y });
        }

        private stopAutoMove()
        {
            this.clearAutoMove();
            clearInterval(this.autoMoveInterval);
            this.autoMoveInterval = 0;
        }
        //#endregion
    }
}
customElements.define("map-view", Views.World.MapView);