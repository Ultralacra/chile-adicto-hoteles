// Script para verificar si la migración SQL fue ejecutada
import 'dotenv/config';

async function checkSiteColumn() {
  console.log('🔍 Verificando si la columna "site" existe en la base de datos...\n');
  
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/posts?select=slug,site&limit=1`;
  
  try {
    const response = await fetch(url, {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ La columna "site" existe en la base de datos');
      console.log('📊 Datos de ejemplo:', JSON.stringify(data.slice(0, 2), null, 2));
      
      if (data.length > 0 && data[0].site) {
        console.log('✅ Los datos tienen el campo "site" correctamente');
      } else {
        console.warn('⚠️  Los posts existen pero no tienen el campo "site"');
      }
    } else {
      const errorText = await response.text();
      console.error('❌ Error al obtener posts:', response.status);
      console.error('Detalle:', errorText);
      
      if (errorText.includes('column') && errorText.includes('does not exist')) {
        console.error('\n🚨 LA COLUMNA "site" NO EXISTE EN LA BASE DE DATOS');
        console.error('📝 Necesitas ejecutar la migración SQL primero:');
        console.error('   1. Ve a https://supabase.com/dashboard');
        console.error('   2. Abre SQL Editor');
        console.error('   3. Ejecuta el contenido de: scripts/sql/add-site-column.sql');
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkSiteColumn();
