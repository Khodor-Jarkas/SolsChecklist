// Generates seed_aura_images.sql by mapping each aura name to its Sol's RNG
// wiki image filename and computing the Fandom CDN URL (MD5-derived path).
//
// Run with: node supabase/tools/gen-aura-images.mjs > supabase/seed_aura_images.sql
//
// Filenames were harvested from:
//   https://sol-rng.fandom.com/api.php?action=parse&page=Auras&prop=images

import crypto from "node:crypto";

// [aura_name, wiki_image_filename]
const mappings = [
  // Common (Basic)
  ["Nothing", "Nothingauracol.png"],
  ["Common", "Common_Aura.gif"],
  ["Uncommon", "UncommonIngameNew.gif"],
  ["Good", "GoodAura.gif"],
  ["Natural", "NaturalAura.gif"],
  ["Rare", "Rare_Aura.gif"],
  ["Divinus", "Divinus_coll.gif"],
  ["Crystallized", "CrystalAura.gif"],
  ["Rage", "RageAura.gif"],
  ["Topaz", "TopazCollectionNight.gif"],
  ["Ruby", "RubyAura.gif"],
  ["Forbidden", "ForbiddenCollectionNew.gif"],
  ["Emerald", "Emerald_Collection.gif"],
  ["Gilded", "GildedAura.gif"],
  ["Ink", "InkGif.gif"],
  ["Jackpot", "JackpotAura.gif"],
  ["Sapphire", "SapphireCollection.gif"],
  ["Aquamarine", "Aquamarine_Collection1.gif"],
  ["Wind", "WindAuraList.gif"],

  // Epic
  ["Diaboli", "Diaboli_collection.gif"],
  ["Precious", "PreciousAura.gif"],
  ["Hydrogen", "HydrogenCollection.gif"],
  ["Atomic", "Roblox2025-07-2709-59-55-ezgif.com-crop.gif"],
  ["Glock", "Glock.gif"],
  ["Magnetic", "MagneticAuraNight.gif"],
  ["Ash", "AshSnapshotGIf.gif"],
  ["Glacier", "GlacierAuraNight.gif"],
  ["Player", "CollectionPlayerRework.gif"],
  ["Flora", "Floracollectiongif.gif"],
  ["Cola", "ColaCollection.gif"],
  ["Sidereum", "SidereumAura.gif"],
  ["Bleeding", "BleedingAuraList.gif"],
  ["Flutter", "FlutterCollection.gif"],
  ["Flushed", "FlushedAuraNight.gif"],
  ["Hazard", "HazardGif.gif"],
  ["Doodle", "Doodle_collection.gif"],
  ["Quartz", "QuartzGifCollection.gif"],
  ["Honey", "HoneyColl.gif"],
  ["Lost Soul", "LostSoulGif.gif"],
  ["Atomic : Ribonucleic", "Riboneucleic_collection.gif"],

  // Unique
  ["★", "1starnewCol.gif"],
  ["Undead", "UndeadAura.gif"],
  ["Corrosive", "Corrosive.gif"],
  ["Kawaii", "KawaiiCollection.gif"],
  ["Rage : Heated", "RageHeatedAura.gif"],
  ["Ink : Leak", "LeakGif.gif"],
  ["Powered", "Powered.gif"],
  ["Copper", "CopperCollectionRework.gif"],
  ["Watt", "WattCollection.gif"],
  ["Aquatic", "AquaticAura.gif"],
  ["Solar", "SolarAuraNight.gif"],
  ["Lunar", "Lunar_Collection_E7.gif"],
  ["Starlight", "StarlightCollection.gif"],
  ["StarRider", "StarRiderCollection.gif"],
  ["Flushed : Lobotomy", "FlushedLobotomyAura.gif"],
  ["Hazard : Rays", "Hazard_Rays.gif"],
  ["Nautilus", "NautilusAuraNight.gif"],
  ["Permafrost", "PermafrostAura.gif"],
  ["Flow", "FlowCollection.gif"],
  ["Stormal", "Stormal_Collection_E7.gif"],

  // Legendary
  ["★★", "Twostar_fixed_collction.gif"],
  ["Fault", "Fault_Aura_Collection_GIF.gif"],
  ["Exotic", "ExoticAura150x150.gif"],
  ["Diaboli : Void", "Diabolivoidcollection.gif"],
  ["Comet", "Comet_collect.gif"],
  ["Divinus : Angel", "Angel_coll.gif"],
  ["Jade", "JadeInCollection.gif"],
  ["Spectre", "SpectreCollection.gif"],
  ["Jazz", "JazzCollectionBetter.gif"],
  ["Aether", "AetherCollection.gif"],
  ["Bounded", "BoundedAuraNight.gif"],
  ["Lantern", "LanternCollection.gif"],
  ["Celestial", "Celestial_Rework_Collection.gif"],
  ["Terror", "TerrorColl.gif"],
  ["Hope", "HopeCollection.gif"],
  ["Raven", "RavenCollection.gif"],
  ["Warlock", "WarlockCollection.gif"],
  ["Undead : Devil", "DevilReworkedCollection.gif"],
  ["Kyawthuite", "Kyawthuite_Collection2.gif"],

  // Mythic
  ["★★★", "3StarCollection.gif"],
  ["Arcane", "ArcaneCollectionN3w.gif"],
  ["Gothic", "GothCollection.gif"],
  ["Starlight : Kunzite", "StarlightKunColl.gif"],
  ["Magnetic : Reverse Polarity", "Magnetic_Reverse_Polarity_Rework_Collection.gif"],
  ["Undefined", "Undefined_Collection1.gif"],
  ["Rage : Brawler", "BrawlerCollection.gif"],
  ["Symbiosis", "SymbosisCollection.gif"],
  ["Astral", "Astral_Era9.gif"],
  ["Cosmos", "CosmosCollection.gif"],
  ["Archmage", "ArchmageCollection.gif"],
  ["Player : Respawn", "Player_respawn_collection.gif"],
  ["Gravitational", "Grav_CollectionE9.gif"],
  ["Bounded : Unbound", "Unbound_E7_Collection2.gif"],
  ["Flutter : Buggify", "BuggifyCollection.gif"],
  ["Flowed", "FlowedColl.gif"],
  ["Virtual", "VirtualReworkCollection.gif"],
  ["Parasite", "ParasiteColl.gif"],
  ["Orion", "OrionCollection.gif"],
  ["Apatite", "Apatite_collect.gif"],
  ["Savior", "Savior_Collection.gif"],
  ["Shiftlock", "ShiftlockCollection.gif"],
  ["Evanescent", "EvanescentCollection.gif"],
  ["Cosmos : Alice", "Cosmosalice.gif"],
  ["Crystallized : Bejeweled", "Bejeweled.gif"],
  ["Aquatic : Flame", "Aquatic_Flame_Rework.gif"],
  ["Poseidon", "PosEra7.gif"],
  ["Metabytes", "Metabytes.gif"],
  ["Wraith", "WraithColl.gif"],
  ["Zeus", "Zeus_GIF.gif"],
  ["Solar : Solstice", "SolsticeCollection.gif"],
  ["Galaxy", "Galaxy_Aura.gif"],
  ["Lunar : Full Moon", "LunarFMReworkCollection.gif"],
  ["Anima", "AnimaCollection.gif"],
  ["Twilight", "Twilight_Collection.gif"],
  ["Origin", "OriginCollectionEon1.gif"],
  ["Hades", "HadesCollection.gif"],
  ["Celestial : Divine", "CelestialDivineCollection.gif"],
  ["Anubis", "AnubisC.gif"],
  ["Refraction", "Refraction-Collection.gif"],
  ["Faith", "Faith.gif"],
  ["Hyper-Volt", "HpVl.gif"],
  ["Velocity", "Velocitygif.gif"],
  ["Nautilus : Lost", "Nautilost.gif"],
  ["Divinus : Guardian", "GuardianCollection.gif"],
  ["Outlaw", "Outlaw-Collection.gif"],
  ["Harnessed", "Harnessed2.gif"],
  ["Nihility", "Nihility_collection.gif"],
  ["Helios", "HeliosCollection.gif"],
  ["Stargazer", "Stargazerincollection.gif"],
  ["Amethyst", "Amethyst_collect.gif"],

  // Exalted
  ["Starscourge", "StarscourgeRevampCollection.gif"],
  ["Sharkyn", "SharkynCollection.gif"],
  ["Guardian", "GuardianCollectionGif.gif"],
  ["Melodic", "MelodicCollection.gif"],
  ["Sailor", "SailorCollection.gif"],
  ["Stormal : Hurricane", "Hurricane_Collection_Eon_1_reupload.gif"],
  ["Sirius", "Siriusincollection.gif"],
  ["Arcane : Legacy", "Arcane_Legacy_Collection_E7.gif"],
  ["Icarus", "IcarusCollection.gif"],
  ["Lullaby", "LullabyCollection.gif"],
  ["Chromatic", "Chromatic_GIF.gif"],
  ["Plasma", "PlasmaCollFIXED.gif"],
  ["Aviator", "Aviator_Collection.gif"],
  ["Ruby : Brimstone", "Ruby-Brimstone_collection.gif"],
  ["Apotheosis", "ApotheosisCollection.gif"],
  ["Blizzard", "Blizzard_col_gif.gif"],
  ["Arcane : Dark", "Arcane-dark-collection-era9.gif"],
  ["Flora : Florest", "FloraFlorest_collection.gif"],
  ["Ethereal", "Ethereal_Post_Trans_Collection.gif"],
  ["Virtual : Fatal Error", "FatalErrorReowrkColl.gif"],
  ["Juxtaposition", "JuxtapColl.gif"],
  ["Overseer", "Overseer-collection.gif"],
  ["Exotic : Apex", "Exotic_Apex_GIF_Collection.gif"],
  ["Matrix", "MatrixCollectionEon1.gif"],
  ["Runic", "RunicColl.gif"],
  ["Sentinel", "SentinelCollection.gif"],
  ["Twilight : Iridescent Memory", "Twilight_-_Iridescent_Memory_Collection.gif"],
  ["Antivirus", "AntivirusCollection.gif"],
  ["Dominion", "DominionColl.gif"],
  ["Starborn", "Starborn_collection.gif"],
  ["Melodic : Serenade", "MelodicSerenadeCollection.gif"],
  ["Sailor : Flying Dutchman", "DutchmanCollectionEon1.gif"],
  ["Carriage", "Collection_Carriage.gif"],
  ["Aquaria", "Aquaria_collection.gif"],
  ["Virtual : Full Control", "VirtualFullControl-Collection.gif"],
  ["Harnessed : Elements", "Harnessed-Elements-Collection.gif"],
  ["Virtual : WorldWide", "WorldWide_Collection.gif"],
  ["Atomic : Nucleus", "NucleusCollection.gif"],

  // Glorious
  ["Chromatic : Genesis", "Genesis-Collection.gif"],
  ["Starscourge : Radiant", "Radiant_rework.gif"],
  ["Spectraflow", "SpectraflowCollection.gif"],
  ["Lily", "LilyCollection.gif"],
  ["Overture", "Overture_Collection.gif"],
  ["Symphony", "REWORKSymphonyCollection.gif"],
  ["Twilight : Withering Grace", "WitheringGraceCollection.gif"],
  ["Felled", "FelledColl.gif"],
  ["Impeached", "Impeached_Collectiongifv2.gif"],
  ["Raven : Plague", "RavenPlagueCollection.gif"],
  ["Lumenpool", "LumenpoolCollection.gif"],
  ["Hyper-Volt : Ever-Storm", "Hyper-Volt_-_Ever-Storm_-_Collection.gif"],
  ["Astral : Zodiac", "Zodiacollection.gif"],
  ["Prophecy", "ProphecyColl.gif"],
  ["Exotic : Void", "Exoticvoidcollectionnew.gif"],
  ["Overture : History", "Overture_History_Eon1_Collection.gif"],
  ["Bloodlust", "Bloodlustnew.gif"],
  ["Maelstrom", "MaelstromCollection.gif"],
  ["Perpetual", "PerpetualCollection.gif"],
  ["Lotusfall", "LotusfallCollections6mb.gif"],
  ["Jazz : Orchestra", "OrchestraCollection.gif"],
  ["Archangel", "ArchangelNewCollection.gif"],
  ["Atlas", "Atlas_collection.gif"],
  ["Flora : Evergreen", "EverGreenNewColl.gif"],
  ["Chillsear", "ChillsearColl.gif"],
  ["Celestial : Eclipse", "CelestialEclipseColl.gif"],
  ["Abyssal Hunter", "Abyssal_Hunter_Max_Graphics.gif"],
  ["Gargantua", "Collection_Gargantuarework.gif"],
  ["Apostolos", "BetterApostolosCollection.gif"],
  ["Unknown", "Unknownincollection.gif"],
  ["Kyawthuite : Remembrance", "Remembrancecollection2.gif"],
  ["Ruins", "RuinsReworkCollection.gif"],
  ["Matrix : Overdrive", "MatrixOverdriveCollection.gif"],
  ["Sailor : Admiral", "AdmiralCollection.gif"],
  ["Elude", "EludeCollection.gif"],
  ["Sophyra", "Sophyra_Collection.gif"],
  ["Matrix : Reality", "MatrixRealityCollection.gif"],
  ["Prologue", "PrologueCollection.gif"],
  ["Pythios", "Pythios_collection.gif"],
  ["Sovereign", "SovereignAugust2025.gif"],
  ["Ruins : Withered", "Witheredcollectionnew.gif"],
  ["Aegis", "AegisCollection.gif"],
  ["Dreamscape", "DreamscapeInCollection.gif"],
  ["Ascendant", "AscendantCollection.gif"],

  // Transcendent
  ["Nyctophobia", "Nyctophobia-Collection.gif"],
  ["Pixelation", "PixelCollectionNew.gif"],
  ["Luminosity", "ReworkedLumiColl.gif"],
  ["Breakthrough", "BreakthroughCollection.gif"],
  ["Equinox", "EquinoxNewCollection.gif"],

  // Challenged
  ["Glitch", "Era8glitchcollection.gif"],
  ["Borealis", "BorealisCollection.gif"],
  ["Leviathan", "LeviathanCollection.gif"],
  ["Memory", "MemoryCollectionEon1.gif"],
  ["Neferkhaf", "NeferkhafCollection.gif"],
  // Fragments of the Crimson Moon — no reliable filename, skipped

  // Challenged+
  ["Eden", "EdenCollection.gif"],
  ["Oppression", "OppressionCollectionNew.gif"],
  ["Dreammetric", "Dreammetric_Collection.gif"],
  ["Monarch", "MonarchCollection.gif"],
  ["Oblivion", "Oblivion_collect.gif"],
  ["Illusionary", "Illusionary_collection.gif"],

  // Craftable
  ["Eclipse", "Eclispe_collection.gif"],
  ["Chromatic : Hyper", "HyperCollection.gif"],
  ["Atlas : A.T.L.A.S.", "A.T.L.A.S.COLLECTION.gif"],
  ["Matrix : Steampunk", "Matrix_steampunk_collection.gif"],
  ["MasterHand", "MasterHandCollection.gif"],
];

function urlFor(filename) {
  const h = crypto.createHash("md5").update(filename).digest("hex");
  // Fandom CDN: /<h[0]>/<h[0..2]>/<filename>
  // encodeURIComponent handles spaces, colons, non-ASCII.
  return `https://static.wikia.nocookie.net/sol-rng/images/${h[0]}/${h.slice(0, 2)}/${encodeURIComponent(filename).replace(/'/g, "%27")}`;
}

function sqlEscape(s) {
  return s.replace(/'/g, "''");
}

const header = `-- Sol's Checklist — aura images.
-- Generated by supabase/tools/gen-aura-images.mjs.
-- Run AFTER seed_auras.sql. Hotlinks to static.wikia.nocookie.net
-- (allowed in next.config.ts remotePatterns). Idempotent: re-runnable.
-- Covers ${mappings.length} of 233 auras; the rest render a fallback tile.

`;

const rows = mappings
  .map(([name, file]) => {
    const url = urlFor(file);
    return `update public.auras set image_url = '${sqlEscape(url)}' where name = '${sqlEscape(name)}';`;
  })
  .join("\n");

process.stdout.write(header + rows + "\n");
