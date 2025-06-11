"use server";

import { revalidatePath } from "next/cache";
import {
  addBetToStore,
  addTransactionToStore,
  deleteBetFromStore,
  getAllBets,
  getAllTransactions,
  getBetById,
  updateBetInStore,
  getUniqueBetMonths as getUniqueBetMonthsFromStore,
} from "./store"; // Esto ahora apunta a Supabase interactions
import type {
  Bet,
  BetFormData,
  Transaction,
  TransactionFormData,
} from "./types";

// Bet Actions
export async function createBet(formData: BetFormData) {
  const stake = parseFloat(formData.stake);
  const odds = parseFloat(formData.odds);

  if (isNaN(stake) || isNaN(odds) || stake <= 0 || odds <= 1) {
    return { error: "Cantidad apostada o cuotas inválidas." };
  }

  // `id` y `createdAt` serán manejados por Supabase.
  // `potentialWinnings` lo calculamos aquí y lo pasamos.
  const newBetData = {
    title: formData.title,
    category: formData.category,
    stake,
    odds,
    potentialWinnings: stake * odds,
    status: "Pending" as Bet["status"],
    // `resolvedAt` y `actualWinnings` no se establecen en la creación
  };

  try {
    // addBetToStore ahora espera un objeto que coincida con la inserción de Supabase.
    await addBetToStore(newBetData);
    revalidatePath("/");
    revalidatePath("/transactions");
    revalidatePath("/performance");
    return { success: "Apuesta añadida correctamente a Supabase." };
  } catch (e: any) {
    console.error("Error in createBet action (Supabase):", e);
    return { error: e.message || "Error al crear la apuesta en Supabase." };
  }
}

export async function updateBet(id: string, formData: BetFormData) {
  const stake = parseFloat(formData.stake);
  const odds = parseFloat(formData.odds);

  if (isNaN(stake) || isNaN(odds) || stake <= 0 || odds <= 1) {
    return { error: "Cantidad apostada o cuotas inválidas." };
  }

  const existingBet = await getBetById(id);
  if (!existingBet) {
    return { error: "Apuesta no encontrada." };
  }
  if (existingBet.status !== "Pending") {
    return {
      error:
        "Solo se pueden editar apuestas pendientes. Para modificar una apuesta resuelta, primero reábrela.",
    };
  }

  // Preparamos el objeto completo `Bet` para actualizar.
  // `updateBetInStore` espera un objeto `Bet` completo.
  const updatedBetData: Bet = {
    ...existingBet, // Mantenemos id, createdAt, etc.
    title: formData.title,
    category: formData.category,
    stake,
    odds,
    potentialWinnings: stake * odds,
  };
  const result = await updateBetInStore(updatedBetData);
  if (!result) {
    return { error: "Error al actualizar la apuesta en Supabase." };
  }
  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/performance");
  return { success: "Apuesta actualizada correctamente en Supabase." };
}

export async function deleteBet(id: string) {
  const success = await deleteBetFromStore(id);
  if (!success) {
    return { error: "Error al eliminar la apuesta de Supabase." };
  }
  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/performance");
  return { success: "Apuesta eliminada correctamente de Supabase." };
}

export async function resolveBet(id: string, status: "Won" | "Lost") {
  const bet = await getBetById(id);
  if (!bet) {
    return { error: "Apuesta no encontrada." };
  }
  if (bet.status !== "Pending") {
    return { error: "La apuesta ya está resuelta, anulada o cerrada." };
  }

  // Creamos un objeto Bet completo para actualizar
  const resolvedBetData: Bet = {
    ...bet,
    status: status,
    resolvedAt: new Date().toISOString(),
    actualWinnings: status === "Won" ? bet.potentialWinnings : 0,
  };

  const result = await updateBetInStore(resolvedBetData);
  if (!result) {
    return {
      error: `Error al marcar la apuesta como ${
        status === "Won" ? "ganada" : "perdida"
      } en Supabase.`,
    };
  }
  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/performance");
  const statusEnEspanol = status === "Won" ? "ganada" : "perdida";
  return { success: `Apuesta marcada como ${statusEnEspanol} en Supabase.` };
}

