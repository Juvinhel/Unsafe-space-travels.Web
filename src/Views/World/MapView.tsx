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

        private build()
        {
            return (<div id="map-view-root">
                { this.coordinatesSpan = <span id="map-view-coordinates" /> as HTMLSpanElement }
                { this.gridDiv = <div id="map-view-grid" /> as HTMLDivElement }
            </div>);
        }

        public load(map: Game.World.Map, playerPosition: Game.World.Point)
        {
            this.map = map;
            this.helper = new Game.World.MapHelper(this.map);
            this.playerPosition = playerPosition;

            this.gridDiv.style.setProperty("--tile-width", this.map.tilewidth + "px");
            this.gridDiv.style.setProperty("--tile-height", this.map.tileheight + "px");
            this.gridDiv.style.setProperty("--columns-count", this.map.width.toFixed());
            this.gridDiv.style.setProperty("--rows-count", this.map.height.toFixed());

            this.gridDiv.clearChildren();
            this.gridDiv.append(...this.buildTiles());
            this.gridDiv.append(<div class="player" style={ { gridColumn: 1, gridRow: 1 } } />);
            this.gridDiv.append(...this.buildObjects());

            this.player.teleport(this.playerPosition);

            this.loaded = true;
        }

        public unload()
        {
            this.map = null;
            this.helper = null;
            this.playerPosition = null;
            this.gridDiv.clearChildren();
            this.loaded = false;
        }

        public loaded: boolean = false;
        public map: Game.World.Map;
        public helper: Game.World.MapHelper;
        public playerPosition: Game.World.Point;

        connectedCallback()
        {
        }

        private * buildTiles()
        {
            for (let y = 0; y < this.map.height; y++)
                for (let x = 0; x < this.map.width; x++)
                {
                    const ground = this.map.ground[y][x];
                    const style = {
                        gridColumn: x + 1,
                        gridRow: y + 1,
                    } as UI.Style;
                    yield <div class={ ["tile", ground == "Passable" ? "passable" : "impassable"] } x-attribute={ x } y-attribute={ y } style={ style } onclick={ this.tileClick.bind(this) } />;
                }
        }

        private * buildObjects()
        {
            for (const object of this.map.objects.filter(x => Game.World.isObejct(x)))
            {
                const style = {
                    gridColumn: object.x + 1,
                    gridRow: object.y + 1,
                    backgroundImage: object.img ? "url('" + object.img + "')" : "none",
                } as UI.Style;
                yield <div class={ ["object", object.type.toLowerCase()] } style={ style } x-attribute={ object.x } y-attribute={ object.y } object={ object } hidden={ object.hidden } />;
            }
        }

        public refreshObjects()
        {
            for (const objectElement of this.gridDiv.querySelectorAll(".object") as NodeListOf<HTMLDivElement>)
            {
                const object = objectElement["object"] as Game.World.Object;
                objectElement.style.gridColumn = (object.x + 1).toString();
                objectElement.style.gridRow = (object.y + 1).toString();
                objectElement.style.backgroundImage = object.img ? "url('" + object.img + "')" : "none";
                objectElement.hidden = !!object.hidden;
                objectElement.setAttribute("x", object.x.toString());
                objectElement.setAttribute("y", object.y.toString());
            }
            this.dispatchEvent(new CustomEvent(RefreshMovementEventName, { detail: this.playerPosition }));
        }

        private scrollToPosition(p: Game.World.Point)
        {
            const tile = this.getTile(p);
            tile.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
        }

        private getTile(p: Game.World.Point)  
        {
            return this.gridDiv.querySelector(".tile[x='" + p.x + "'][y='" + p.y + "']");
        }

        private getObject(p: Game.World.Point, includeHidden: boolean = false): Game.World.Object
        {
            const objectElement = this.gridDiv.querySelector(".object[x='" + p.x + "'][y='" + p.y + "']" + (includeHidden ? "" : ":not([hidden])"));
            return objectElement?.["object"];
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
                const object = this.mapView.getObject(p);

                if (!object?.blocking)
                {
                    this.position = p;
                    Game.data.position = { map: this.mapView.map.link, x: this.position.x, y: this.position.y };

                    const playerDiv = this.mapView.gridDiv.querySelector(".player") as HTMLDivElement;
                    playerDiv.style.gridColumn = (this.position.x + 1).toString();
                    playerDiv.style.gridRow = (this.position.y + 1).toString();
                    this.mapView.scrollToPosition(p);

                    this.mapView.enterPosition();

                    this.mapView.dispatchEvent(new CustomEvent(RefreshMovementEventName, { detail: this.position }));
                    this.mapView.coordinatesSpan.innerText = this.position.x + ":" + this.position.y;
                }

                if (object)
                {   // interact with object
                    this.mapView.stopAutoMove();
                    if ("tale" in object)
                    {
                        const tale = object.tale.startsWith("/") ? object.tale : { link: this.mapView.map.link, text: object.tale };
                        Game.Story.show(tale, null, true);
                    }
                    return;
                }
            }

            public get canUp(): boolean { return this.mapView.helper.isPassable({ x: this.position.x, y: this.position.y - 1 }); }
            public get canDown(): boolean { return this.mapView.helper.isPassable({ x: this.position.x, y: this.position.y + 1 }); }
            public get canLeft(): boolean { return this.mapView.helper.isPassable({ x: this.position.x - 1, y: this.position.y }); }
            public get canRight(): boolean { return this.mapView.helper.isPassable({ x: this.position.x + 1, y: this.position.y }); }

            public get upAction(): DirectionAction
            {
                const object = this.mapView.getObject({ x: this.position.x, y: this.position.y - 1 });
                if (!object) return "Move";
                if (Game.World.isInteractive(object)) return "Examine";
                if (Game.World.isPerson(object)) return "Talk";
                return "Move";
            }
            public get downAction(): DirectionAction
            {
                const object = this.mapView.getObject({ x: this.position.x, y: this.position.y + 1 });
                if (!object) return "Move";
                if (Game.World.isInteractive(object)) return "Examine";
                if (Game.World.isPerson(object)) return "Talk";
                return "Move";
            }
            public get leftAction(): DirectionAction
            {
                const object = this.mapView.getObject({ x: this.position.x - 1, y: this.position.y });
                if (!object) return "Move";
                if (Game.World.isInteractive(object)) return "Examine";
                if (Game.World.isPerson(object)) return "Talk";
                return "Move";
            }
            public get rightAction(): DirectionAction
            {
                const object = this.mapView.getObject({ x: this.position.x + 1, y: this.position.y });
                if (!object) return "Move";
                if (Game.World.isInteractive(object)) return "Examine";
                if (Game.World.isPerson(object)) return "Talk";
                return "Move";
            }
        }(this);

        private enterPosition()
        {
            this.scrollToPosition(this.playerPosition);

            const objects = this.map.objects.filter(o => Game.World.contains(o, this.playerPosition));
            const ambients = objects.filter(x => Game.World.isAmbient(x));

            const tales = ambients.map(x => x.tale.startsWith("/") ? x.tale : { link: this.map.link, text: x.tale });

            Game.Story.showAmbient(...tales);
        }

        private preventKeyBoardScroll(e: KeyboardEvent)
        {
            //TODO: not working
            if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code))
                e.preventDefault();
        }

        private tileClick(e: Event)
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
            if (!this.helper.isPassable(to)) return;

            const astar = new Game.World.AStar(this.map);
            const path = astar.calculatePath(from, to);
            if (!path) return;

            for (const point of path)
            {
                const tile = this.gridDiv.querySelector(".tile[x='" + point.x + "'][y='" + point.y + "']");
                tile.classList.add("auto-move");
            }
        }

        private clearAutoMove()
        {
            for (const tile of this.gridDiv.querySelectorAll(".tile"))
                tile.classList.remove("auto-move");
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

            const currentTile = this.gridDiv.querySelector(".tile[x='" + this.playerPosition.x + "'][y='" + this.playerPosition.y + "']");
            if (!currentTile.classList.contains("auto-move"))
            {
                this.stopAutoMove();
                return;
            }

            const upTile = this.gridDiv.querySelector(".tile[x='" + this.playerPosition.x + "'][y='" + (this.playerPosition.y - 1) + "']");
            const downTile = this.gridDiv.querySelector(".tile[x='" + this.playerPosition.x + "'][y='" + (this.playerPosition.y + 1) + "']");
            const leftTile = this.gridDiv.querySelector(".tile[x='" + (this.playerPosition.x - 1) + "'][y='" + this.playerPosition.y + "']");
            const rightTile = this.gridDiv.querySelector(".tile[x='" + (this.playerPosition.x + 1) + "'][y='" + this.playerPosition.y + "']");

            const nextTile = [upTile, downTile, leftTile, rightTile].filter(t => t && t.classList.contains("auto-move")).first();
            if (!nextTile)
            {
                this.stopAutoMove();
                return;
            }

            currentTile.classList.remove("auto-move");
            const x = parseInt(nextTile.getAttribute("x"));
            const y = parseInt(nextTile.getAttribute("y"));
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