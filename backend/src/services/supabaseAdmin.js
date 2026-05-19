const { createClient } = require('@supabase/supabase-js')

const url = process.env.SUPABASE_URL
const anon = process.env.SUPABASE_SERVICE_KEY

if (!url || !anon) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY')
}

const supabase = createClient(url, anon)

module.exports = { supabase }