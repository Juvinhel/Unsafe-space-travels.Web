namespace Game.World
{
    export const parser = new class
    {
        /* private */ domparser = new DOMParser();

        public async loadMap(url: string): Promise<Map>
        {
            const text = await (await fetch(url)).text();

            let [path, file] = url.trimChar("/").splitLast("/");
            if (!file) { file = path; path = ""; };
            const [fileName, extension] = file.splitLast(".");
            const document = this.domparser.parseFromString(text, "text/xml");

            const root = document.querySelector(":root") as Element;

            return await this.parseMap(url, path, fileName, extension, root);
        }

        /* private */ async parseMap(link: string, path: string, fileName: string, extension: string, root: Element): Promise<Map>
        {
            const name = this.parseProperties(root)["name"] as string ?? fileName;
            const width = parseInt(root.getAttribute("width"));
            const height = parseInt(root.getAttribute("height"));
            const tileWidth = parseInt(root.getAttribute("tilewidth"));
            const tileHeight = parseInt(root.getAttribute("tileheight"));

            const mergedTiles: string[] = [];
            for (const tilesetElement of root.querySelectorAll(":scope > tileset"))
            {
                const firstgid = parseInt(tilesetElement.getAttribute("firstgid"));
                const source = tilesetElement.getAttribute("source");

                let tileset: Tileset;
                if (source)
                {   // extern
                    const tilesetLink = resolveLink(source, link);
                    tileset = await this.loadTileset(tilesetLink);
                }
                else    // inline
                    tileset = this.parseTileset(link, tilesetElement);

                for (const tile of tileset.tiles)
                {
                    const id = firstgid + tile.id;
                    mergedTiles[id] = tile.link;
                }
            }

            const ground = new FixedMatrix<Ground>(width, height);// groundLayer.map<Ground>((x, y, v) => v == 0 ? "Impassable" : "Passable");
            for (const layerElement of root.querySelectorAll(":scope > layer"))
            {
                if (layerElement.getAttribute("name") == "Ground") break;

                const tiles = this.getLayer(layerElement);
                for (let y = 0; y < ground.height; ++y)
                    for (let x = 0; x < ground.width; ++x)
                        if (tiles.get(x, y))
                            ground.set(x, y, "Passable");
            }

            const layers: Layer[] = [];
            for (const layerElement of root.querySelectorAll(":scope > layer, :scope > objectgroup"))
            {
                const name = layerElement.getAttribute("name");
                if (name == "Player") layers.push({ name: "Player" });
                else if (name == "Ground") layers.push({ name: "Ground" });
                else switch (layerElement.tagName)
                {
                    case "layer": //cell layer
                        layers.push(this.parseCellLayer(layerElement, mergedTiles));
                        break;
                    case "objectgroup": //object layer
                        layers.push(this.parseObjectLayer(layerElement, tileWidth, tileHeight, mergedTiles));
                        break;
                }
            }

            const map = new Map();
            map.link = link;
            map.name = name;
            map.width = width;
            map.height = height;
            map.tileWidth = tileWidth;
            map.tileHeight = tileHeight;
            map.ground = ground;
            map.layers = layers;
            return map;
        }

        /* private */ getLayer(element: Element): FixedMatrix<number>
        {
            const data = element.querySelector(":scope > data");
            const text = data.textContent.trim();
            const ret: number[][] = [];
            for (const line of text.splitLines())
            {
                const cells = line.split(",");

                const row: number[] = [];
                for (const cell of cells)
                    row.push(parseInt(cell));

                ret.push(row);
            }

            return new FixedMatrix<number>(ret[0].length, ret.length, ret);
        }

        /* private */ parseCellLayer(layerElement, mergedTiles: string[]): CellLayer
        {
            const name = layerElement.getAttribute("name");
            const tiles = this.getLayer(layerElement);
            const cells = tiles.map((x, y, t) => t > 0 ? { link: mergedTiles[t] } : null);
            return { name, cells };
        }

        /* private */ parseObjectLayer(objectGroupElement: Element, tileWidth: number, tileHeight: number, mergedTiles: string[]): ObjectLayer
        {
            const name = objectGroupElement.getAttribute("name");
            const objects: Obj[] = [];
            for (const objectElement of objectGroupElement.querySelectorAll(":scope > object"))
            {
                const properties = this.parseProperties(objectElement);
                const name = objectElement.getAttribute("name");
                const type = objectElement.getAttribute("type");
                const x = parseInt(objectElement.getAttribute("x")) / tileWidth;
                const y = parseInt(objectElement.getAttribute("y")) / tileHeight;
                const width = parseInt(objectElement.getAttribute("width")) / tileWidth;
                const height = parseInt(objectElement.getAttribute("height")) / tileHeight;
                const gid = parseInt(objectElement.getAttribute("gid"));
                if (!isNaN(gid)) properties["img"] = mergedTiles[gid];

                const obj = (Serializer.isKnown(type) ? Serializer.create(type) : { type }) as Obj;
                if (name) obj["name"] = name;
                obj.x = x;
                obj.y = y;
                obj.width = width;
                obj.height = height;
                globalThis.Object.mutate(obj, properties);
                objects.push(obj);
            }
            return { name, objects };
        }

        /* private */ async loadTileset(url: string): Promise<Tileset>
        {
            if (url in this.tilesets) return this.tilesets[url];

            const text = await (await fetch(url)).text();

            const document = this.domparser.parseFromString(text, "text/xml");
            const root = document.querySelector(":root") as Element;

            const ret = this.parseTileset(url, root);
            this.tilesets[url] = ret;
            return ret;
        }

        /* private */ tilesets: { [link: string]: any; } = {};
        /* private */ parseTileset(link: string, root: Element): Tileset
        {
            const ret: Tileset = { tiles: [] };

            for (const tileElement of root.querySelectorAll(":scope > tile"))
            {
                const id = parseInt(tileElement.getAttribute("id"));
                const imageElement = tileElement.querySelector(":scope > image");
                const source = imageElement.getAttribute("source");
                const tileLink = resolveLink(source, link);
                const properties = this.parseProperties(tileElement);

                ret.tiles.push({ ...properties, id, link: tileLink, });
            }

            return ret;
        }

        /* private */ parseProperties(element: Element): { [name: string]: any; }
        {
            const ret = {};
            for (const propertyElement of element.querySelectorAll(":scope > properties > property"))
            {
                const name = propertyElement.getAttribute("name");
                let value: any = propertyElement.getAttribute("value") ?? propertyElement.textContent;
                const type = propertyElement.getAttribute("type");
                switch (type)
                {
                    default:
                    case "string": break;
                    case "bool": value = value == "true"; break;
                    case "int": value = parseInt(value); break;
                    case "float": value = parseFloat(value); break;
                    case "class":
                        const type = propertyElement.getAttribute("propertytype");
                        switch (type)
                        {
                            case "Point":
                                value = { x: 0, y: 0 };
                                globalThis.Object.mutate(value, this.parseProperties(propertyElement));
                                break;
                            default:
                                value = Serializer.isKnown(type) ? Serializer.create(type) : { type };
                                globalThis.Object.mutate(value, this.parseProperties(propertyElement));
                                break;
                        }
                        break;
                }
                ret[name] = value;
            }
            return ret;
        }
    }();
}