-- Sol's Checklist — aura images.
-- Run AFTER seed_auras.sql. Populates image_url for auras that have a
-- GIF/PNG on sol-rng.fandom.com. Hotlinks to static.wikia.nocookie.net
-- (already allowed in next.config.ts remotePatterns).
--
-- This is a PARTIAL seed (~22 of 233 auras). Missing images gracefully
-- render a colored initial in the UI. More can be added by editing this
-- file or via the Supabase table editor.
--
-- URL format: https://static.wikia.nocookie.net/sol-rng/images/<h>/<hh>/<file>
-- The /revision/latest/ and ?cb= suffixes are optional (Fandom resolves
-- canonical paths), and thumbnails can be sized via /scale-to-width-down/N.

update public.auras set image_url = 'https://static.wikia.nocookie.net/sol-rng/images/e/e1/Nothingauracol.png' where name = 'Nothing';
update public.auras set image_url = 'https://static.wikia.nocookie.net/sol-rng/images/e/ef/Common_Aura.gif' where name = 'Common';
update public.auras set image_url = 'https://static.wikia.nocookie.net/sol-rng/images/b/b7/UncommonIngameNew.gif' where name = 'Uncommon';
update public.auras set image_url = 'https://static.wikia.nocookie.net/sol-rng/images/8/8f/Divinus_coll.gif' where name = 'Divinus';
update public.auras set image_url = 'https://static.wikia.nocookie.net/sol-rng/images/7/78/GildedAura.gif' where name = 'Gilded';
update public.auras set image_url = 'https://static.wikia.nocookie.net/sol-rng/images/c/cf/InkGif.gif' where name = 'Ink';
update public.auras set image_url = 'https://static.wikia.nocookie.net/sol-rng/images/f/fa/WindAuraList.gif' where name = 'Wind';

update public.auras set image_url = 'https://static.wikia.nocookie.net/sol-rng/images/2/21/Diaboli_collection.gif' where name = 'Diaboli';
update public.auras set image_url = 'https://static.wikia.nocookie.net/sol-rng/images/0/0f/PreciousAura.gif' where name = 'Precious';
update public.auras set image_url = 'https://static.wikia.nocookie.net/sol-rng/images/d/d0/HydrogenCollection.gif' where name = 'Hydrogen';
update public.auras set image_url = 'https://static.wikia.nocookie.net/sol-rng/images/6/60/GlacierAuraNight.gif' where name = 'Glacier';
update public.auras set image_url = 'https://static.wikia.nocookie.net/sol-rng/images/8/8a/CollectionPlayerRework.gif' where name = 'Player';
update public.auras set image_url = 'https://static.wikia.nocookie.net/sol-rng/images/b/b7/Floracollectiongif.gif' where name = 'Flora';
update public.auras set image_url = 'https://static.wikia.nocookie.net/sol-rng/images/4/40/ColaCollection.gif' where name = 'Cola';
update public.auras set image_url = 'https://static.wikia.nocookie.net/sol-rng/images/2/28/SidereumAura.gif' where name = 'Sidereum';
update public.auras set image_url = 'https://static.wikia.nocookie.net/sol-rng/images/f/fc/BleedingAuraList.gif' where name = 'Bleeding';
update public.auras set image_url = 'https://static.wikia.nocookie.net/sol-rng/images/5/56/FlutterCollection.gif' where name = 'Flutter';
update public.auras set image_url = 'https://static.wikia.nocookie.net/sol-rng/images/1/11/Doodle_collection.gif' where name = 'Doodle';
update public.auras set image_url = 'https://static.wikia.nocookie.net/sol-rng/images/e/ec/QuartzGifCollection.gif' where name = 'Quartz';
update public.auras set image_url = 'https://static.wikia.nocookie.net/sol-rng/images/e/ec/HoneyColl.gif' where name = 'Honey';
update public.auras set image_url = 'https://static.wikia.nocookie.net/sol-rng/images/5/59/LostSoulGif.gif' where name = 'Lost Soul';
