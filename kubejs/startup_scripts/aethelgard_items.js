// Chronicles of Aethelgard - custom story items.
// Icons reuse vanilla textures with a tint + enchant glint, so no resource pack is needed.

StartupEvents.registry('item', event => {
  let relic = (id, name, texture, tint, lines) => {
    let b = event.create(id)
      .displayName(name)
      .maxStackSize(1)
      .rarity('epic')
      .glow(true)
      .fireResistant(true)
      .texture(texture)
    if (tint !== null) b.color(0, tint)
    lines.forEach(line => b.tooltip(line))
    return b
  }

  relic('frostbound_crown', 'The Frostbound Crown', 'minecraft:item/golden_helmet', 0x9FE8FF, [
    '§bPlanar Relic I §7- torn from Frostmaw',
    '§8The first king of Aethelgard wore winter itself.'
  ])
  relic('overgrown_idol', 'The Overgrown Idol', 'minecraft:item/totem_of_undying', 0x6FCF4A, [
    '§aPlanar Relic II §7- claimed from Umvuthi',
    '§8Sun-worn stone that still remembers the first forest.'
  ])
  relic('sunken_astrolabe', 'The Sunken Astrolabe', 'minecraft:item/clock_00', 0x3FD0C9, [
    '§3Planar Relic III §7- taken from The Leviathan',
    '§8It charts tides in seas that no longer exist.'
  ])
  relic('cinder_heart', 'The Cinder Heart', 'minecraft:item/magma_cream', 0xFF8844, [
    '§6Planar Relic IV §7- ripped from Ignis',
    '§8Still beating. Still burning.'
  ])
  relic('echoing_sigil', 'The Echoing Sigil', 'minecraft:item/echo_shard', null, [
    '§9Planar Relic V §7- silenced in the Deep',
    '§8Hold it to your ear and the dark answers.'
  ])
  relic('celestial_eye', 'The Celestial Eye', 'minecraft:item/ender_eye', 0xFFE680, [
    '§ePlanar Relic VI §7- pried from the Invoker',
    '§8It never blinks. It has seen the Sovereign.'
  ])

  relic('key_of_the_sovereign', 'Key of the Sovereign', 'minecraft:item/nether_star', 0xB266FF, [
    '§dForged from all six Planar Relics',
    '§7Use on an §fEnd Portal Frame §7to break the Seal.',
    '§8There is no closing this door again.'
  ])

  event.create('wyrm_heartscale')
    .displayName('Wyrm Heartscale')
    .rarity('rare')
    .glow(true)
    .texture('minecraft:item/scute')
    .color(0, 0xE0563B)
    .tooltip('§7A warm scale shed by something ancient.')
    .tooltip('§7Combine with an §fEgg §7and an element to craft a §6Dragon Egg§7.')

  event.create('aethelgard_seal_fragment')
    .displayName('Fragment of the Seal')
    .rarity('uncommon')
    .texture('minecraft:item/amethyst_shard')
    .color(0, 0xC9A6FF)
    .tooltip('§7A sliver of the failing Seal. Proof of a Warden slain.')
    .tooltip('§8Trade nothing for it. Keep it. Remember.')
})
