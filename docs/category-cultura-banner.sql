-- Crear el banner de los posts de Cultura usando la imagen ya configurada
-- en el slider de la categoría /museos.
-- Ejecutar en Supabase SQL Editor.

begin;

do $$
declare
  cultura_image_url text;
begin
  select image_url
    into cultura_image_url
  from public.sliders
  where set_key = 'category-cultura'
    and site = 'santiagoadicto'
    and active = true
    and image_url is not null
  order by position asc
  limit 1;

  if cultura_image_url is null or btrim(cultura_image_url) = '' then
    raise exception 'No se encontró una imagen activa en category-cultura. Guarda primero el slider de la categoría /museos.';
  end if;

  delete from public.sliders
  where set_key = 'post-cultura'
    and site = 'santiagoadicto';

  insert into public.sliders (
    set_key,
    site,
    image_url,
    href,
    position,
    active,
    lang
  )
  values (
    'post-cultura',
    'santiagoadicto',
    cultura_image_url,
    '/museos',
    0,
    true,
    'es'
  );
end $$;

commit;

-- Verificacion:
select set_key, site, image_url, href, position, active, lang
from public.sliders
where set_key in ('category-cultura', 'post-cultura')
  and site = 'santiagoadicto';
