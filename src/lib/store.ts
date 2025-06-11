import { supabase } from "./supabaseClient";
import type { Bet, Transaction } from "./types"; // Tus tipos de aplicación existentes

// --- Helper Functions para Mapeo ---
// Supabase puede devolver snake_case, así que mapeamos a camelCase de tus tipos.
// La librería cliente de Supabase v2 a menudo maneja esto, pero ser explícito es más seguro.

function mapSupabaseRowToBet(row: any): Bet {
  return {
    id: row.id,
    title: row.title,
    category: row.category, // Asumimos que 'category' ya es el tipo correcto (BetCategory)
    stake: parseFloat(row.stake),
    odds: parseFloat(row.odds),
    potentialWinnings: parseFloat(row.potential_winnings),
    status: row.status, // Asumimos que 'status' ya es el tipo correcto (BetStatus)
    createdAt: row.created_at,
    resolvedAt: row.resolved_at || undefined,
    actualWinnings:
      row.actual_winnings !== null
        ? parseFloat(row.actual_winnings)
        : undefined,
  };
}

function mapSupabaseRowToTransaction(row: any): Transaction {
  return {
    id: row.id,
    type: row.type, // Asumimos que 'type' ya es el tipo correcto (TransactionType)
    amount: parseFloat(row.amount),
    description: row.description,
    date: row.date,
  };
}

// --- Operaciones de Apuestas (Bets) ---

export const getAllBets = async (): Promise<Bet[]> => {
  console.log("Supabase: getAllBets called");
  const { data, error } = await supabase
    .from("bets")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching bets from Supabase:", error);
    // Podrías lanzar el error o devolver un array vacío dependiendo de cómo quieras manejarlo
    throw error; // O return [];
  }
  return data ? data.map(mapSupabaseRowToBet) : [];
};

export const getBetById = async (id: string): Promise<Bet | undefined> => {
  console.log(`Supabase: getBetById called for id: ${id}`);
  const { data, error } = await supabase
    .from("bets")
    .select("*")
    .eq("id", id)
    .single(); // .single() es útil si esperas una o ninguna fila

  if (error) {
    // Si el error es "PGRST116" (JSON object requested, multiple (or no) rows returned), significa que no se encontró o hay múltiples.
    if (error.code === "PGRST116") {
      console.warn(`Supabase: Bet with id ${id} not found.`);
      return undefined;
    }
    console.error(`Error fetching bet ${id} from Supabase:`, error);
    throw error;
  }
  return data ? mapSupabaseRowToBet(data) : undefined;
};

// Nota: BetData para añadir ya no necesita 'id' ni 'createdAt', Supabase los maneja.
// Tampoco necesita 'potentialWinnings' si la DB lo calcula (o lo pasamos nosotros).
// Asumimos que 'potential_winnings' se calcula en la acción y se pasa.
export const addBetToStore = async (
  betData: Omit<Bet, "id" | "createdAt"> & { potentialWinnings: number }
): Promise<Bet> => {
  console.log("Supabase: addBetToStore called with:", betData);
  const { data, error } = await supabase
    .from("bets")
    .insert({
      title: betData.title,
      category: betData.category,
      stake: betData.stake,
      odds: betData.odds,
      potential_winnings: betData.potentialWinnings, // Asegúrate que este campo exista en tu tabla 'bets'
      status: betData.status,
      // created_at es manejado por el default de la DB
      resolved_at: betData.resolvedAt || null,
      actual_winnings: betData.actualWinnings || null,
    })
    .select() // Para obtener la fila insertada de vuelta
    .single(); // Esperamos una sola fila de vuelta

  if (error) {
    console.error("Error adding bet to Supabase:", error);
    throw error;
  }
  if (!data) {
    throw new Error("Supabase: No data returned after adding bet.");
  }
  return mapSupabaseRowToBet(data);
};

