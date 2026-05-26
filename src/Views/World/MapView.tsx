namespace Views.World
{
    export const RefreshMovementEventName = "refreshmovement";

    export class MapView extends UI.Elements.CustomElement
    {
        constructor (map: Game.World.Map, playerPosition: Game.World.Point)
        {
            super();

            this.addEventListener("keydown", this.preventKeyBoardScroll.bind(this), { capture: true, passive: false });
            this.addEventListener("keypress", this.preventKeyBoardScroll.bind(this), { capture: true, passive: false });
            this.addEventListener("keyup", this.preventKeyBoardScroll.bind(this), { capture: true, passive: false });

            this.map = map;
            this.helper = new Game.World.MapHelper(this.map);
            this.playerPosition = playerPosition;
            this.shadowRoot.appendChild(this.build());

            this.root = this.shadowRoot.getElementById("map-view-root") as HTMLDivElement;
            this.coordinatesSpan = this.root.querySelector("#map-view-coordinates");

            globalInput.registerEvent(this, this.globalInput.bind(this));
        }

        private root: HTMLDivElement;
        private coordinatesSpan: HTMLSpanElement;

        private build()
        {
            const style = {
                "--tile-width": this.map.tilewidth + "px",
                "--tile-height": this.map.tileheight + "px",
                "--columns-count": this.map.width,
                "--rows-count": this.map.height,
            } as UI.Style;
            return (<div id="map-view-root" style={ style }>
                <span id="map-view-coordinates" />
                <div id="map-view-grid">
                    { this.buildTiles() }
                    <div class="player" style={ { gridColumn: 1, gridRow: 1 } } />
                    { this.buildObjects() }
                </div>
            </div>);
        }

        public readonly map: Game.World.Map;
        public readonly helper: Game.World.MapHelper;
        public playerPosition: Game.World.Point;

        connectedCallback()
        {
            this.player.teleport(this.playerPosition);
            //! not optimal
            delay(250).then(() =>
            {
                this.scrollToPosition(this.playerPosition);
            });
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
            for (const object of this.map.objects.filter(x => Game.World.isObject(x)))
            {
                const style = {
                    gridColumn: object.x + 1,
                    gridRow: object.y + 1,
                    backgroundImage: object.source ? "url('" + object.source + "')" : "none",
                    visibility: object.hidden ? "hidden" : "visible",
                } as UI.Style;
                yield <div class={ ["object"] } style={ style } object={ object } />;
            }
        }

        public refreshObjects()
        {
            for (const objectElement of this.root.querySelectorAll(".object") as NodeListOf<HTMLDivElement>)
            {
                const object = objectElement["object"] as Game.World.Object;
                objectElement.style.gridColumn = (object.x + 1).toString();
                objectElement.style.gridRow = (object.y + 1).toString();
                objectElement.style.backgroundImage = object.source ? "url('" + object.source + "')" : "none";
                objectElement.style.visibility = object.hidden ? "hidden" : "visible";
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
            return this.root.querySelector(".tile[x='" + p.x + "'][y='" + p.y + "']");
        }

        public player = new class Player
        {
            constructor (mapView: MapView)
            {
                this.mapView = mapView;
            }

            private mapView: MapView;
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
                this.position = p;
                Game.data.position = { map: this.mapView.map.link, x: this.position.x, y: this.position.y };

                const playerDiv = this.mapView.root.querySelector(".player") as HTMLDivElement;
                playerDiv.style.gridColumn = (this.position.x + 1).toString();
                playerDiv.style.gridRow = (this.position.y + 1).toString();
                this.mapView.scrollToPosition(p);

                this.mapView.enterPosition();

                this.mapView.dispatchEvent(new CustomEvent(RefreshMovementEventName, { detail: this.position }));
                this.mapView.coordinatesSpan.innerText = this.position.x + ":" + this.position.y;
            }

            public get canUp(): boolean { return Game.World.movementAllowed() && this.mapView.helper.isPassable({ x: this.position.x, y: this.position.y - 1 }); }
            public get canDown(): boolean { return Game.World.movementAllowed() && this.mapView.helper.isPassable({ x: this.position.x, y: this.position.y + 1 }); }
            public get canLeft(): boolean { return Game.World.movementAllowed() && this.mapView.helper.isPassable({ x: this.position.x - 1, y: this.position.y }); }
            public get canRight(): boolean { return Game.World.movementAllowed() && this.mapView.helper.isPassable({ x: this.position.x + 1, y: this.position.y }); }
        }(this);

        private enterPosition()
        {
            this.scrollToPosition(this.playerPosition);

            const objects = this.map.objects.filter(o => Game.World.contains(o, this.playerPosition));
            const storyObject = objects.filter(x => "story" in x && x.story);
            if (storyObject.length > 0)
            {
                const dep = storyObject.last() as Game.World.Depiction;
                Game.storyManager.show(dep.story);
            }
            else
                Game.storyManager.clear();
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
                const tile = this.root.querySelector(".tile[x='" + point.x + "'][y='" + point.y + "']");
                tile.classList.add("auto-move");
            }
        }

        private clearAutoMove()
        {
            for (const tile of this.root.querySelectorAll(".tile"))
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

            const currentTile = this.root.querySelector(".tile[x='" + this.playerPosition.x + "'][y='" + this.playerPosition.y + "']");
            if (!currentTile.classList.contains("auto-move"))
            {
                this.stopAutoMove();
                return;
            }

            const upTile = this.root.querySelector(".tile[x='" + this.playerPosition.x + "'][y='" + (this.playerPosition.y - 1) + "']");
            const downTile = this.root.querySelector(".tile[x='" + this.playerPosition.x + "'][y='" + (this.playerPosition.y + 1) + "']");
            const leftTile = this.root.querySelector(".tile[x='" + (this.playerPosition.x - 1) + "'][y='" + this.playerPosition.y + "']");
            const rightTile = this.root.querySelector(".tile[x='" + (this.playerPosition.x + 1) + "'][y='" + this.playerPosition.y + "']");

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