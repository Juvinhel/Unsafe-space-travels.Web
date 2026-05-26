namespace Views.Body
{
    export function BodyInfo()
    {
        return (<div id="body-info" onconnected={ (e: Event) => rendered(e.currentTarget as HTMLDivElement) }>
            <div class="display" />
            <vertical-divider />
            <div class="data">
                <h1>Status: <span id="body-status">healthy</span></h1>
                <h2>Mutations: <span id="mutations-count">{ Game.data.player.body.mutations.length }</span></h2>
                <h2>Augmentations: <span id="augmentations-count">{ Game.data.player.body.augmentations.length }</span></h2>
            </div>
        </div>);
    }

    let observer: MutationObserver;
    function rendered(bodyInfo: HTMLDivElement)
    {
        if (observer) observer.disconnect();
        if (!bodyInfo) console.log("bodyInfo is null");
        const { width, height } = this.getBoundingClientRect();
        observer = new MutationObserver(sizeChanged.bind(bodyInfo));
        bodyInfo["observer"] = observer;
        bodyInfo["oldWidth"] = width;
        bodyInfo["oldHeight"] = height;
        observer.observe(bodyInfo, { attributes: true });
        redraw(bodyInfo);
    }

    function sizeChanged(this: HTMLDivElement, mutations: MutationRecord[], observer: MutationObserver): void
    {
        const oldWidth: number = this["oldWidth"];
        const oldHeight: number = this["oldHeight"];
        const { width, height } = this.getBoundingClientRect();
        if (oldWidth != width || oldHeight != height)
        {
            this["oldWidth"] = width;
            this["oldHeight"] = height;
            redraw(this);
        }
    }

    function redraw(canvas: HTMLElement)
    {
        const oldWidth: number = this["oldWidth"];
        const oldHeight: number = this["oldHeight"];
    }
}