import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { generateSlug } from '../src/utils/slug.js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUniqueSlug(table: 'gigs' | 'organizations', slug: string, baseSlug: string) {
  let counter = 1;
  let isUnique = false;
  let finalSlug = slug;
  
  while (!isUnique) {
    const { data: existing } = await supabase.from(table).select('id').eq('slug', finalSlug).maybeSingle();
    if (!existing) {
      isUnique = true;
    } else {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }
  }
  
  return finalSlug;
}

async function backfillSlugs() {
  console.log("Starting backfill process...");
  
  // Backfill Organizations
  console.log("\nBackfilling Organizations...");
  const { data: orgs, error: orgError } = await supabase
    .from('organizations')
    .select('id, name')
    .is('slug', null);
    
  if (orgError) {
    console.error("Error fetching orgs:", orgError);
  } else if (orgs && orgs.length > 0) {
    for (const org of orgs) {
      const baseSlug = generateSlug(org.name || 'organization');
      const finalSlug = await checkUniqueSlug('organizations', baseSlug, baseSlug);
      
      const { error: updateError } = await supabase
        .from('organizations')
        .update({ slug: finalSlug })
        .eq('id', org.id);
        
      if (updateError) {
        console.error(`Failed to update org ${org.id}:`, updateError);
      } else {
        console.log(`Updated org ${org.id} with slug: ${finalSlug}`);
      }
    }
  } else {
    console.log("No organizations need backfilling.");
  }

  // Backfill Gigs
  console.log("\nBackfilling Gigs...");
  const { data: gigs, error: gigError } = await supabase
    .from('gigs')
    .select('id, title')
    .is('slug', null);
    
  if (gigError) {
    console.error("Error fetching gigs:", gigError);
  } else if (gigs && gigs.length > 0) {
    for (const gig of gigs) {
      const baseSlug = generateSlug(gig.title || 'gig');
      const finalSlug = await checkUniqueSlug('gigs', baseSlug, baseSlug);
      
      const { error: updateError } = await supabase
        .from('gigs')
        .update({ slug: finalSlug })
        .eq('id', gig.id);
        
      if (updateError) {
        console.error(`Failed to update gig ${gig.id}:`, updateError);
      } else {
        console.log(`Updated gig ${gig.id} with slug: ${finalSlug}`);
      }
    }
  } else {
    console.log("No gigs need backfilling.");
  }
  
  console.log("\nBackfill complete.");
}

backfillSlugs();
