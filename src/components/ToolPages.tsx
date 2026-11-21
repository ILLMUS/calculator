import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import {
  ArrowRightLeft,
  Binary,
  CalendarClock,
  Code2,
  FlaskConical,
  Info,
  RotateCcw,
  Sigma,
  ArrowUpDown,
} from 'lucide-react';

export type CalculatorPage =
  | 'Standard'
  | 'Scientific'
  | 'Programmer'
  | 'Date Calculation'
  | 'Currency'
  | 'Volume'
  | 'Length'
  | 'Weight and Mass'
  | 'Temperature'
  | 'Energy'
  | 'Area'
  | 'Speed'
  | 'About';

export type NonStandardPage = Exclude<CalculatorPage, 'Standard'>;
type ScientificOperator = '+' | '−' | '×' | '÷';
type ProgrammerBase = 2 | 8 | 10 | 16;
type ConverterPage = Exclude<NonStandardPage, 'Scientific' | 'Programmer' | 'Date Calculation' | 'About'>;
type Unit = { label: string; factor?: number };
type ConverterConfig = { description: string; units: Unit[] };

const formatToolNumber = (value: number): string => {
  if (!Number.isFinite(value)) return 'Not available';
  return Number(value.toFixed(10)).toLocaleString('en-US', { maximumFractionDigits: 10 });
};

const converterConfigs: Record<ConverterPage, ConverterConfig> = {
  Currency: {
    description: 'Convert common currencies with a clear, static reference rate.',
    units: [
      { label: 'US Dollar (USD)', factor: 1 },
      { label: 'Euro (EUR)', factor: 0.92 },
      { label: 'British Pound (GBP)', factor: 0.79 },
      { label: 'Japanese Yen (JPY)', factor: 154 },
      { label: 'Canadian Dollar (CAD)', factor: 1.38 },
    ],
  },
  Volume: {
    description: 'Convert liquid and dry volume measurements.',
    units: [
      { label: 'Liter', factor: 1 },
      { label: 'Milliliter', factor: 0.001 },
      { label: 'US Gallon', factor: 3.78541 },
      { label: 'Cup', factor: 0.236588 },
      { label: 'Pint', factor: 0.473176 },
    ],
  },
  Length: {
    description: 'Convert distances across metric and imperial units.',
    units: [
      { label: 'Meter', factor: 1 },
      { label: 'Kilometer', factor: 1000 },
      { label: 'Centimeter', factor: 0.01 },
      { label: 'Foot', factor: 0.3048 },
      { label: 'Inch', factor: 0.0254 },
      { label: 'Mile', factor: 1609.344 },
    ],
  },
  'Weight and Mass': {
    description: 'Convert everyday weight and mass measurements.',
    units: [
      { label: 'Kilogram', factor: 1 },
      { label: 'Gram', factor: 0.001 },
      { label: 'Pound', factor: 0.45359237 },
      { label: 'Ounce', factor: 0.0283495 },
      { label: 'Stone', factor: 6.35029 },
    ],
  },
  Temperature: {
    description: 'Convert temperatures between Celsius, Fahrenheit, and Kelvin.',
    units: [{ label: 'Celsius' }, { label: 'Fahrenheit' }, { label: 'Kelvin' }],
  },
  Energy: {
    description: 'Convert energy measurements for everyday calculations.',
    units: [
      { label: 'Joule', factor: 1 },
      { label: 'Kilojoule', factor: 1000 },
      { label: 'Calorie', factor: 4.184 },
      { label: 'Kilowatt-hour', factor: 3600000 },
      { label: 'British thermal unit', factor: 1055.06 },
    ],
  },
  Area: {
    description: 'Convert areas from rooms to land measurements.',
    units: [
      { label: 'Square meter', factor: 1 },
      { label: 'Square kilometer', factor: 1000000 },
      { label: 'Square foot', factor: 0.092903 },
      { label: 'Acre', factor: 4046.856 },
      { label: 'Hectare', factor: 10000 },
    ],
  },
  Speed: {
    description: 'Convert travel and motion speeds.',
    units: [
      { label: 'Meter per second', factor: 1 },
      { label: 'Kilometer per hour', factor: 0.277778 },
      { label: 'Mile per hour', factor: 0.44704 },
      { label: 'Knot', factor: 0.514444 },
    ],
  },
};

const scientificCalculation = (left: number, right: number, operator: ScientificOperator): number => {
  if (operator === '+') return left + right;
  if (operator === '−') return left - right;
  if (operator === '×') return left * right;
  return right === 0 ? Number.NaN : left / right;
};

