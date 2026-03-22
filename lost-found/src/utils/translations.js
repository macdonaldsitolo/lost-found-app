// ── translations.js ───────────────────────────────────────────────────────
// Add every user-facing string here in both languages.
// Key naming: use snake_case, grouped by page/component.
// ─────────────────────────────────────────────────────────────────────────

const translations = {

  // ── Global / Navbar ──────────────────────────────────────────────────────
  home:                   { en: "Home",               ny: "Kunyumba" },
  my_reports:             { en: "My Reports",         ny: "Mauthenga Anga" },
  my_claims:              { en: "My Claims",          ny: "Zofunikira Zanga" },
  log_in:                 { en: "Log in",             ny: "Lowani" },
  log_out:                { en: "Log out",            ny: "Tulukani" },
  language:               { en: "Language",           ny: "Chinenero" },
  about_us:               { en: "About Us",           ny: "Za Ife" },
  terms:                  { en: "Terms & Conditions", ny: "Malamulo" },
  support:                { en: "Support",            ny: "Thandizo" },

  // ── Home page ─────────────────────────────────────────────────────────────
  hero_title:             { en: "Find What Was Lost",                           ny: "Peza Chomwe Chinathawa" },
  hero_sub:               { en: "Connecting Malawians to recover their belongings faster.", ny: "Kulumikiza Amalawi kupeza zinthu zawo mwachangu." },
  report_lost:            { en: "Report Lost",                                  ny: "Fotokozerani Chathawa" },
  report_found:           { en: "Report Found",                                 ny: "Fotokozerani Chapezeka" },
  report_missing:         { en: "Report Missing",                               ny: "Fotokozerani Wotayika" },
  search_items:           { en: "Search Items",                                 ny: "Sakani Zinthu" },
  claim_items:            { en: "Claim Items",                                  ny: "Kufunika Zinthu" },
  top_reports:            { en: "Top Reports",                                  ny: "Mauthenga Apamwamba" },
  no_reports_yet:         { en: "No reports yet.",                              ny: "Palibe mauthenga." },
  reward_offered:         { en: "Reward offered",                               ny: "Mphotho ilipo" },

  // ── Card labels ───────────────────────────────────────────────────────────
  lost:                   { en: "Lost",               ny: "Chathawa" },
  found:                  { en: "Found",              ny: "Chapezeka" },
  missing:                { en: "Missing",            ny: "Wotayika" },
  wanted:                 { en: "Wanted",             ny: "Wofunidwa" },
  last_seen_in:           { en: "Last seen in",       ny: "Anaonekera potsiriza ku" },
  found_at:               { en: "Found at",           ny: "Anapezeka ku" },

  // ── Search page ───────────────────────────────────────────────────────────
  search_reports:         { en: "Search Reports",                               ny: "Sakani Mauthenga" },
  search_sub:             { en: "Find lost items, missing persons, or things already found.", ny: "Sakani zinthu zotayika, anthu otayika, kapena zinthu zapezeka." },
  search_placeholder:     { en: "Search by name, category, location, IMEI…",   ny: "Sakani dzina, mtundu, malo, IMEI…" },
  filters:                { en: "Filters",            ny: "Osakira" },
  type:                   { en: "Type",               ny: "Mtundu" },
  category:               { en: "Category",           ny: "Gulu" },
  sort_by:                { en: "Sort by",            ny: "Yikani mwa" },
  newest_first:           { en: "Newest first",       ny: "Watsopano Poyamba" },
  oldest_first:           { en: "Oldest first",       ny: "Wakale Poyamba" },
  a_to_z:                 { en: "A → Z",              ny: "A → Z" },
  reward:                 { en: "Reward",             ny: "Mphotho" },
  with_reward:            { en: "With Reward",        ny: "Ndi Mphotho" },
  claimed_items:          { en: "Claimed Items",      ny: "Zinthu Zofunidwa" },
  clear_all:              { en: "Clear all",          ny: "Chotsani Zonse" },
  results:                { en: "results",            ny: "zotsatira" },
  result:                 { en: "result",             ny: "chotsatira" },
  no_results:             { en: "No results found.",  ny: "Palibe zotsatira." },
  try_different:          { en: "Try different keywords or clear your filters.", ny: "Yesani mawu ena kapena chotsani osakira." },

  // ── Report forms ──────────────────────────────────────────────────────────
  report_lost_title:      { en: "Report Lost Item",   ny: "Fotokozani Chinthu Chathawa" },
  report_found_title:     { en: "Report Item Found",  ny: "Fotokozani Chinthu Chapezeka" },
  report_person_title:    { en: "Report Person",      ny: "Fotokozani Munthu" },
  upload_photo:           { en: "Upload photo",       ny: "Thandizani chithunzi" },
  phone_name:             { en: "Phone name",         ny: "Dzina la foni" },
  laptop_name:            { en: "Laptop name",        ny: "Dzina la laputopu" },
  serial_number:          { en: "Serial number",      ny: "Nambala ya chinthu" },
  other_details:          { en: "Other details",      ny: "Zina" },
  where_lost:             { en: "Where was it lost?", ny: "Chinathawa kuti?" },
  where_found:            { en: "Where was it found?",ny: "Chinapezeka kuti?" },
  date_lost:              { en: "Date lost",          ny: "Tsiku linathawa" },
  date_found:             { en: "Date found",         ny: "Tsiku linapezeka" },
  additional_description: { en: "Additional description", ny: "Mfotokozero yowonjezera" },
  contact_numbers:        { en: "Contact numbers",    ny: "Manambala ophonera" },
  primary_phone:          { en: "Primary phone *",    ny: "Foni yoyamba *" },
  second_phone:           { en: "Second phone (optional)", ny: "Foni yachiwiri (osafunikira)" },
  pre_filled:             { en: "pre-filled from account", ny: "yadzazidwa kuchokera pa akaunti" },
  offer_reward:           { en: "Offer a reward for this item", ny: "Pereka mphotho chifukwa cha chinthu ichi" },
  submit_report:          { en: "Submit Report",      ny: "Tumizani Uthenga" },
  submitting:             { en: "Submitting…",        ny: "Ikutumiza…" },
  person_name:            { en: "Person name *",      ny: "Dzina la munthu *" },
  full_name:              { en: "Full name",          ny: "Dzina lonse" },
  age:                    { en: "Age",                ny: "Zaka" },
  gender:                 { en: "Gender",             ny: "Jinsi" },
  male:                   { en: "Male",               ny: "Wamwamuna" },
  female:                 { en: "Female",             ny: "Wamkazi" },
  what_wearing:           { en: "What were they wearing?", ny: "Anali atavala chiyani?" },
  home_district:          { en: "Home district",      ny: "Boma lawo" },
  last_seen_location:     { en: "Last seen location", ny: "Malo anaonekera potsiriza" },
  where_person_found:     { en: "Where was the person found?", ny: "Anapezeka kuti?" },
  date:                   { en: "Date",               ny: "Tsiku" },
  description:            { en: "Description",        ny: "Mfotokozero" },
  location_placeholder:   { en: "e.g. Blantyre, Area 25, Lilongwe CBD…", ny: "mwachitsanzo Blantyre, Area 25, Lilongwe CBD…" },

  // ── Categories ────────────────────────────────────────────────────────────
  phone:                  { en: "Phone",              ny: "Foni" },
  laptop:                 { en: "Laptop",             ny: "Laputopu" },
  wallet:                 { en: "Wallet",             ny: "Khalichi" },
  id_card:                { en: "ID Card",            ny: "Kadi ya ID" },
  person:                 { en: "Person",             ny: "Munthu" },
  other:                  { en: "Other",              ny: "Zina" },

  // ── Item Detail page ──────────────────────────────────────────────────────
  resolved:               { en: "Resolved",           ny: "Yathetsedwa" },
  mark_resolved:          { en: "Mark Resolved",      ny: "Ikani kuti Yathetsedwa" },
  edit:                   { en: "Edit",               ny: "Sinthani" },
  care:                   { en: "Care",               ny: "Chifundo" },
  cared:                  { en: "Cared",              ny: "Mwasamalira" },
  views:                  { en: "Views",              ny: "Oona" },
  shares:                 { en: "Shares",             ny: "Ogawana" },
  share:                  { en: "Share",              ny: "Gawanani" },
  share_report:           { en: "Share Report",       ny: "Gawanani Uthenga" },
  share_via:              { en: "Share via…",         ny: "Gawanani kudzera…" },
  copy:                   { en: "Copy",               ny: "Kopirani" },
  copied:                 { en: "Copied!",            ny: "Yakopidwa!" },
  back:                   { en: "Back",               ny: "Bwerani" },
  posted:                 { en: "Posted",             ny: "Yatumizidwa" },
  resolution_note:        { en: "Resolution note",    ny: "Ndemanga ya chithetso" },
  report_not_found:       { en: "Report not found",   ny: "Uthenga sunapezeke" },
  go_back:                { en: "Go back",            ny: "Bwerani" },
  contact:                { en: "Contact",            ny: "Lankhulani" },
  item_details:           { en: "Item Details",       ny: "Zinyake za Chinthu" },

  // ── My Posts ──────────────────────────────────────────────────────────────
  my_posts_title:         { en: "My Reports",         ny: "Mauthenga Anga" },
  no_reports:             { en: "No reports yet",     ny: "Palibe mauthenga" },
  no_claims:              { en: "No claims yet",      ny: "Palibe zofunikira" },
  resolve:                { en: "Resolve",            ny: "Thetsa" },
  mark_resolved_q:        { en: "Mark as Resolved?",  ny: "Ikani kuti Yathetsedwa?" },
  resolve_body:           { en: "This means the item was found or the situation was resolved. This cannot be undone.", ny: "Izi zikutanthauza kuti chinthu chapezeka kapena vuto lathetsedwa. Izi sizingasinthe." },
  how_resolved:           { en: "How was it resolved? (optional)", ny: "Zinathetsedwa bwanji? (osafunikira)" },
  cancel:                 { en: "Cancel",             ny: "Chotserani" },
  delete_claim_q:         { en: "Delete this claim?", ny: "Chotsani chofunikira ichi?" },
  delete_body:            { en: "This will permanently remove the claim from the database.", ny: "Izi zidzachotsa chofunikira ichi mu database mosatha." },
  delete:                 { en: "Delete",             ny: "Chotsani" },
  active:                 { en: "Active",             ny: "Ikugwira Ntchito" },
  pending:                { en: "Pending",            ny: "Ikudikira" },
  verified:               { en: "Verified",           ny: "Yotsimikizidwa" },
  rejected:               { en: "Rejected",           ny: "Yakanawidwa" },

  // ── Auth pages ────────────────────────────────────────────────────────────
  create_account:         { en: "Create Account",     ny: "Pangani Akaunti" },
  creating_account:       { en: "Creating account…",  ny: "Ikupanga akaunti…" },
  already_have_account:   { en: "Already have an account?", ny: "Muli ndi akaunti kale?" },
  first_name:             { en: "First name",         ny: "Dzina loyamba" },
  last_name:              { en: "Last name",          ny: "Dzina lasewero" },
  email_address:          { en: "Email address",      ny: "Imelo" },
  phone_optional:         { en: "Phone number (optional)", ny: "Nambala ya foni (osafunikira)" },
  password:               { en: "Password",           ny: "Achinsinsi" },
  confirm_password:       { en: "Confirm password",   ny: "Tsimikizani achinsinsi" },
  passwords_no_match:     { en: "Passwords do not match", ny: "Achinsinsi si ofanana" },
  login:                  { en: "Log in",             ny: "Lowani" },
  logging_in:             { en: "Logging in…",        ny: "Ikulowa…" },
  no_account:             { en: "Don't have an account?", ny: "Mulibe akaunti?" },
  sign_up:                { en: "Sign up",            ny: "Lembetsani" },
  check_email_title:      { en: "Check your email",   ny: "Onani imelo yanu" },
  go_to_login:            { en: "Go to Login",        ny: "Pitani ku Kulowa" },

  // ── Submit modal ──────────────────────────────────────────────────────────
  claim_submitted:        { en: "Claim Submitted",    ny: "Chofunikira Chatumizidwa" },
  lost_submitted:         { en: "Lost Report Submitted", ny: "Uthenga wa Chathawa Watumizidwa" },
  found_submitted:        { en: "Found Report Submitted", ny: "Uthenga wa Chapezeka Watumizidwa" },
  missing_submitted:      { en: "Missing Person Reported", ny: "Munthu Wotayika Wafotokozeridwa" },
  share_this_report:      { en: "Share this report",  ny: "Gawanani uthenga uwu" },
  go_home:                { en: "Go Home",            ny: "Bwerani Kunyumba" },

  // ── Support page ─────────────────────────────────────────────────────────
  support_title:          { en: "Support",            ny: "Thandizo" },
  support_sub:            { en: "We're here to help. Reach us any time.", ny: "Tili pano kukuthandizani. Lankhulani nafe nthawi iliyonse." },
  faqs:                   { en: "Frequently Asked Questions", ny: "Mafunso Omwe Amafunsidwa Kawirikawiri" },

  // ── About page ────────────────────────────────────────────────────────────
  about_title:            { en: "New School Technology Malawi", ny: "New School Technology Malawi" },
  who_we_are:             { en: "Who We Are",         ny: "Ndife Ndani" },
  what_we_do:             { en: "What We Do",         ny: "Timachita Chiyani" },
  the_people:             { en: "The People Behind It", ny: "Anthu Omwe Amachitachita" },
  get_in_touch:           { en: "Get In Touch",       ny: "Lankhulani Nafe" },
  send_message:           { en: "Send a Message",     ny: "Tumizani Uthenga" },
  lf_mission_title:       { en: "Our Mission",        ny: "Cholinga Chathu" },
  lf_goals_title:         { en: "Our Goals",          ny: "Zolinga Zathu" },
  lf_values_title:        { en: "Platform Values",    ny: "Mfundo za Platform" },
  terms_title:            { en: "Terms & Conditions", ny: "Malamulo" },
}

// ── t() helper ────────────────────────────────────────────────────────────
// Usage: import { t } from "../utils/translations"
//        const { lang } = useLang()
//        t("hero_title", lang)   →  "Find What Was Lost" or "Peza Chomwe Chinathawa"

export function t(key, lang = "en") {
  const entry = translations[key]
  if (!entry) {
    console.warn(`[i18n] Missing translation key: "${key}"`)
    return key
  }
  return entry[lang] || entry["en"] || key
}

export default translations
