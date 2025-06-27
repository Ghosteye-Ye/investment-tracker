// hooks/useInvestmentDB.ts
import { db } from "@/lib/db";
import type { Account } from "@/types/investment";

export const getAllAccounts = async () => {
  return await db.accounts.toArray();
};

export const addAccount = async (account: Account) => {
  return await db.accounts.add(account);
};

export const updateAccount = async (account: Account) => {
  return await db.accounts.put(account); // put 会自动根据 id 更新
};

export const deleteAccount = async (id: string) => {
  return await db.accounts.delete(id);
};

export const exportAccounts = async () => {
  const data = await db.accounts.toArray();
  return JSON.stringify(data, null, 2);
};

export const importAccounts = async (json: string) => {
  const parsed = JSON.parse(json) as Account[];
  await db.accounts.clear();
  await db.accounts.bulkAdd(parsed);
};

export const getAccountById = async (id: string) => {
  return await db.accounts.get(id);
};