function ScientificPage() {
  const [display, setDisplay] = useState('0');
  const [storedValue, setStoredValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<ScientificOperator | null>(null);
  const [waiting, setWaiting] = useState(false);
  const [angleMode, setAngleMode] = useState<'DEG' | 'RAD'>('DEG');

  const value = Number(display.replace(/,/g, ''));
  const setResult = (result: number): void => {
    setDisplay(formatToolNumber(result));
    setWaiting(true);
  };
  const digit = (digitValue: string): void => {
    if (waiting || display === '0') {
      setDisplay(digitValue);
      setWaiting(false);
      return;
    }
    setDisplay(`${display}${digitValue}`);
  };
  const decimal = (): void => {
    if (waiting) {
      setDisplay('0.');
      setWaiting(false);
    } else if (!display.includes('.')) {
      setDisplay(`${display}.`);
    }
  };
  const clear = (): void => {
    setDisplay('0');
    setStoredValue(null);
    setOperator(null);
    setWaiting(false);
  };
  const chooseOperator = (nextOperator: ScientificOperator): void => {
    setStoredValue(operator && storedValue !== null && !waiting ? scientificCalculation(storedValue, value, operator) : value);
    setOperator(nextOperator);
    setWaiting(true);
  };
  const equals = (): void => {
    if (storedValue === null || operator === null) return;
    setResult(scientificCalculation(storedValue, value, operator));
    setStoredValue(null);
    setOperator(null);
  };
  const unary = (action: 'sin' | 'cos' | 'tan' | 'log' | 'ln' | 'square' | 'sqrt'): void => {
    const radians = angleMode === 'DEG' ? value * Math.PI / 180 : value;
    if (action === 'sin') setResult(Math.sin(radians));
    if (action === 'cos') setResult(Math.cos(radians));
    if (action === 'tan') setResult(Math.tan(radians));
    if (action === 'log') setResult(value > 0 ? Math.log10(value) : Number.NaN);
    if (action === 'ln') setResult(value > 0 ? Math.log(value) : Number.NaN);
    if (action === 'square') setResult(value ** 2);
    if (action === 'sqrt') setResult(value >= 0 ? Math.sqrt(value) : Number.NaN);
  };

  const keys = [
    { label: 'sin', action: () => unary('sin') },
    { label: 'cos', action: () => unary('cos') },
    { label: 'tan', action: () => unary('tan') },
    { label: 'π', action: () => setDisplay(String(Math.PI)) },
    { label: 'log', action: () => unary('log') },
    { label: 'ln', action: () => unary('ln') },
    { label: 'x²', action: () => unary('square') },
    { label: '√x', action: () => unary('sqrt') },
    { label: '7', action: () => digit('7') },
    { label: '8', action: () => digit('8') },
    { label: '9', action: () => digit('9') },
    { label: '÷', action: () => chooseOperator('÷'), operator: true },
    { label: '4', action: () => digit('4') },
    { label: '5', action: () => digit('5') },
    { label: '6', action: () => digit('6') },
    { label: '×', action: () => chooseOperator('×'), operator: true },
    { label: '1', action: () => digit('1') },
    { label: '2', action: () => digit('2') },
    { label: '3', action: () => digit('3') },
    { label: '−', action: () => chooseOperator('−'), operator: true },
    { label: 'C', action: clear },
    { label: '0', action: () => digit('0') },
    { label: '.', action: decimal },
    { label: '+', action: () => chooseOperator('+'), operator: true },
  ];

  return (
    <div className="tool-page scientific-page">
      <div className="tool-page-intro"><div className="tool-icon"><FlaskConical size={20} /></div><div><h1>Scientific</h1><p>Explore advanced functions while keeping the familiar calculator layout.</p></div><button className="angle-toggle" onClick={() => setAngleMode(angleMode === 'DEG' ? 'RAD' : 'DEG')}>{angleMode}</button></div>
      <div className="scientific-display"><span>{operator && storedValue !== null ? `${formatToolNumber(storedValue)} ${operator}` : ''}</span><strong>{display}</strong></div>
      <div className="scientific-grid">{keys.map((key) => <button key={key.label} className={key.operator ? 'tool-key operator-key' : 'tool-key'} onClick={key.action}>{key.label}</button>)}<button className="tool-key equals-key" onClick={equals}>=</button></div>
    </div>
  );
}

function ProgrammerPage() {
  const [base, setBase] = useState<ProgrammerBase>(10);
  const [input, setInput] = useState('0');
  const parsedValue = useMemo(() => Number.parseInt(input || '0', base), [base, input]);
  const digits = base === 16 ? ['A', 'B', 'C', 'D', 'E', 'F'] : base === 10 ? [] : [];
  const allowedDigits = base === 2 ? '01' : base === 8 ? '01234567' : base === 10 ? '0123456789' : '0123456789ABCDEF';
  const appendDigit = (digitValue: string): void => setInput(input === '0' ? digitValue : `${input}${digitValue}`);
  const changeBase = (nextBase: ProgrammerBase): void => {
    const currentValue = Number.parseInt(input || '0', base);
    setBase(nextBase);
    setInput(Number.isNaN(currentValue) ? '0' : currentValue.toString(nextBase).toUpperCase());
  };
  const updateInput = (event: ChangeEvent<HTMLInputElement>): void => {
    const cleanValue = event.target.value.toUpperCase().split('').filter((character) => allowedDigits.includes(character)).join('');
    setInput(cleanValue || '0');
  };
  const updateBit = (action: 'not' | 'left' | 'right'): void => {
    const safeValue = Number.isNaN(parsedValue) ? 0 : parsedValue;
    const nextValue = action === 'not' ? (~safeValue >>> 0) : action === 'left' ? safeValue << 1 : safeValue >> 1;
    setInput((nextValue >>> 0).toString(base).toUpperCase());
  };

  return (
    <div className="tool-page programmer-page">
      <div className="tool-page-intro"><div className="tool-icon"><Code2 size={20} /></div><div><h1>Programmer</h1><p>Work with values across binary, octal, decimal, and hexadecimal.</p></div></div>
      <div className="base-switcher">{([16, 10, 8, 2] as ProgrammerBase[]).map((option) => <button key={option} className={base === option ? 'active' : ''} onClick={() => changeBase(option)}>{option === 16 ? 'HEX' : option === 10 ? 'DEC' : option === 8 ? 'OCT' : 'BIN'}</button>)}</div>
      <div className="programmer-input"><label htmlFor="programmer-value">Value</label><div className="programmer-field"><input id="programmer-value" value={input} onChange={updateInput} spellCheck={false} /><span>{base === 16 ? '0x' : base === 8 ? '0o' : base === 2 ? '0b' : ''}</span></div></div>
      <div className="base-results">{([16, 10, 8, 2] as ProgrammerBase[]).map((resultBase) => <div className="base-result" key={resultBase}><span>{resultBase === 16 ? 'HEX' : resultBase === 10 ? 'DEC' : resultBase === 8 ? 'OCT' : 'BIN'}</span><strong>{Number.isNaN(parsedValue) ? '0' : parsedValue.toString(resultBase).toUpperCase()}</strong></div>)}</div>
      <div className="bit-actions"><button onClick={() => updateBit('not')}>NOT</button><button onClick={() => updateBit('left')}>&lt;&lt; 1</button><button onClick={() => updateBit('right')}>&gt;&gt; 1</button><button onClick={() => setInput('0')}><RotateCcw size={15} />Clear</button></div>
      <div className="programmer-pad">{['7', '8', '9', '4', '5', '6', '1', '2', '3', '0', ...digits].filter((digitValue) => allowedDigits.includes(digitValue)).map((digitValue) => <button key={digitValue} onClick={() => appendDigit(digitValue)}>{digitValue}</button>)}</div>
    </div>
  );
}

const parseLocalDate = (value: string): Date => new Date(`${value}T00:00:00`);
const dateInputValue = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function DateCalculationPage() {
  const today = dateInputValue(new Date());
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [offsetDate, setOffsetDate] = useState(today);
  const [days, setDays] = useState('30');
  const [direction, setDirection] = useState<'add' | 'subtract'>('add');
  const difference = Math.round(Math.abs(parseLocalDate(endDate).getTime() - parseLocalDate(startDate).getTime()) / 86400000);
  const shiftedDate = new Date(parseLocalDate(offsetDate));
  shiftedDate.setDate(shiftedDate.getDate() + (direction === 'add' ? Number(days) || 0 : -(Number(days) || 0)));

  return (
    <div className="tool-page date-page">
      <div className="tool-page-intro"><div className="tool-icon"><CalendarClock size={20} /></div><div><h1>Date Calculation</h1><p>Compare two dates or find a date by adding and subtracting days.</p></div></div>
      <div className="date-cards">
        <section className="date-card"><div className="card-eyebrow">DATE DIFFERENCE</div><h2>How far apart are they?</h2><div className="date-fields"><label>Start date<input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label><label>End date<input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label></div><div className="date-result"><strong>{difference}</strong><span>days apart<br />{formatToolNumber(difference / 7)} weeks</span></div></section>
        <section className="date-card"><div className="card-eyebrow">ADD OR SUBTRACT</div><h2>Find another date</h2><label className="full-date-label">Starting date<input type="date" value={offsetDate} onChange={(event) => setOffsetDate(event.target.value)} /></label><div className="offset-row"><input type="number" min="0" value={days} onChange={(event) => setDays(event.target.value)} /><select value={direction} onChange={(event) => setDirection(event.target.value as 'add' | 'subtract')}><option value="add">Add days</option><option value="subtract">Subtract days</option></select></div><div className="date-result"><strong>{dateInputValue(shiftedDate)}</strong><span>resulting date</span></div></section>
      </div>
    </div>
  );
}

const temperatureToCelsius = (value: number, unit: string): number => unit === 'Fahrenheit' ? (value - 32) * 5 / 9 : unit === 'Kelvin' ? value - 273.15 : value;
const celsiusFromTemperature = (value: number, unit: string): number => unit === 'Fahrenheit' ? value * 9 / 5 + 32 : unit === 'Kelvin' ? value + 273.15 : value;

function ConverterPage({ page }: { page: ConverterPage }) {
  const config = converterConfigs[page];
  const [input, setInput] = useState('1');
  const [fromUnit, setFromUnit] = useState(config.units[0].label);
  const [toUnit, setToUnit] = useState(config.units[1].label);

  useEffect(() => {
    setInput('1');
    setFromUnit(config.units[0].label);
    setToUnit(config.units[1].label);
  }, [config, page]);

  const result = useMemo(() => {
    const value = Number(input) || 0;
    if (page === 'Temperature') return celsiusFromTemperature(temperatureToCelsius(value, fromUnit), toUnit);
    const from = config.units.find((unit) => unit.label === fromUnit)?.factor ?? 1;
    const to = config.units.find((unit) => unit.label === toUnit)?.factor ?? 1;
    return value * from / to;
  }, [config, fromUnit, input, page, toUnit]);

  const swapUnits = (): void => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  return (
    <div className="tool-page converter-page"><div className="tool-page-intro"><div className="tool-icon"><ArrowRightLeft size={20} /></div><div><h1>{page}</h1><p>{config.description}</p></div></div><div className="converter-card"><div className="converter-row"><label>From<input type="number" value={input} onChange={(event) => setInput(event.target.value)} /></label><label>Unit<select value={fromUnit} onChange={(event) => setFromUnit(event.target.value)}>{config.units.map((unit) => <option key={unit.label}>{unit.label}</option>)}</select></label></div><button className="swap-button" onClick={swapUnits} aria-label="Swap units"><ArrowUpDown size={18} /></button><div className="converter-row"><label>To<output className="converter-result">{formatToolNumber(result)}</output></label><label>Unit<select value={toUnit} onChange={(event) => setToUnit(event.target.value)}>{config.units.map((unit) => <option key={unit.label}>{unit.label}</option>)}</select></label></div></div><div className="conversion-note"><Sigma size={17} /><span>Enter a value and choose the units you want to compare.</span></div></div>
  );
}

function AboutPage() {
  return <div className="tool-page about-page"><div className="tool-page-intro"><div className="tool-icon"><Info size={20} /></div><div><h1>About</h1><p>A calm, focused calculator for everyday math and quick conversions.</p></div></div><div className="about-grid"><div><strong>Standard calculator</strong><span>Basic operations, memory controls, history, and keyboard support.</span></div><div><strong>Additional tools</strong><span>Scientific, programmer, date, and unit conversion pages are ready from the menu.</span></div><div><strong>Designed for focus</strong><span>The sidebar stays hidden until you choose to open it.</span></div></div></div>;
}

export function ToolPage({ page }: { page: NonStandardPage }) {
  if (page === 'Scientific') return <ScientificPage />;
  if (page === 'Programmer') return <ProgrammerPage />;
  if (page === 'Date Calculation') return <DateCalculationPage />;
  if (page === 'About') return <AboutPage />;
  return <ConverterPage page={page} />;
}

export function ToolPageIcon({ page }: { page: NonStandardPage }) {
  if (page === 'Scientific') return <FlaskConical size={20} />;
  if (page === 'Programmer') return <Binary size={20} />;
  return page === 'Date Calculation' ? <CalendarClock size={20} /> : <ArrowRightLeft size={20} />;
}
