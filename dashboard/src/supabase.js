import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://jfclxizmtdsxatwsxznb.supabase.co'
const SUPABASE_KEY = 'sb_publishable_JZixQZTN5PpHk-pmI-nTWw_-594DRzz'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
