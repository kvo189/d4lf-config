export interface Settings {
  general:          GeneralSettings;
  char:             CharacterSettings;
  advanced_options: AdvancedSettingOptions;
}

export interface AdvancedSettingOptions {
  run_scripts: string;
  run_filter:  string;
  exit_key:    string;
  log_lvl:     string;
  scripts:     string;
}

export interface CharacterSettings {
  inventory:  string;
  skill4:     string;
  skill3:     string;
  health_pot: string;
}

export interface GeneralSettings {
  profiles:                   string;
  run_vision_mode_on_startup: string;
  check_chest_tabs:           string;
  hidden_transparency:        string;
  local_prefs_path:           string;
}

export const DEFAULT_SETTINGS: Settings = {
  "general": {
      "profiles": "general,barb,druid,necro,rogue,sorc,uniques",
      // "profiles": ['general','barb','druid','necro','rogue','sorc','uniques'],
      "run_vision_mode_on_startup": "True",
      "check_chest_tabs": "2",
      "hidden_transparency": "0.35",
      "local_prefs_path": ""
  },
  "char": {
      "inventory": "i",
      "skill4": "4",
      "skill3": "3",
      "health_pot": "q"
  },
  "advanced_options": {
      "run_scripts": "f9",
      "run_filter": "f11",
      "exit_key": "f12",
      "log_lvl": "info",
      "scripts": "vision_mode"
  }
}
