namespace Views.Battle
{
    export function ResultScreen(battleView: BattleView)
    {
        return <div id="battle-view-result">
            <div class="backdrop" />
            <h1>{ battleView.result }</h1>
            <button onclick={ () => UI.Dialog.close(battleView) }>Close</button>
        </div>;
    }

}