import { useState } from 'react'
import './App.css'
import HeatMap from './components/Heatmap'
import TickerView from './components/TickerView';
import IndustryView from './components/IndustryView';

type View = 
  | { kind: 'heatmap'}
  | { kind: 'industry'; industryKey: string }
  | { kind: 'ticker'; symbol: string; from?: string };

export default function App() {
  const [view, setView ] = useState<View>({ kind: 'heatmap' });

  return (
    <div className='app'>
      <header className='topbar'>
        <span className='logo'> K'S TERMINAL </span>
        <nav className='crumbs'>
          <button onClick={() => setView({ kind: 'heatmap'})}>Heatmap</button>
          {view.kind === 'industry' && <span> &gt; {view.industryKey }</span>}
          { view.kind === 'ticker' && (
            <span className='crumb-group'>
            {view.from && (<button onClick={() => setView(
              { kind: 'industry', industryKey: view.from! })}>
                {view.from}
              </button>
            )}
              <span>{view.symbol}</span>
            </span>
          )}
        </nav>
        <input className='cmd' placeholder='ticker symbol...' 
        onKeyDown={ e => {
          if (e.key === 'Enter') {
            const s = (e.target as HTMLInputElement).value.toUpperCase().trim();
            if (s) setView({ kind: 'ticker', symbol: s});

          }
        }}
        />
  
      </header>

      {view.kind === 'heatmap' && (
        <HeatMap onPickIndustry={k => setView ({ kind:'industry', industryKey: k})}/>
      )}

      {view.kind === 'industry' &&  (
        <IndustryView industryKey={view.industryKey} onPickTicker={s => setView({ kind:'ticker', symbol: s, from: view.industryKey})} />

      )}
      
      { view.kind === 'ticker' && <TickerView symbol={view.symbol} /> }
    </div>
  );
}