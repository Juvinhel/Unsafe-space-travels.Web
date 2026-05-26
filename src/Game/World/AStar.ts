namespace Game.World
{
    export class AStar
    {
        constructor (map: Map)
        {
            this.map = map;
            this.helper = new MapHelper(this.map);
        }

        public readonly map: Map;
        private helper: MapHelper;

        public calculatePath(from: Point, to: Point): Point[]
        {
            const openNodes: ANode[] = [{ x: from.x, y: from.y, d: 0, m: this.calcMetric(from, to) }];
            const closedNodes: ANode[] = [];

            do
            {
                const currentNode = this.getBestNode(openNodes);
                openNodes.remove(currentNode);
                closedNodes.push(currentNode);

                const newNodes: ANode[] = [
                    { x: currentNode.x - 1, y: currentNode.y, d: currentNode.d + 1, p: currentNode },
                    { x: currentNode.x + 1, y: currentNode.y, d: currentNode.d + 1, p: currentNode },
                    { x: currentNode.x, y: currentNode.y - 1, d: currentNode.d + 1, p: currentNode },
                    { x: currentNode.x, y: currentNode.y + 1, d: currentNode.d + 1, p: currentNode }] as ANode[];

                for (const newNode of newNodes)
                    if (newNode.x == to.x && newNode.y == to.y)
                        return this.getPath(newNode);

                for (let i = newNodes.length - 1; i >= 0; --i)
                    if (!this.helper.isPassable(newNodes[i]))
                        newNodes.removeAt(i);

                for (let i = newNodes.length - 1; i >= 0; --i)
                    if (this.containsBetterNode(closedNodes, newNodes[i]) ||
                        this.containsBetterNode(openNodes, newNodes[i])) // there is already a better node
                        newNodes.removeAt(i);

                for (const newNode of newNodes)
                    newNode.m = this.calcMetric(newNode, to);

                openNodes.push(...newNodes);
            } while (openNodes.length);
            return null;
        }

        private containsBetterNode(arr: ANode[], node: ANode)
        {
            return arr.filter(n => n.x == node.x && n.y == node.y).some(n => n.d < node.d);
        }

        private calcMetric(from: Point, to: Point): number
        {
            return Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2));
        }

        private getBestNode(nodes: ANode[]): ANode
        {
            let best = Number.MAX_SAFE_INTEGER;
            let n: ANode = null;
            for (const node of nodes)
                if (best > (node.d + node.m))
                {
                    best = node.d + node.m;
                    n = node;
                }
            return n;
        }

        private getPath(node: ANode): Point[]
        {
            const ret: Point[] = [];
            do
            {
                ret.insertAt(0, node);
            } while (node = node.p);
            return ret;
        }
    }

    export type ANode = Point & {
        p?: ANode, // parent / prev
        d: number, // distance
        m: number, // metric
    };
}