// lib/db.ts
import Dexie from "dexie";
import type { Table } from "dexie";
import type { Account } from "@/types/investment";

export class InvestmentDB extends Dexie {
  accounts!: Table<Account, string>; // Account ID 是 string

  constructor() {
    super("InvestmentDB");
    this.version(1).stores({
      accounts: "id", // 主键是 id，account 对象里的 id 字符串
    });
  }
}

export const db = new InvestmentDB();
