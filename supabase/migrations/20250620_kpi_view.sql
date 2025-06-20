-- Vista para KPIs globales de apuestas
create or replace view kpi_bets as
select
  count(*) filter (where status in ('Won','Lost','Void','Push')) as total_resueltas,
  count(*) as total_apuestas,
  sum(stake) filter (where status in ('Won','Lost','Void','Push')) as stake_total,
  sum(beneficio) filter (where status in ('Won','Lost','Void','Push')) as profit_total,
  case when sum(stake) filter (where status in ('Won','Lost','Void','Push')) > 0
    then round(sum(beneficio) filter (where status in ('Won','Lost','Void','Push')) * 100.0 /
               sum(stake) filter (where status in ('Won','Lost','Void','Push')), 2)
    else 0 end as roi,
  case when count(*) filter (where status in ('Won','Lost','Void','Push')) > 0
    then round(sum(beneficio) filter (where status in ('Won','Lost','Void','Push')) /
               count(*) filter (where status in ('Won','Lost','Void','Push')), 2)
    else 0 end as yield_por_apuesta,
  case when count(*) filter (where status in ('Won','Lost')) > 0
    then round(count(*) filter (where status = 'Won') * 100.0 /
               count(*) filter (where status in ('Won','Lost')), 2)
    else 0 end as hit_rate
from bets;
