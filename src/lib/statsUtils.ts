"use server";

import type { Bet, Transaction, OverallStats } from "./types";

export async function calculateOverallStats(
  bets: Bet[],
  transactions: Transaction[],
  selectedMonth?: string
): Promise<OverallStats> {
  let filteredBets = bets;
  let filteredTransactions = transactions;

  if (selectedMonth && selectedMonth !== "all-time") {
    filteredBets = bets.filter((bet) => {
      const betDate = new Date(bet.createdAt);
      // Check if created in selected month OR resolved in selected month
      const createdInSelectedMonth =
        `${betDate.getFullYear()}-${String(betDate.getMonth() + 1).padStart(
          2,
          "0"
        )}` === selectedMonth;
      let resolvedInSelectedMonth = false;
      if (bet.resolvedAt) {
        const resolvedDate = new Date(bet.resolvedAt);
        resolvedInSelectedMonth =
          `${resolvedDate.getFullYear()}-${String(
            resolvedDate.getMonth() + 1
          ).padStart(2, "0")}` === selectedMonth;
      }
      return createdInSelectedMonth || resolvedInSelectedMonth;
    });

    filteredTransactions = transactions.filter((t) => {
      const tDate = new Date(t.date);
      return (
        `${tDate.getFullYear()}-${String(tDate.getMonth() + 1).padStart(
          2,
          "0"
        )}` === selectedMonth
      );
    });
  }

  const totalDeposits = filteredTransactions
    .filter((t) => t.type === "Depósito")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalWithdrawals = filteredTransactions
    .filter((t) => t.type === "Retiro")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalPicksPurchases = filteredTransactions
    .filter((t) => t.type === "Compra de Picks")
    .reduce((sum, t) => sum + t.amount, 0);

  const financialBalance =
    totalWithdrawals - totalDeposits - totalPicksPurchases;

  // For betting stats, consider only bets relevant to the period (created or resolved in month)
  const resolvedBets = filteredBets.filter(
    (b) =>
      b.status === "Won" ||
      b.status === "Lost" ||
      b.status === "Void" ||
      b.status === "CashedOut"
  );
  const totalBetsInPeriod = filteredBets.length; // Total bets including pending for the period

  const betsWon = resolvedBets.filter((b) => b.status === "Won").length;
  const betsLost = resolvedBets.filter((b) => b.status === "Lost").length;
  const betsVoided = resolvedBets.filter((b) => b.status === "Void").length;
  const betsCashedOut = resolvedBets.filter(
    (b) => b.status === "CashedOut"
  ).length;

  const totalWagered = resolvedBets.reduce((sum, b) => sum + b.stake, 0);

  // Returns from bets (actualWinnings includes stake for Void/CashedOut if logic implies so)
  const totalReturnsFromBets = resolvedBets.reduce(
    (sum, b) => sum + (b.actualWinnings ?? 0),
    0
  );

  // Net winnings from bets is total returns minus total wagered on those resolved bets
  const totalNetWinningsFromBets = totalReturnsFromBets - totalWagered;

  // Profit percentage should be based on bets that have a win/loss outcome for risk assessment
  const wageredExcludingVoidAndCashout = resolvedBets
    .filter((b) => b.status === "Won" || b.status === "Lost")
    .reduce((sum, b) => sum + b.stake, 0);

  // Net profit/loss from only Won/Lost bets for ROI calculation
  const profitFromWonLostBets = resolvedBets
    .filter((b) => b.status === "Won" || b.status === "Lost")
    .reduce((sum, b) => sum + (b.actualWinnings ?? 0) - b.stake, 0);

  const profitPercentage =
    wageredExcludingVoidAndCashout > 0
      ? (profitFromWonLostBets / wageredExcludingVoidAndCashout) * 100
      : 0;

  // Yield medio por apuesta: beneficio neto / número de apuestas resueltas
  const yieldPorApuesta =
    resolvedBets.length > 0
      ? totalNetWinningsFromBets / resolvedBets.length
      : 0;

  return {
    totalDeposits,
    totalWithdrawals,
    totalPicksPurchases,
    financialBalance,
    totalBets: totalBetsInPeriod, // Use total bets made/resolved in period
    betsWon,
    betsLost,
    betsVoided,
    betsCashedOut,
    totalWagered, // Total wagered on resolved bets in period
    totalNetWinnings: totalNetWinningsFromBets, // Net from resolved bets in period
    profitPercentage, // ROI on resolved (Won/Lost) bets
    yieldPerBet: yieldPorApuesta, // NUEVO
  };
}
