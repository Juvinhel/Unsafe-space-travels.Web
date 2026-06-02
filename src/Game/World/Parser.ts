namespace Game.World
{
    export const parser = new class
    {
        public parse(url: string, text: string): Map | Tileset
        {
            let [path, file] = url.trimChar("/").splitLast("/");
            if (!file) { file = path; path = ""; };
            const [fileName, extension] = file.splitLast(".");
            const document = new DOMParser().parseFromString(text, "text/xml");

            const root = document.querySelector(":root") as Element;
            switch (extension.toLowerCase())
            {
                case "tmx": return this.parseMap(url, path, fileName, extension, root);
                case "tsx": return this.parseTileset(url, path, fileName, extension, root);
            }
        }

        /* private */ parseMap(link: string, path: string, fileName: string, extension: string, root: Element): Map
        {
            console.log("root", root);
            const name = this.readProperty(root, "name")?.value ?? fileName;
            const width = parseInt(root.getAttribute("width"));
            const height = parseInt(root.getAttribute("height"));
            const tilewidth = parseInt(root.getAttribute("tilewidth"));
            const tileheight = parseInt(root.getAttribute("tileheight"));

            const firstLayerElement = root.querySelector(":scope > layer");
            const firstLayer = this.getLayer(firstLayerElement);
            const ground: Ground[][] = firstLayer.map(x => x.map(x => (x == 0 ? "Impassable" : "Passable") as Ground));

            const ret = {
                link: link,
                name,
                width,
                height,
                tilewidth,
                tileheight,
                ground: ground,
                objects: [],
            } as Map;

            console.log("map", ret);
            return ret;
        }

        /* private */ getLayer(element: Element): number[][]
        {
            console.log("layer", element);
            const data = element.querySelector(":scope > data");
            console.log("data", data);
            globalThis["temp0"] = element;
            const text = data.textContent;
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

        /* private */ parseTileset(link: string, path: string, fileName: string, extension: string, root: Element): Tileset
        {
            return null;
        }

        /* private */ readProperty(element: Element, name: string): IProperty
        {
            const property = element.querySelector(":root > properties > property[name='" + name + "']") as Element;
            if (!property) return null;
            const value = property.getAttribute("value");
            return { name, value };
        }
    }();

    interface IProperty
    {
        name: string;
        value: string;
    }
}