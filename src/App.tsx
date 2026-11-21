import { useEffect, useMemo, useState } from 'react';
import { ToolPage } from '@/components/ToolPages';
import type { CalculatorPage, NonStandardPage } from '@/components/ToolPages';
import {
  AreaChart,
  Banknote,
  CalendarDays,
  Calculator as CalculatorIcon,
  ChevronDown,
  Code2,
  Delete,
  FlaskConical,
  Grid3X3,
  History as HistoryIcon,
  Info,
  Menu,
  PanelLeftClose,
  Ruler,
  Thermometer,
  Weight,
  Zap,
} from 'lucide-react';

type Operator = '+' | '−' | '×' | '÷';
type HistoryItem = { expression: string; result: string };
type NavItem = { label: CalculatorPage; icon: typeof CalculatorIcon };

const navSections: { title: string; items: NavItem[] }[] = [
  {
    title: 'Calculator',
    items: [
      { label: 'Standard', icon: CalculatorIcon },
      { label: 'Scientific', icon: FlaskConical },
      { label: 'Programmer', icon: Code2 },
      { label: 'Date Calculation', icon: CalendarDays },
    ],
  },
  {
    title: 'Converter',
    items: [
      { label: 'Currency', icon: Banknote },
      { label: 'Volume', icon: Grid3X3 },
      { label: 'Length', icon: Ruler },
      { label: 'Weight and Mass', icon: Weight },
      { label: 'Temperature', icon: Thermometer },
      { label: 'Energy', icon: Zap },
      { label: 'Area', icon: Grid3X3 },
      { label: 'Speed', icon: AreaChart },
    ],
  },
];

const formatNumber = (value: number): string => {
  if (!Number.isFinite(value)) return 'Cannot divide by zero';
  if (Math.abs(value) >= 1e12 || (Math.abs(value) > 0 && Math.abs(value) < 1e-9)) {
    return value.toExponential(8).replace(/\.0+e/, 'e');
  }
  return Number(value.toFixed(10)).toLocaleString('en-US', { maximumFractionDigits: 10 });
};

const numericValue = (value: string): number => Number(value.replace(/,/g, ''));

