import path from "node:path";
import fs from "node:fs/promises";

const USER_PATH = path.join(process.cwd(), 'data', 'user-tickers.json');

export type UserTicker = {
    symbol: string; sector: string; addedAt: number
};

export async function readUser(): Promise<UserTicker[]> {
    try {
        return JSON.parse(await fs.readFile(USER_PATH, 'utf-8'));
    } catch { return []; }
}

export async function writeUser(list:UserTicker[]) {
    await fs.mkdir(path.dirname(USER_PATH), { recursive:true});
    await fs.writeFile(USER_PATH, JSON.stringify(list, null, 2));
}

export async function addUser(t:Omit<UserTicker, 'addedAt'>) {
    const list = await readUser();
    if (list.find(x => x.symbol === t.symbol)) return list;
    list.push({...t, addedAt: Date.now()});
    await writeUser(list);
    return list;
}

export async function removeUser(symbol:string) {
    const list = (await readUser()).filter(x => x.symbol !== symbol);
    await writeUser(list);
    return list;
}