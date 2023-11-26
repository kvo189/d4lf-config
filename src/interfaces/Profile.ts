
export interface Profile {
  fileName: string;
  content: Content;
}

export interface Content {
  Affixes?: ItemGroup[];
  /** Aspects:
  Filter for a perfect umbral
  - [aspect_of_the_umbral, 4]

  Filter for any umbral
  - aspect_of_the_umbral
  */
  Aspects?: Aspect[];
  Uniques?: Unique[];
}
/** [ ASPECT_KEY, THRESHOLD, CONDITION ] */
export type Aspect = [string] | [string, number] | [string, number, AspectCondition];
export type AspectCondition = 'smaller' | 'larger';

export interface ItemGroup {
  [key: string]: Item;
}

/**
* Affixes:
*
* Search for armor and pants that have at least 3 affixes of the affixPool
*
- Armor:
      - itemType: [armor, pants]
      - minPower: 725
      - affixPool:
          - [damage_reduction_from_close_enemies, 10]
          - [damage_reduction_from_distant_enemies, 12]
          - [damage_reduction, 5]
          - [total_armor, 9]
          - [maximum_life, 700]
      - minAffixCount: 3
*/
export interface Item {
  itemType: ItemType | ItemType[];
  minPower: number;
  affixPool: Affix[];
  minAffixCount: number;
}

export interface Unique {
  aspect: string[];
  minPower: number;
  affixPool: Affix[];
}

/** [ AFFIX_KEY, THRESHOLD, CONDITION ] */
export type Affix = [string] | [string, number] | [string, number, AffixCondition];
export type AffixCondition = 'smaller' | 'larger';

export const ItemType = {
  // Armor
  Helm: "helm",
  Armor: "chest armor",
  Pants: "pants",
  Gloves: "gloves",
  Boots: "boots",
  // Jewelry
  Ring: "ring",
  Amulet: "amulet",
  // Weapons
  Axe: "axe",
  Axe2H: "two-handed axe",
  Sword: "sword",
  Sword2H: "two-handed sword",
  Mace: "mace",
  Mace2H: "two-handed mace",
  Scythe: "scythe",
  Scythe2H: "two-handed scythe",
  Bow: "bow",
  Bracers: "bracers",
  Crossbow: "crossbow",
  Dagger: "dagger",
  Polearm: "polearm",
  Shield: "shield",
  Staff: "staff",
  Wand: "wand",
  Offhand: "offhand",
  Totem: "totem",
  Focus: "focus",
  // Material
  Material: "material", // TODO: Currently also sigils and extracted aspects are seen as materials
  Elixir: "elixir",
} as const;

// Type Alias for the ItemType
export type ItemType = typeof ItemType[keyof typeof ItemType];
