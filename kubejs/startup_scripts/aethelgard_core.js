// priority: 1000
// Chronicles of Aethelgard - shared story/balance data (read by every other script through `global.AETH`).

global.AETH = {
  // Boss -> Planar Relic dropped on death (one guaranteed drop per kill).
  relics: {
    'mowziesmobs:frostmaw': 'kubejs:frostbound_crown',
    'mowziesmobs:umvuthi': 'kubejs:overgrown_idol',
    'cataclysm:the_leviathan': 'kubejs:sunken_astrolabe',
    'cataclysm:ignis': 'kubejs:cinder_heart',
    'deeperdarker:stalker': 'kubejs:echoing_sigil',
    'minecraft:warden': 'kubejs:echoing_sigil',
    'illagerinvasion:invoker': 'kubejs:celestial_eye'
  },

  relicNames: {
    'kubejs:frostbound_crown': 'The Frostbound Crown',
    'kubejs:overgrown_idol': 'The Overgrown Idol',
    'kubejs:sunken_astrolabe': 'The Sunken Astrolabe',
    'kubejs:cinder_heart': 'The Cinder Heart',
    'kubejs:echoing_sigil': 'The Echoing Sigil',
    'kubejs:celestial_eye': 'The Celestial Eye'
  },

  // Early mini-bosses that drop a Wyrm Heartscale (crafts into a dragon egg).
  heartscale: {
    'mowziesmobs:ferrous_wroughtnaut': true,
    'mowziesmobs:frostmaw': true,
    'mowziesmobs:umvuthi': true,
    'mowziesmobs:naga': false,
    'minecraft:elder_guardian': true,
    'cataclysm:kobolediator': true,
    'cataclysm:amethyst_crab': true,
    'illagerinvasion:invoker': true,
    'minecraft:evoker': true
  },

  // Everything treated as a "boss" by the anti-one-shot rules.
  bossSet: {
    'mowziesmobs:frostmaw': true,
    'mowziesmobs:umvuthi': true,
    'mowziesmobs:ferrous_wroughtnaut': true,
    'cataclysm:ignis': true,
    'cataclysm:the_leviathan': true,
    'cataclysm:ender_guardian': true,
    'cataclysm:netherite_monstrosity': true,
    'cataclysm:the_harbinger': true,
    'cataclysm:ancient_remnant': true,
    'cataclysm:maledictus': true,
    'cataclysm:scylla': true,
    'cataclysm:kobolediator': true,
    'cataclysm:ender_golem': true,
    'deeperdarker:stalker': true,
    'illagerinvasion:invoker': true,
    'minecraft:warden': true,
    'minecraft:wither': true,
    'minecraft:ender_dragon': true,
    'minecraft:elder_guardian': true
  },

  balance: {
    bossHitCap: 0.05,          // no single hit removes more than 5% of a boss' max health
    dragonVsBossHitCap: 0.015, // tamed dragons: 1.5% per hit - companions, not boss-killers
    minCap: 12,                // never cap below this (keeps low-HP minibosses snappy)
    bossVsDragonFloor: 0.06    // a boss hit always costs a dragon at least 6% of its health
  },

  // Boss intro cutscenes (Immersive Cinematics script id, trigger range, length in seconds).
  cutscenes: {
    'mowziesmobs:frostmaw': { id: 'boss_frostmaw', range: 18, seconds: 6 },
    'mowziesmobs:umvuthi': { id: 'boss_umvuthi', range: 18, seconds: 6 },
    'cataclysm:the_leviathan': { id: 'boss_leviathan', range: 40, seconds: 6 },
    'cataclysm:ignis': { id: 'boss_ignis', range: 30, seconds: 6 },
    'deeperdarker:stalker': { id: 'boss_stalker', range: 24, seconds: 5 },
    'illagerinvasion:invoker': { id: 'boss_invoker', range: 20, seconds: 5 },
    'cataclysm:ender_guardian': { id: 'boss_ender_guardian', range: 28, seconds: 6 },
    'minecraft:ender_dragon': { id: 'boss_sovereign', range: 160, seconds: 7 }
  },

  sovereignName: 'The Abyssal Sovereign'
}

console.info('[Aethelgard] core data loaded')
