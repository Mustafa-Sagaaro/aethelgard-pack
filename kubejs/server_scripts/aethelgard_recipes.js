// Chronicles of Aethelgard - recipes and tags.

const DRAGON_EGG = breed => Item.of('dragonmounts:dragon_egg', '{BlockEntityTag:{Breed:"dragonmounts:' + breed + '"}}')

ServerEvents.recipes(event => {
  // --- The ritual: all six Planar Relics around an Eye of Ender forge the Key of the Sovereign. ---
  event.shaped('kubejs:key_of_the_sovereign', [
    'ABC',
    'SES',
    'DFG'
  ], {
    A: 'kubejs:frostbound_crown',
    B: 'kubejs:overgrown_idol',
    C: 'kubejs:sunken_astrolabe',
    D: 'kubejs:cinder_heart',
    F: 'kubejs:echoing_sigil',
    G: 'kubejs:celestial_eye',
    S: 'kubejs:aethelgard_seal_fragment',
    E: 'minecraft:ender_eye'
  }).id('kubejs:ritual/key_of_the_sovereign')

  // --- Early dragons: Wyrm Heartscale + Egg + an element = a breed-specific dragon egg. ---
  let eggs = {
    fire: 'minecraft:lava_bucket',
    ice: 'minecraft:packed_ice',
    forest: 'minecraft:moss_block',
    water: 'minecraft:prismarine_shard',
    aether: 'minecraft:feather',
    ghost: 'minecraft:bone_block',
    nether: 'minecraft:nether_wart',
    end: 'minecraft:ender_pearl'
  }
  Object.keys(eggs).forEach(breed => {
    event.shapeless(DRAGON_EGG(breed), ['kubejs:wyrm_heartscale', 'minecraft:egg', eggs[breed]])
      .id('kubejs:dragon_egg/' + breed)
  })

  // --- Dragon Summoning Staff without a Nether trip (Act II reward path stays the fast one). ---
  event.shaped('dragonbound_ascension:dragon_summoning_staff', [
    ' H ',
    ' A ',
    ' S '
  ], {
    H: 'kubejs:wyrm_heartscale',
    A: 'minecraft:amethyst_shard',
    S: 'minecraft:stick'
  }).id('kubejs:dragon_summoning_staff_early')

  // --- Travel and storage should never be a grind. ---
  event.shaped('waystones:warp_stone', [
    ' A ',
    'AEA',
    ' A '
  ], {
    A: 'minecraft:amethyst_shard',
    E: 'minecraft:ender_pearl'
  }).id('kubejs:warp_stone_cheap')

  event.shapeless('4x waystones:return_scroll', ['minecraft:paper', 'minecraft:paper', 'minecraft:paper', 'minecraft:paper', 'minecraft:amethyst_shard'])
    .id('kubejs:return_scrolls')

  event.shapeless('explorerscompass:explorerscompass', ['minecraft:compass', 'minecraft:spider_eye', 'minecraft:cobweb'])
    .id('kubejs:explorers_compass_cheap')
  event.shapeless('naturescompass:naturescompass', ['minecraft:compass', '#minecraft:saplings', '#minecraft:logs'])
    .id('kubejs:natures_compass_cheap')

  // Fragments of the Seal are also a renewable way to get skill books for the party.
  event.shapeless('epicfight:skillbook', ['minecraft:book', 'kubejs:aethelgard_seal_fragment'])
    .id('kubejs:skillbook_from_fragment')
})

// --- FTB Ultimine must not chew through dungeons and boss arenas. ---
ServerEvents.tags('block', event => {
  let excluded = [
    'minecraft:spawner',
    'minecraft:chest',
    'minecraft:trapped_chest',
    'minecraft:barrel',
    'minecraft:end_portal_frame',
    'minecraft:reinforced_deepslate',
    'minecraft:obsidian',
    'minecraft:crying_obsidian',
    'minecraft:budding_amethyst',
    /^cataclysm:.*/,
    /^mowziesmobs:.*/,
    /^lootr:.*/,
    /^waystones:.*/,
    /^minecolonies:.*/,
    /^structurize:.*/,
    /^domum_ornamentum:.*/,
    /^deeperdarker:(sculk_stone|sculk_grime|gloomslate|ancient_vase).*/,
    /^minecraft:.*(nether_brick|purpur|end_stone_brick|prismarine|sculk).*/,
    /^minecraft:(polished_)?blackstone.*/,
    /^minecraft:.*deepslate_(brick|tile)s?.*/,
    /^minecraft:(mossy_|cracked_|chiseled_)?stone_brick.*/
  ]
  event.add('ftbultimine:excluded_blocks', excluded)
})

ServerEvents.tags('item', event => {
  event.add('kubejs:planar_relics', [
    'kubejs:frostbound_crown',
    'kubejs:overgrown_idol',
    'kubejs:sunken_astrolabe',
    'kubejs:cinder_heart',
    'kubejs:echoing_sigil',
    'kubejs:celestial_eye'
  ])
})
