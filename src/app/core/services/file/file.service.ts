import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, shareReplay } from 'rxjs';
import { DEFAULT_SETTINGS, Settings } from '../../../../interfaces/Settings';
import { ElectronService } from '../electron/electron.service';
import { LogService } from '../log/log.service';
import * as ini from 'ini';
import { Content, Profile } from '../../../../interfaces/Profile';
import * as yaml from 'js-yaml';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  private _profileNames: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  profileNames$ = this._profileNames.asObservable().pipe(shareReplay(1));

  private _profiles: BehaviorSubject<Profile[]> = new BehaviorSubject<Profile[]>([]);
  profiles$ = this._profiles.asObservable().pipe(shareReplay(1));

  private _selectedFile: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  selectedFile$ = this._selectedFile.asObservable().pipe(shareReplay(1));

  private _settings: BehaviorSubject<Settings | undefined> = new BehaviorSubject<Settings | undefined>(undefined);
  settings$ = this._settings.asObservable().pipe(shareReplay(1));

  constructor(
    private electronService: ElectronService,
    private toast: ToastrService,
    private log: LogService
  ) {
    this.readConfigFile();
    this.readProfiles();
  }

  readConfigFile() {
    this.electronService.readConfigFile().then(({ path, data }) => {
      this.log.info(`Existing settings found at ${path}`, { data });
      this._settings.next(data as Settings);
    }).catch((error) => {
      this.log.error(`Error reading config file`, { data: error });
      this.promptCreateConfigFile();
    });
  }

  promptCreateConfigFile(msg = 'Config file not found. Do you want to create it with default settings?') {
    const userConfirmed = confirm(msg);
    if (userConfirmed) {
      this.createDefaultConfigFile();
    }
  }

  createDefaultConfigFile() {
    const defaultSettings = DEFAULT_SETTINGS;
    defaultSettings.general.profiles = this._profileNames.value.join(',');
    const iniData = ini.stringify(defaultSettings);
    this.electronService.writeConfigFile(iniData).then(() => {
      this.log.info('Default config file created', { toast: 'success' });
      this._settings.next(defaultSettings);
    }).catch(error => {
      this.log.error('Error creating default config file', { data: error });
    });
  }

  saveSettings(settings: Settings) {
    // settings.general.profiles = settings.general.profiles.join(',');
    const iniData = ini.stringify(settings);
    this.electronService.writeConfigFile(iniData).then(() => {
      this.log.info(`Settings saved`, { data: settings, toast: 'success' });
      this._settings.next(settings);
    }).catch((error) => {
      this.log.error('Error saving settings. Please check logs.', { data: error, toast: 'error' });
    });
  }

  readProfiles() {
    this.electronService.readProfiles().then(profiles => {
      const profileFiles: string[] = profiles.filter(profile => profile.fileName).map((profile: Profile) => {
        return profile.fileName.replace(/\.y(a)?ml$/, '') ;
      })
      this._profileNames.next(profileFiles);
      this._profiles.next(profiles as Profile[]);
      console.log('Profiles detailed', profiles);
      this.log.info(`${profileFiles.length} Profiles found`, { data: profileFiles });
    }).catch(error => {
      this.log.error(`Error reading profiles`, { data: error, toast: 'error' });
    });
  }

  saveProfile(profileName: string, profileContent: Content, options?: { openOnSave?: boolean }) {
    profileName = profileName + '.yaml';
    const currentProfile = this.profiles.find(profile => profile.fileName === profileName);
    if (currentProfile) {
      profileContent = { ...currentProfile.content, ...profileContent };
    }

    const yamlAspects = profileContent.Aspects ? convertToYaml({ Aspects: profileContent.Aspects }, 2) : '';
    const yamlAffixes = profileContent.Affixes ? convertToYaml({ Affixes: profileContent.Affixes }, 5) : '';
    const yamlUniques = profileContent.Uniques ? convertToYaml({ Uniques: profileContent.Uniques }, 3) : '';
    // console.log('yamlAspects\n', yamlAspects + yamlAffixes + yamlUniques);
    const yamlString = yamlAspects + yamlAffixes + yamlUniques;

    this.electronService.saveProfile(profileName, yamlString).then(() => {
      this.log.info(`Saved profile`, { data: profileName, toast: 'success' });
      this._profiles.next(this.profiles.map(profile => profile.fileName === profileName ? { ...profile, content: profileContent } : profile));
      if (options?.openOnSave) {
        return this.electronService.openProfile(profileName).catch(error => {
          this.log.error(`Error opening profile`, { data: error, toast: 'error' });
        });
      }
    }).catch(error => {
      this.log.error(`Error saving profile`, { data: error, toast: 'error' });
    });
  }

  private updateProfileSettings(oldProfileName: string, newProfileName?: string) {
    if (oldProfileName != null && this._settings.value && this._settings.value.general.profiles.includes(oldProfileName)) {
      let profilesArr = this._settings.value.general.profiles.split(',');
      if (newProfileName) {
        profilesArr = profilesArr.map((profile, index) => {
          if (profile === oldProfileName) {
            return profilesArr[index] = newProfileName;
          }
          return profile;
        })
      } else {
        profilesArr = profilesArr.filter(profile => profile !== oldProfileName);
      }
      this._settings.value.general.profiles = profilesArr.join(',');
      this.saveSettings(this._settings.value);
    }
  }

  saveProfileName(oldName: string, newName: string, options?: { openOnSave?: boolean }) {
    return this.electronService.saveProfileName(oldName, newName).then(() => {
      this.log.info(`Profile name saved`, { data: { oldName, newName }, toast: 'success' });
      this.readProfiles();
      this.updateProfileSettings(oldName, newName);

      if (options?.openOnSave) {
        return this.electronService.openProfile(newName  + '.yaml').catch(error => {
          this.log.error(`Error opening profile`, { data: error, toast: 'error' });
        });
      }
    }).catch((error) =>{
      this.log.error(`Error saving profile name:`, { data: error, toast: 'error' });
    });
  }

  deleteProfile(name: string) {
    this.electronService.deleteProfile(name).then(() => {
      this.log.info(`Profile deleted`, { data: name, toast: 'success' });
      this.readProfiles();
      this.updateProfileSettings(name)
    }).catch(error => {
      this.log.error(`Error deleting profile`, { data: error, toast: 'error' });
    });
  }

  launchD4LF() {
    this.electronService.launchD4LF().then(() => {
      this.log.info(`D4LF launched`, { toast: 'success' });
    }).catch(error => {
      this.log.error(`Error launching D4LF`, { data: error, toast: 'error' });
    })
  }

  get profiles(): Profile[] {
    return this._profiles.value;
  }
}


function convertToYaml(obj: any, flowLevel = 2) {
  const options = {
    flowLevel: flowLevel, // Might need to play around with this
  };
  return yaml.dump(obj, options);
}