export async function voidBet(id: string) {
  const bet = await getBetById(id);
  if (!bet) {
    return { error: "Apuesta no encontrada." };
  }
  if (bet.status !== "Pending") {
    return { error: "Solo se pueden anular apuestas pendientes." };
  }

  const voidedBetData: Bet = {
    ...bet,
    status: "Void",
    resolvedAt: new Date().toISOString(),
    actualWinnings: bet.stake, // Stake is returned
  };

  const result = await updateBetInStore(voidedBetData);
  if (!result) {
    return { error: "Error al anular la apuesta en Supabase." };
  }
  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/performance");
  return {
    success:
      "Apuesta anulada correctamente en Supabase. El importe apostado ha sido devuelto.",
  };
}

export async function cashOutBet(id: string, cashOutAmountString: string) {
  const bet = await getBetById(id);
  if (!bet) {
    return { error: "Apuesta no encontrada." };
  }
  if (bet.status !== "Pending") {
    return { error: "Solo se pueden cerrar (cash out) apuestas pendientes." };
  }

  const cashOutAmount = parseFloat(cashOutAmountString);
  if (isNaN(cashOutAmount) || cashOutAmount < 0) {
    return { error: "Importe de cash out inválido." };
  }

  const cashedOutBetData: Bet = {
    ...bet,
    status: "CashedOut",
    resolvedAt: new Date().toISOString(),
    actualWinnings: cashOutAmount,
  };

  const result = await updateBetInStore(cashedOutBetData);
  if (!result) {
    return { error: "Error al cerrar (cash out) la apuesta en Supabase." };
  }
  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/performance");
  return {
    success: `Apuesta cerrada (cash out) por €${cashOutAmount.toFixed(
      2
    )} en Supabase.`,
  };
}

export async function reopenBet(id: string) {
  const bet = await getBetById(id);
  if (!bet) {
    return { error: "Apuesta no encontrada." };
  }
  if (bet.status === "Pending") {
    return { error: "Esta apuesta ya está marcada como pendiente." };
  }

  const reopenedBetData: Bet = {
    ...bet,
    status: "Pending",
    resolvedAt: undefined, // Esto se mapeará a null en Supabase
    actualWinnings: undefined, // Esto se mapeará a null en Supabase
  };

  const result = await updateBetInStore(reopenedBetData);
  if (!result) {
    return { error: "Error al reabrir la apuesta en Supabase." };
  }
  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/performance");
  return {
    success:
      "La apuesta ha sido reabierta y marcada como pendiente en Supabase.",
  };
}

// Transaction Actions
export async function createTransaction(formData: TransactionFormData) {
  const amount = parseFloat(formData.amount);
  if (isNaN(amount) || amount <= 0) {
    return { error: "Cantidad inválida." };
  }
  if (!formData.date) {
    return { error: "La fecha es obligatoria." };
  }

  // `id` será manejado por Supabase.
  const newTransactionData = {
    type: formData.type,
    amount,
    description: formData.description,
    date: new Date(formData.date).toISOString(), // Asegurar que es un ISO string
  };
  try {
    await addTransactionToStore(newTransactionData);
    revalidatePath("/");
    revalidatePath("/transactions");
    revalidatePath("/performance");
    return { success: "Transacción añadida correctamente a Supabase." };
  } catch (e: any) {
    console.error("Error in createTransaction action (Supabase):", e);
    return { error: e.message || "Error al crear la transacción en Supabase." };
  }
}

// Data Fetching Actions
export async function fetchBets(): Promise<Bet[]> {
  return getAllBets();
}

export async function fetchTransactions(): Promise<Transaction[]> {
  return getAllTransactions();
}

export async function fetchUniqueBetMonths(): Promise<string[]> {
  return getUniqueBetMonthsFromStore();
}
