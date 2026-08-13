import { createClient } from '@supabase/supabase-js';

// Get env variables injected by vite-node or dotenv
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function generateSlug(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

async function backfillOrganizations() {
  console.log("Fetching organizations...");
  const { data: orgs, error } = await supabase.from('organizations').select('id, name');
  
  if (error) {
    console.error("Error fetching organizations:", error.message);
    return;
  }

  console.log(`Found ${orgs.length} organizations.`);
  
  for (const org of orgs) {
    if (!org.name) continue;
    
    let baseSlug = generateSlug(org.name);
    let slug = baseSlug;
    let counter = 1;
    let isUnique = false;

    // Ensure slug is unique
    while (!isUnique) {
      const { data: existing } = await supabase.from('organizations').select('id').eq('slug', slug).maybeSingle();
      if (!existing || existing.id === org.id) {
        isUnique = true;
      } else {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    console.log(`Updating org "${org.name}" with slug: ${slug}`);
    const { error: updateError } = await supabase
      .from('organizations')
      .update({ slug })
      .eq('id', org.id);
      
    if (updateError) {
      console.error(`Failed to update org ${org.id}:`, updateError.message);
    }
  }
}

async function backfillGigs() {
  console.log("Fetching gigs...");
  const { data: gigs, error } = await supabase.from('gigs').select('id, title');
  
  if (error) {
    console.error("Error fetching gigs:", error.message);
    return;
  }

  console.log(`Found ${gigs.length} gigs.`);
  
  for (const gig of gigs) {
    if (!gig.title) continue;
    
    let baseSlug = generateSlug(gig.title);
    let slug = baseSlug;
    let counter = 1;
    let isUnique = false;

    // Ensure slug is unique
    while (!isUnique) {
      const { data: existing } = await supabase.from('gigs').select('id').eq('slug', slug).maybeSingle();
      if (!existing || existing.id === gig.id) {
        isUnique = true;
      } else {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    console.log(`Updating gig "${gig.title}" with slug: ${slug}`);
    const { error: updateError } = await supabase
      .from('gigs')
      .update({ slug })
      .eq('id', gig.id);
      
    if (updateError) {
      console.error(`Failed to update gig ${gig.id}:`, updateError.message);
    }
  }
}

async function run() {
  console.log("Starting backfill process...");
  await backfillOrganizations();
  await backfillGigs();
  console.log("Backfill complete!");
}

run();