function App() {
  const [display, setDisplay] = useState('0');
  const [storedValue, setStoredValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [memory, setMemory] = useState<number | null>(null);
  const [activePanel, setActivePanel] = useState<'History' | 'Memory'>('History');
  const [activePage, setActivePage] = useState<CalculatorPage>('Standard');
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 700);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const hasMemory = memory !== null;
  const memoryLabel = useMemo(() => (hasMemory ? formatNumber(memory) : 'Memory is empty'), [hasMemory, memory]);

  const clearAll = (): void => {
    setDisplay('0');
    setStoredValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  };

  const inputDigit = (digit: string): void => {
    if (display === 'Cannot divide by zero') clearAll();
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
      return;
    }
    setDisplay(display === '0' ? digit : `${display}${digit}`);
  };

  const inputDecimal = (): void => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes('.')) setDisplay(`${display}.`);
  };

  const calculate = (left: number, right: number, selectedOperator: Operator): number => {
    if (selectedOperator === '+') return left + right;
    if (selectedOperator === '−') return left - right;
    if (selectedOperator === '×') return left * right;
    return right === 0 ? Number.NaN : left / right;
  };

  const chooseOperator = (nextOperator: Operator): void => {
    const currentValue = numericValue(display);
    if (operator && storedValue !== null && !waitingForOperand) {
      const result = calculate(storedValue, currentValue, operator);
      setStoredValue(result);
      setDisplay(formatNumber(result));
    } else {
      setStoredValue(currentValue);
    }
    setOperator(nextOperator);
    setWaitingForOperand(true);
  };

  const equals = (): void => {
    if (!operator || storedValue === null) return;
    const currentValue = numericValue(display);
    const result = calculate(storedValue, currentValue, operator);
    const formattedResult = formatNumber(result);
    setHistory((items) => [
      { expression: `${formatNumber(storedValue)} ${operator} ${formatNumber(currentValue)}`, result: formattedResult },
      ...items,
    ].slice(0, 12));
    setDisplay(formattedResult);
    setStoredValue(null);
    setOperator(null);
    setWaitingForOperand(true);
  };

  const applyUnary = (action: 'percent' | 'reciprocal' | 'square' | 'sqrt' | 'sign'): void => {
    const value = numericValue(display);
    let result = value;
    if (action === 'percent') result = value / 100;
    if (action === 'reciprocal') result = value === 0 ? Number.NaN : 1 / value;
    if (action === 'square') result = value ** 2;
    if (action === 'sqrt') result = value < 0 ? Number.NaN : Math.sqrt(value);
    if (action === 'sign') result = -value;
    setDisplay(formatNumber(result));
    setWaitingForOperand(true);
  };

  const backspace = (): void => {
    if (waitingForOperand || display === 'Cannot divide by zero') return;
    setDisplay(display.length > 1 ? display.slice(0, -1) : '0');
  };

  const handleKeyDown = (event: KeyboardEvent): void => {
    if (activePage !== 'Standard') return;
    if (/^[0-9]$/.test(event.key)) inputDigit(event.key);
    else if (event.key === '.') inputDecimal();
    else if (event.key === '+') chooseOperator('+');
    else if (event.key === '-') chooseOperator('−');
    else if (event.key === '*') chooseOperator('×');
    else if (event.key === '/') {
      event.preventDefault();
      chooseOperator('÷');
    } else if (event.key === 'Enter' || event.key === '=') equals();
    else if (event.key === 'Escape') clearAll();
    else if (event.key === 'Backspace') backspace();
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 700px)');
    const handleViewportChange = (event: MediaQueryListEvent): void => {
      setIsMobile(event.matches);
      setSidebarOpen(false);
    };

    mediaQuery.addEventListener('change', handleViewportChange);
    return () => mediaQuery.removeEventListener('change', handleViewportChange);
  }, []);

  const handleNavClick = (): void => {
    if (isMobile) setSidebarOpen(false);
  };

  const buttonClass = 'calculator-button';
  const numberClass = `${buttonClass} number-button`;
  const operatorClass = `${buttonClass} operator-button`;

  return (
    <main className="app-shell">
      <header className="window-bar">
        <div className="window-title">Calculator</div>
        <div className="window-controls" aria-hidden="true">
          <span>−</span><span>□</span><span>×</span>
        </div>
      </header>

      <div className="app-body">
        <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <div className="sidebar-topbar">
            <button className="icon-button" onClick={() => setSidebarOpen(false)} aria-label="Close navigation">
              <PanelLeftClose size={18} strokeWidth={1.8} />
            </button>
            <span className="sidebar-brand">Calculator</span>
          </div>
          <nav className="side-nav" aria-label="Calculator modes">
            {navSections.map((section) => (
              <div className="nav-section" key={section.title}>
                <h2>{section.title}</h2>
                {section.items.map(({ label, icon: Icon }) => (
                  <button className={`nav-item ${activePage === label ? 'selected' : ''}`} key={label} onClick={() => { setActivePage(label); handleNavClick(); }}>
                    <Icon size={16} strokeWidth={1.7} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            ))}
            <button className={`nav-item about-item ${activePage === 'About' ? 'selected' : ''}`} onClick={() => { setActivePage('About'); handleNavClick(); }}><Info size={16} strokeWidth={1.7} /><span>About</span></button>
          </nav>
        </aside>
        {isMobile && sidebarOpen && <button className="mobile-scrim" onClick={() => setSidebarOpen(false)} aria-label="Close navigation" />}

        <section className="calculator-area">
          <div className="calculator-header">
            <div className="header-left">
              {!sidebarOpen && <button className="icon-button" onClick={() => setSidebarOpen(true)} aria-label="Open navigation"><Menu size={19} /></button>}
              <button className="mode-button">{activePage} <ChevronDown size={17} /></button>
              <button className="icon-button expand-button" aria-label="Expand calculator"><span className="expand-glyph">↗</span></button>
            </div>
            {activePage === 'Standard' && <div className="panel-tabs">
              <button className={activePanel === 'History' ? 'active' : ''} onClick={() => setActivePanel('History')}><HistoryIcon size={15} />History</button>
              <button className={activePanel === 'Memory' ? 'active' : ''} onClick={() => setActivePanel('Memory')}><span className="memory-glyph">M</span>Memory</button>
            </div>}
          </div>

          {activePage === 'Standard' ? <div className="calculator-content">
            <section className="calculator-card" aria-label="Standard calculator">
              <div className="display-area">
                <div className="expression-line">{operator && storedValue !== null ? `${formatNumber(storedValue)} ${operator}` : ''}</div>
                <output className={`display-value ${display.length > 12 ? 'display-small' : ''}`}>{display}</output>
              </div>
              <div className="memory-row">
                <button disabled={!hasMemory} onClick={() => setMemory(null)}>MC</button>
                <button disabled={!hasMemory} onClick={() => setDisplay(formatNumber(memory ?? 0))}>MR</button>
                <button onClick={() => setMemory((memory ?? 0) + numericValue(display))}>M+</button>
                <button onClick={() => setMemory((memory ?? 0) - numericValue(display))}>M−</button>
                <button onClick={() => setMemory(numericValue(display))}>MS</button>
                <span className="memory-status">{hasMemory ? memoryLabel : ''}</span>
              </div>
              <div className="keypad">
                <button className={buttonClass} onClick={() => applyUnary('percent')}>%</button>
                <button className={buttonClass} onClick={() => setDisplay('0')}>CE</button>
                <button className={buttonClass} onClick={clearAll}>C</button>
                <button className={buttonClass} onClick={backspace} aria-label="Backspace"><Delete size={18} strokeWidth={1.7} /></button>

                <button className={buttonClass} onClick={() => applyUnary('reciprocal')}>¹⁄ₓ</button>
                <button className={buttonClass} onClick={() => applyUnary('square')}>x²</button>
                <button className={buttonClass} onClick={() => applyUnary('sqrt')}>²√x</button>
                <button className={operatorClass} onClick={() => chooseOperator('÷')}>÷</button>

                <button className={numberClass} onClick={() => inputDigit('7')}>7</button>
                <button className={numberClass} onClick={() => inputDigit('8')}>8</button>
                <button className={numberClass} onClick={() => inputDigit('9')}>9</button>
                <button className={operatorClass} onClick={() => chooseOperator('×')}>×</button>

                <button className={numberClass} onClick={() => inputDigit('4')}>4</button>
                <button className={numberClass} onClick={() => inputDigit('5')}>5</button>
                <button className={numberClass} onClick={() => inputDigit('6')}>6</button>
                <button className={operatorClass} onClick={() => chooseOperator('−')}>−</button>

                <button className={numberClass} onClick={() => inputDigit('1')}>1</button>
                <button className={numberClass} onClick={() => inputDigit('2')}>2</button>
                <button className={numberClass} onClick={() => inputDigit('3')}>3</button>
                <button className={operatorClass} onClick={() => chooseOperator('+')}>+</button>

                <button className={numberClass} onClick={() => applyUnary('sign')}>⁺⁄₋</button>
                <button className={numberClass} onClick={() => inputDigit('0')}>0</button>
                <button className={numberClass} onClick={inputDecimal}>.</button>
                <button className="equals-button" onClick={equals}>=</button>
              </div>
            </section>

            <aside className="history-panel">
              <div className="history-heading">{activePanel}</div>
              {activePanel === 'History' ? (
                history.length === 0 ? (
                  <div className="empty-panel"><HistoryIcon size={26} strokeWidth={1.4} /><p>There&apos;s no history yet</p><span>Your calculations will appear here.</span></div>
                ) : (
                  <div className="history-list">{history.map((item, index) => <button className="history-item" key={`${item.expression}-${index}`} onClick={() => setDisplay(item.result)}><span>{item.expression}</span><strong>{item.result}</strong></button>)}</div>
                )
              ) : (
                <div className="empty-panel"><span className="large-memory">M</span><p>{hasMemory ? memoryLabel : 'There&apos;s no memory yet'}</p><span>Saved values will appear here.</span></div>
              )}
            </aside>
          </div> : <ToolPage page={activePage as NonStandardPage} />}
        </section>
      </div>
    </main>
  );
}

export default App;
