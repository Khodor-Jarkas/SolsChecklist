// Generates seed_event_aura_images.sql for the event-aura roster.
// Same pattern as gen-aura-images.mjs: [name, wiki_image_filename] mapped to
// a Fandom CDN URL via MD5 of the filename.
//
// Filenames harvested via:
//   action=parse&page=Events_and_Special_Auras&prop=images   (through Halloween 2025)
//   action=parse&page=<AuraName>&prop=images                 (Christmas 2025 onward)
//
// Run with: node supabase/tools/gen-event-aura-images.mjs > supabase/seed_event_aura_images.sql

import crypto from "node:crypto";

const mappings = [
  // Valentine's Day 2024
  ["Divinus : Love",                 "DivinusLoveAura.gif"],
  ["Flushed : Heart Eye",            "FlushedHeartEyeAura.gif"],
  ["Celestial : Cupid",              "Cele_cupid_rework.gif"],
  ["Blossom",                        "Blossomreworkcollection.gif"],

  // April Fools 2024
  ["Defined",                        "DefinedCollectiongif.gif"],
  ["Kromat1k",                       "Kromat1k_Collection_new.gif"],
  ["Impeached : i'm peach",          "I'm_Peach_Collection_New.gif"],

  // Summer 2024
  ["Surfer",                         "SurferCollection.gif"],
  ["StarRider : Starfish",           "StarfishRiderCollection2.gif"],
  ["Watermelon",                     "Watermelon_Collection.png"],
  ["Shard Surfer",                   "ShardSurferReworkCollection.gif"],

  // Innovator 2024
  ["Innovator",                      "InnovatorCollection.gif"],

  // Halloween 2024
  ["Pump",                           "Pump_Collection.gif"],
  ["Lunar : Nightfall",              "Nightfall_in_Collections.gif"],
  ["Vital",                          "Vital.gif"],
  ["Moonflower",                     "MoonflowerCollection1.gif"],
  ["Cryptfire",                      "Cryptfire_resize.gif"],
  ["Soul Hunter",                    "Soulhunter.gif"],
  ["Dullahan",                       "Dullahancollectiongif.gif"],
  ["Nightmare Sky",                  "NightmareSkyCollection.gif"],
  ["Harvester",                      "Harvester_collection.gif"],
  ["Apostolos : Veil",               "Apostolos_VEIL_HD.png"],

  // Winter 2025
  ["Blossom : Frozen",               "Blossom_Frozen_GIF.gif"],
  ["Frigid",                         "Frigidcollection.gif"],
  ["Wonderland",                     "WonderlandCollection.gif"],
  ["Santa Frost",                    "FrostCollection.gif"],
  ["Winter Fantasy",                 "Winter_Fantasy(Collection).gif"],
  ["Express",                        "ExpressCollectionGIf.gif"],
  ["Abomitable",                     "AbomitableIngame.gif"],
  ["Atlas : Yuletide",               "FixedYuletideColl.gif"],

  // April Fools 2025
  ["Pukeko",                         "Pukekoingame.gif"],
  ["Flushed : Troll",                "TrollCollection.gif"],
  ["Origin : Onion",                 "OnionCollection.gif"],
  ["Glock : the glock of the sky",   "Glockoftheskycollection.gif"],

  // Easter 2025
  ["Windy Egg",                      "WindyEggCollection.gif"],
  ["Snowy Egg",                      "SnowyEggCollection.gif"],
  ["Rainy Egg",                      "RainyEggCollection.gif"],
  ["Starfall Egg",                   "Starfall_GIFS_2.gif"],
  ["Hellfire Egg",                   "Hellfireeggcollection.gif"],
  ["Corruption Egg",                 "CorruptionEggCollection.gif"],
  ["Sandstorm Egg",                  "SandstormEggCollection.gif"],
  ["Null Egg",                       "NullEggCollection.gif"],
  ["Glitched Egg",                   "GlitchedEggCollection.gif"],

  // Summer 2025
  ["Manta",                          "Manta_In-Collection.gif"],
  ["Aegis : Watergun",               "Aegis_Watergun_in_collection.gif"],
  ["SandBasket",                     "SandBasketCollection.gif"],
  ["Bubble",                         "Bubble_thing2.gif"],
  ["Bioluminescent",                 "BioluminescentCollection.gif"],
  ["Life Guard",                     "LifeGuardCol.gif"],
  ["Ink : PaintballGun",             "InkPaintballGunCollection.gif"],
  ["Parasol",                        "ParasolCollection.gif"],

  // Halloween 2025
  ["Pump : Trickster",               "Pumptrickstercollection.gif"],
  ["Celestial : Wicked",             "Celestial_-_Wicked_collection.gif"],
  ["Lunar : Cultist",                "Lunar_-_Cultist_collection.gif"],
  ["Headless",                       "HeadlessCollection.gif"],
  ["Werewolf",                       "Werewolf_collection.gif"],
  ["Shucks",                         "Shucks_collection.gif"],
  ["Oni",                            "OniCollection.gif"],
  ["Sinister",                       "Sinister_in_Collection.gif"],
  ["Headless : Horseman",            "OrangeDullahanCollection.gif"],
  ["Reaper",                         "Reaper_collection.gif"],
  ["Accursed",                       "Accursed_in_Collection.gif"],
  ["Bloodgarden",                    "BloodgardenCollection.gif"],
  ["Grief",                          "CollectionGriefFIX.gif"],
  ["Crimson",                        "Crimson_collection.gif"],
  ["Graveborn",                      "Graveborn_Collection.gif"],
  ["Afterparty",                     "AfterpartyInGame.gif"],
  ["Phantasma",                      "PhantasmaCollection.jpg"],
  ["Apocalypse",                     "Apocalypsecollection.png"],
  ["Wraithlight",                    "CollectionWraithlight.gif"],
  ["Malediction",                    "Malediction_in_Collection.gif"],
  ["Banshee",                        "BansheeCollection.gif"],
  ["Ravage",                         "RavageCollection.gif"],
  ["Arachnophobia",                  "ArachnophobiaCol.gif"],
  ["Lamenthyr",                      "LamenthyrCollection.gif"],
  ["Erebus",                         "ErebusCollection.gif"],
  ["Veinweaver",                     "CollectionVeinweaver.gif"],
  ["Dreadsea",                       "DreadseaCollection.gif"],
  ["Carousel",                       "CHAOS_CAROUSEL.gif"],
  ["Lament",                         "FixedLamentCollection.gif"],
  ["Thaneborne",                     "ThaneborneCollection.gif"],
  ["Slaughter",                      "SlaughterCollection.gif"],

  // Christmas 2025
  ["Snowball",                       "SnowballInCollection.gif"],
  ["StarRider : Snowflake",          "SnowflakeCollection.gif"],
  ["Cryogenic",                      "Cryogenic_Collection.gif"],
  ["Gingerbread",                    "GingerbreadCollection.gif"],
  ["Jackfrost",                      "JackFrost_InCollection.gif"],
  ["Lost Soul : Wander",             "WanderCollection.gif"],
  ["Frostwood",                      "Frostwoodcollection.gif"],
  ["North Pole",                     "NorthPoleCollFixed.gif"],
  ["Sky Burst",                      "SkyburstCollection.gif"],
  ["Encase",                         "Encase_Collection.gif"],
  ["CryoFang",                       "Cryofang_collection.gif"],
  ["Northern",                       "NorthernCollection.gif"],
  ["EveNight",                       "EveNightCollection.gif"],
  ["Workshop",                       "Workshop_coll.gif"],
  ["Parol",                          "Parol_collection.gif"],
  ["Sovereign : Frostveil",          "Frostveil_coll.gif"],
  ["Winter Garden",                  "WinterGardenCollection.gif"],
  ["Dream Traveler",                 "DreamTravelerCollection.gif"],
  ["Present",                        "PresentCollection.gif"],
  ["Skyforge",                       "SkyforgeCollection.gif"],
  ["Christmastide",                  "XmastideUpdated.gif"],
  ["Reina",                          "ReinaCollection.gif"],

  // Valentine's Day 2026
  ["Velvet",                         "Velvet_collect.gif"],
  ["Symphony : Bloomed",             "BloomedCollection.gif"],

  // Easter 2026
  ["Hatchwarden",                    "HatchwardenColl.gif"],
  ["Emperor",                        "Emperor_collect.gif"],
  ["Eggsistance",                    "EggistanceCollection.gif"],
  ["Revive",                         "Revive_in_collection.gif"],
  ["Eggore",                         "EggoreCollection.gif"],
  ["Eostre",                         "EostreCollection.gif"],
  ["Aegis : Eggis",                  "Eggis_collect.gif"],
  ["Yolkegg",                        "Yolkegg_Collection.gif"],
  ["Sky Festival",                   "Sky_festival_collection_gif.gif"],
  ["Egger",                          "EggerColl.gif"],
  ["Easter Isles",                   "EasterIslesColl.gif"],
  ["Aeroquest",                      "AeroquestColl.gif"],
  ["Rabbit Invasion",                "Rabbit_invasion_collect.gif"],
  ["Scavenger",                      "Scavenger_collect.gif"],
  ["Zilch",                          "Zilch_Curation.gif"],

  // April Fools 2026
  ["Burger",                         "BurgerCol.png"],
  ["StarRider : yourdidit",          "Udidit_collect.gif"],
  ["Bounded : Kidnapped",            "KidnappedCol.gif"],
  ["Very Small Sewage Rat That's About 3.082 Studs Long", "Vssrta3slCol.gif"],
  ["Pukeko : Jumping",               "PukekoJumpingColl.gif"],
  ["Aether : Disappointment",        "DisappointmentColl.gif"],
  ["Bloated.exe",                    "Bloated_exe_collection.gif"],
  ["Impeached : Imcrine",            "ImcrineCollection.gif"],
  ["Doodle : Abyssal Hunter",        "Doodleabyssalhuntercollection.gif"],
  ["Surfer : Symphony",              "Surfer_Symphony.gif"],
  ["Lumenpool : Ramenpool",          "RamenpoolColl.gif"],
  ["Workshop : System",              "SystemColl.gif"],
  ["Pukeko : P.U.K.E.K.O.G.O.D.",    "Pukekogodcollection.gif"],
  ["A Fool's Experience",            "AFoolExperienceCollection.gif"],
  ["Equinox : You Are An Idiot",     "Yaai_rework_collect.gif"],
];

function urlFor(filename) {
  const h = crypto.createHash("md5").update(filename).digest("hex");
  return `https://static.wikia.nocookie.net/sol-rng/images/${h[0]}/${h.slice(0, 2)}/${encodeURIComponent(filename).replace(/'/g, "%27")}`;
}

function sqlEscape(s) {
  return s.replace(/'/g, "''");
}

const header = `-- Sol's Checklist — event aura images.
-- Generated by supabase/tools/gen-event-aura-images.mjs.
-- Run AFTER seed_event_auras.sql. Idempotent.
-- Covers ${mappings.length} event auras.

`;

const rows = mappings
  .map(([name, file]) => {
    const url = urlFor(file);
    return `update public.auras set image_url = '${sqlEscape(url)}' where name = '${sqlEscape(name)}';`;
  })
  .join("\n");

process.stdout.write(header + rows + "\n");