export const updateBetInStore = async (
  updatedBet: Bet
): Promise<Bet | null> => {
  console.log("Supabase: updateBetInStore called with:", updatedBet);
  const { data, error } = await supabase
    .from("bets")
    .update({
      title: updatedBet.title,
      category: updatedBet.category,
      stake: updatedBet.stake,
      odds: updatedBet.odds,
      potential_winnings: updatedBet.potentialWinnings,
      status: updatedBet.status,
      resolved_at: updatedBet.resolvedAt || null, // Enviar null si es undefined
      actual_winnings:
        updatedBet.actualWinnings !== undefined
          ? updatedBet.actualWinnings
          : null, // Enviar null si es undefined
    })
    .eq("id", updatedBet.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating bet in Supabase:", error);
    return null; // O throw error;
  }
  return data ? mapSupabaseRowToBet(data) : null;
};

export const deleteBetFromStore = async (id: string): Promise<boolean> => {
  console.log(`Supabase: deleteBetFromStore called for id: ${id}`);
  const { error } = await supabase.from("bets").delete().eq("id", id);

  if (error) {
    console.error("Error deleting bet from Supabase:", error);
    return false; // O throw error;
  }
  return true;
};

// --- Operaciones de Transacciones (Transactions) ---

export const getAllTransactions = async (): Promise<Transaction[]> => {
  console.log("Supabase: getAllTransactions called");
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("date", { ascending: false });

  if (error) {
    console.error("Error fetching transactions from Supabase:", error);
    throw error; // O return [];
  }
  return data ? data.map(mapSupabaseRowToTransaction) : [];
};

// Nota: TransactionData para añadir ya no necesita 'id', Supabase lo maneja.
export const addTransactionToStore = async (
  transactionData: Omit<Transaction, "id">
): Promise<Transaction> => {
  console.log("Supabase: addTransactionToStore called with:", transactionData);
  const { data, error } = await supabase
    .from("transactions")
    .insert({
      type: transactionData.type,
      amount: transactionData.amount,
      description: transactionData.description,
      date: transactionData.date, // Asegúrate que esto es un ISO string válido
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding transaction to Supabase:", error);
    throw error;
  }
  if (!data) {
    throw new Error("Supabase: No data returned after adding transaction.");
  }
  return mapSupabaseRowToTransaction(data);
};

// --- Utilidad para obtener meses únicos (si la necesitas) ---
// Esta función es un poco más compleja con Supabase, ya que requiere procesar fechas.
// Podrías hacerla con una función de base de datos o procesando los datos en el cliente.
// Por ahora, la simplificaremos, pero podrías necesitar optimizarla.

export const getUniqueBetMonths = async (): Promise<string[]> => {
  console.log("Supabase: getUniqueBetMonths called");
  const months = new Set<string>();

  // Obtener de 'bets'
  const { data: betsData, error: betsError } = await supabase
    .from("bets")
    .select("created_at, resolved_at");

  if (betsError) {
    console.error("Error fetching bet dates for unique months:", betsError);
  } else if (betsData) {
    betsData.forEach((item) => {
      if (item.created_at) {
        const date = new Date(item.created_at);
        // Comprobar si la fecha es válida
        if (!isNaN(date.getTime())) {
          months.add(
            `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
              2,
              "0"
            )}`
          );
        } else {
          console.warn(
            "Fecha created_at inválida encontrada:",
            item.created_at
          );
        }
      }
      if (item.resolved_at) {
        const date = new Date(item.resolved_at);
        if (!isNaN(date.getTime())) {
          months.add(
            `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
              2,
              "0"
            )}`
          );
        } else {
          console.warn(
            "Fecha resolved_at inválida encontrada:",
            item.resolved_at
          );
        }
      }
    });
  }

  // Obtener de 'transactions'
  const { data: transactionsData, error: transactionsError } = await supabase
    .from("transactions")
    .select("date");

  if (transactionsError) {
    console.error(
      "Error fetching transaction dates for unique months:",
      transactionsError
    );
  } else if (transactionsData) {
    transactionsData.forEach((item) => {
      if (item.date) {
        // 'date' es el nombre de la columna en transactions
        const date = new Date(item.date);
        if (!isNaN(date.getTime())) {
          months.add(
            `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
              2,
              "0"
            )}`
          );
        } else {
          console.warn("Fecha de transacción inválida encontrada:", item.date);
        }
      }
    });
  }
  // Ordenar los meses en orden descendente (más reciente primero)
  return Array.from(months).sort((a, b) => b.localeCompare(a));
};
