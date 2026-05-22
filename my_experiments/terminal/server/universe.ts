import path from "node:path";
import fs from "node:fs/promises";

const SP500_URL = 'https://raw.githubusercontent.com/datasets/s-and-p-500-companies/master/data/constituents.csv';
const CACHE_PATH =path.join(process.cwd(),'data','sp500.json');
const TTL_MS=24*60*60*1000;

export type Constituent = { symbol: string; name: string; sector: string; subIndustry:string};

async function readCache(): Promise<{ts: number; rows: Constituent[]} | null> { 
    try {
        return JSON.parse(await fs.readFile(CACHE_PATH, 'utf-8')); 
    } catch {return null;}
}

async function writeCache(rows:Constituent[]) {
    await fs.mkdir(path.dirname(CACHE_PATH), {recursive: true});
    await fs.writeFile(CACHE_PATH,JSON.stringify({ts:Date.now(), rows}, null, 2));
    
}

function parseCsv(text: string): Constituent[] {
    const lines=text.trim().split(/\r?\n/).slice(1);
    return lines.map(line => {
        const cells:string[] = [];
        let cur='', inQ = false;
        for (const ch of line) {
            if (ch === '"') inQ =!inQ;
            else if (ch === ',' && !inQ) { cells.push(cur); cur = '';}
            else cur += ch;
        }
        cells.push(cur);
        return {
            symbol: cells[0].replace(',','-'), //BRK.B -> BRK-B
            name: cells[1],
            sector: cells[2],
            subIndustry: cells[3],

        };
    })
}

export async function getSP500():Promise<Constituent[]> {
    const cached = await readCache();
    if (cached && Date.now()-cached.ts <TTL_MS) return cached.rows;
    const r = await fetch(SP500_URL);
    if (!r.ok) {
        if (cached) return cached.rows;
        throw new Error(`SP500 Fetch ${r.status}`);
    }

    const rows = parseCsv(await r.text());
    await writeCache(rows);
    return rows;
    
}

export function groupBySector(rows: Constituent[]) {
    const out: Record<string, Constituent[]>= {};
    for (const r of rows) (out[r.sector]??=[]).push(r);
    return out;
}