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
            const name = this.readProperty(root, "name")?.value ?? fileName;
            const width = parseInt(root.getAttribute("width"));
            const height = parseInt(root.getAttribute("height"));
            const tilewidth = parseInt(root.getAttribute("tilewidth"));
            const tileheight = parseInt(root.getAttribute("tileheight"));

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

            const firstLayerElement = root.querySelector(":scope > layer");
            const firstLayer = this.getLayer(firstLayerElement);
            const ground: Ground[][] = firstLayer.map(x => x.map(x => (x == 0 ? "Impassable" : "Passable") as Ground));

            const objects: Obj[] = [];
            for (const objectElement of root.querySelectorAll(":scope > objectgroup > object"))
            {
                const properties = this.parseProperties(objectElement);
                const name = objectElement.getAttribute("name");
                const type = objectElement.getAttribute("type");
                const x = parseInt(objectElement.getAttribute("x")) / tilewidth;
                const y = (parseInt(objectElement.getAttribute("y")) / tileheight);
                const width = parseInt(objectElement.getAttribute("width")) / tilewidth;
                const height = parseInt(objectElement.getAttribute("height")) / tileheight;
                const gid = parseInt(objectElement.getAttribute("gid"));
                if (!isNaN(gid)) properties["img"] = mergedTiles[gid];
                objects.push({ ...properties, name, type, x, y, width, height });
            }

            const map = new Map();
            map.link = link;
            map.name = name;
            map.width = width;
            map.height = height;
            map.tilewidth = tilewidth;
            map.tileheight = tileheight;
            map.ground = ground;
            map.objects = objects;
            return map;
        }

        /* private */ getLayer(element: Element): number[][]
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

            return ret;
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

        /* private */ readProperty(element: Element, name: string): IProperty
        {
            const property = element.querySelector(":scope > properties > property[name='" + name + "']") as Element;
            if (!property) return null;
            const value = property.getAttribute("value");
            return { name, value };
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
                }
                ret[name] = value;
            }
            return ret;
        }
    }();

    interface IProperty
    {
        name: string;
        value: string;
    }
}