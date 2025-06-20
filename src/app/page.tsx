import { fetchBets, fetchUniqueBetMonths } from "@/lib/actions";
import type { Bet } from "@/lib/types";
import BetList from "@/components/bets/BetList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MonthSelector from "@/components/MonthSelector";
import Loading from "./loading"; // Assuming you have a general loading component

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const selectedMonth = params?.month;
  const HIDE_ALL_TIME_OPTION_HOMEPAGE = true;

  // Fetch all data initially. Filtering happens based on selectedMonth.
  const [allBets, availableMonths] = await Promise.all([
    fetchBets(),
    fetchUniqueBetMonths(),
  ]);

  let displayBets = allBets;
  // Filter logic based on selectedMonth (which comes from URL)
  if (selectedMonth && selectedMonth !== "all-time") {
    // "all-time" check is okay here for data filtering if it somehow gets in URL
    displayBets = allBets.filter((bet) => {
      const betDate = new Date(bet.createdAt);
      const createdInMonth =
        `${betDate.getFullYear()}-${String(betDate.getMonth() + 1).padStart(
          2,
          "0"
        )}` === selectedMonth;
      let resolvedInMonth = false;
      if (bet.resolvedAt) {
        const resolvedDate = new Date(bet.resolvedAt);
        resolvedInMonth =
          `${resolvedDate.getFullYear()}-${String(
            resolvedDate.getMonth() + 1
          ).padStart(2, "0")}` === selectedMonth;
      }
      return createdInMonth || resolvedInMonth;
    });
  }

  const activeBets = displayBets
    .filter((bet) => bet.status === "Pending")
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  const resolvedBetsSorted = displayBets
    .filter(
      (bet) =>
        bet.status === "Won" ||
        bet.status === "Lost" ||
        bet.status === "Void" ||
        bet.status === "CashedOut"
    )
    .sort(
      (a, b) =>
        new Date(b.resolvedAt || b.createdAt).getTime() -
        new Date(a.resolvedAt || a.createdAt).getTime()
    );

  // For MonthSelector: if no month from URL, pass "" to signal client-side default.
  // Otherwise, pass the month from URL.
  const currentMonthForSelector = selectedMonth || "";

  if (availableMonths.length === 0 && !selectedMonth) {
    // Potentially show a specific message or a limited view if no months and no selection
    // For now, let MonthSelector handle its display (it might show null or placeholder)
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4 mb-6">
        <div className="w-full sm:w-auto sm:max-w-[220px]">
          {/* MonthSelector is now client-side and will handle its own default redirect if needed */}
          {availableMonths.length > 0 ? (
            <MonthSelector
              availableMonths={availableMonths}
              currentMonth={currentMonthForSelector} // Server sends month from URL or ""
              hideAllTimeOption={HIDE_ALL_TIME_OPTION_HOMEPAGE}
              id="home-month-selector"
            />
          ) : (
            <div className="h-9 w-full sm:w-[220px] bg-card rounded-md flex items-center justify-center text-sm text-muted-foreground">
              No hay meses
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 sm:w-auto sm:mx-auto">
          <TabsTrigger value="active">
            Activas ({activeBets.length})
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Resueltas ({resolvedBetsSorted.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          <BetList bets={activeBets} />
        </TabsContent>
        <TabsContent value="resolved">
          <BetList bets={resolvedBetsSorted} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
