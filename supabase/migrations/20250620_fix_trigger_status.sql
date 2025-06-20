-- Corrige el trigger para usar 'status' en vez de 'estado'
create or replace function actualizar_retorno_beneficio()
returns trigger as $$
begin
  if new.status = 'Won' then
    new.retorno := new.stake * new.odds;
    new.beneficio := new.retorno - new.stake;
  elsif new.status = 'Void' then
    new.retorno := new.stake;
    new.beneficio := 0;
  elsif new.status = 'Lost' then
    new.retorno := 0;
    new.beneficio := -new.stake;
  elsif new.status = 'CashedOut' then
    -- Si tienes lógica especial para CashOut, ajústala aquí
    new.retorno := coalesce(new.actual_winnings, 0);
    new.beneficio := new.retorno - new.stake;
  else
    return new;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_actualizar_retorno_beneficio on bets;
create trigger trigger_actualizar_retorno_beneficio
before insert or update on bets
for each row
execute function actualizar_retorno_beneficio();
