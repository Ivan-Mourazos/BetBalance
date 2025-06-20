import {
  fetchBets,
  fetchTransactions,
  fetchUniqueBetMonths,
} from "@/lib/actions";
import { calculateOverallStats } from "@/lib/statsUtils";
import MonthSelector from "@/components/MonthSelector";
import { getKpiBets } from "@/lib/store";

export default async function PerformancePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const selectedMonth = params?.month;

  // Si no hay mes seleccionado, mostramos los KPIs globales desde la vista SQL
  let kpi = null;
  if (!selectedMonth || selectedMonth === "all-time") {
    try {
      kpi = await getKpiBets();
    } catch (e) {
      console.error("No se pudieron obtener los KPIs globales:", e);
    }
  }

  const [allBets, allTransactions, availableMonths] = await Promise.all([
    fetchBets(),
    fetchTransactions(),
    fetchUniqueBetMonths(),
  ]);

  const stats = await calculateOverallStats(
    allBets,
    allTransactions,
    selectedMonth
  );

  // For MonthSelector: if no month from URL, default to "all-time".
  const currentMonthForSelector = selectedMonth || "all-time";

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-headline text-primary">
          Rendimiento y Estadísticas
        </h1>
        <div className="w-full sm:w-auto sm:max-w-[220px]">
          {availableMonths.length > 0 ||
          currentMonthForSelector === "all-time" ? (
            <MonthSelector
              availableMonths={availableMonths}
              currentMonth={currentMonthForSelector}
              hideAllTimeOption={false}
              id="performance-month-selector"
            />
          ) : (
            <div className="h-9 w-full sm:w-[220px] bg-card rounded-md flex items-center justify-center text-sm text-muted-foreground">
              No hay datos
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* ROI */}
        <section className="bg-card p-3 md:p-4 rounded-lg shadow-md flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold text-primary mb-1">ROI (%)</h3>
          <p
            className={`text-2xl font-bold ${
              stats.profitPercentage >= 0 ? "text-success" : "text-destructive"
            }`}
          >
            {kpi && !selectedMonth && kpi.roi !== null && kpi.roi !== undefined
              ? `${kpi.roi.toFixed(2)}%`
              : `${stats.profitPercentage.toFixed(2)}%`}
          </p>
        </section>
        {/* Yield medio por apuesta */}
        <section className="bg-card p-3 md:p-4 rounded-lg shadow-md flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold text-primary mb-1">
            Yield medio por apuesta
          </h3>
          <p
            className={`text-2xl font-bold ${
              stats.yieldPerBet >= 0 ? "text-success" : "text-destructive"
            }`}
          >
            {kpi &&
            !selectedMonth &&
            kpi.yield_por_apuesta !== null &&
            kpi.yield_por_apuesta !== undefined
              ? `€${kpi.yield_por_apuesta.toFixed(2)}`
              : `€${stats.yieldPerBet.toFixed(2)}`}
          </p>
        </section>
        {/* Hit Rate */}
        <section className="bg-card p-3 md:p-4 rounded-lg shadow-md flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold text-primary mb-1">Hit Rate</h3>
          <p
            className={`text-2xl font-bold ${
              kpi &&
              kpi.hit_rate !== null &&
              kpi.hit_rate !== undefined &&
              kpi.hit_rate >= 0
                ? "text-success"
                : "text-destructive"
            }`}
          >
            {kpi &&
            !selectedMonth &&
            kpi.hit_rate !== null &&
            kpi.hit_rate !== undefined
              ? `${kpi.hit_rate.toFixed(2)}%`
              : "-"}
          </p>
        </section>
        {/* Resumen Financiero */}
        <section className="bg-card p-3 md:p-4 rounded-lg shadow-md space-y-2 md:space-y-3">
          <h2 className="text-xl font-headline text-primary mb-2">
            Resumen Financiero (Personal)
          </h2>
          <div className="space-y-1.5">
            <div className="flex justify-between items-baseline">
              <p className="text-muted-foreground text-xs md:text-sm">
                Total Invertido (Depósitos):
              </p>
              <p className="font-semibold text-destructive text-sm md:text-base">
                €{stats.totalDeposits.toFixed(2)}
              </p>
            </div>
            <div className="flex justify-between items-baseline">
              <p className="text-muted-foreground text-xs md:text-sm">
                Total Retirado (Retiros):
              </p>
              <p className="font-semibold text-success text-sm md:text-base">
                €{stats.totalWithdrawals.toFixed(2)}
              </p>
            </div>
            <div className="flex justify-between items-baseline">
              <p className="text-muted-foreground text-xs md:text-sm">
                Gasto en Picks:
              </p>
              <p className="font-semibold text-destructive text-sm md:text-base">
                €{stats.totalPicksPurchases.toFixed(2)}
              </p>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-border/50 mt-2">
              <p className="text-muted-foreground font-semibold text-xs md:text-sm">
                Balance Financiero:
              </p>
              <p
                className={`font-semibold text-sm md:text-base ${
                  stats.financialBalance >= 0
                    ? "text-success"
                    : "text-destructive"
                }`}
              >
                €{stats.financialBalance.toFixed(2)}
              </p>
            </div>
          </div>
        </section>
        {/* Rendimiento de Apuestas */}
        <section className="bg-card p-3 md:p-4 rounded-lg shadow-md space-y-2 md:space-y-3">
          <h2 className="text-xl font-headline text-primary mb-2">
            Rendimiento de Apuestas
          </h2>
          <div className="space-y-1.5">
            <div className="flex justify-between items-baseline">
              <p className="text-muted-foreground text-xs md:text-sm">
                Total Apuestas (Periodo):
              </p>
              <p className="font-semibold text-foreground text-sm md:text-base">
                {stats.totalBets}
              </p>
            </div>
            <div className="flex justify-between items-baseline">
              <p className="text-muted-foreground text-xs md:text-sm">
                Ganadas / Perdidas / Anuladas / Cerradas:
              </p>
              <p className="font-semibold text-foreground text-xs md:text-sm">
                {stats.betsWon} / {stats.betsLost} / {stats.betsVoided} /{" "}
                {stats.betsCashedOut}
              </p>
            </div>
            <div className="flex justify-between items-baseline">
              <p className="text-muted-foreground text-xs md:text-sm">
                Total Apostado (Resueltas):
              </p>
              <p className="font-semibold text-foreground text-sm md:text-base">
                €{stats.totalWagered.toFixed(2)}
              </p>
            </div>
            <div className="flex justify-between items-baseline">
              <p className="text-muted-foreground text-xs md:text-sm">
                Ganancia/Pérdida Neta (Apuestas):
              </p>
              <p
                className={`font-semibold text-sm md:text-base ${
                  stats.totalNetWinnings >= 0
                    ? "text-success"
                    : "text-destructive"
                }`}
              >
                {stats.totalNetWinnings >= 0 ? "+" : ""}€
                {stats.totalNetWinnings.toFixed(2)}
              </p>
            </div>
            <p className="text-xs text-muted-foreground text-right pt-1">
              Ganancia % (s/ G/P): {stats.profitPercentage.toFixed(1)}%
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
