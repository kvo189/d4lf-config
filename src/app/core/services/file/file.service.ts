import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, shareReplay, Subject } from 'rxjs';
import { DEFAULT_SETTINGS, Settings } from '../../../../interfaces/Settings';
import { ElectronService } from '../electron/electron.service';
import { LogService } from '../log/log.service';
import * as ini from 'ini';
import { Content, Profile } from '../../../../interfaces/Profile';
import * as yaml from 'js-yaml';
import { parse, stringify } from 'yaml'

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

  private _saveProfileEvent = new Subject<{ event: 'success' | 'error', fileName: string }>();
  saveProfileEvent$ = this._saveProfileEvent.asObservable();

  constructor(
    private electronService: ElectronService,
    private toast: ToastrService,
    private log: LogService
  ) {
    // this.getProfileFiles();
  }


  readConfigFile() {
    this.electronService.readConfigFile().then(({ path, data }) => {
      this.log.info(`Existing settings found at ${path}`, { data });
      // // Check if profiles is a string and transform it into an array
      // if (data && data.general && typeof data.general.profiles === 'string') {
      //   data.general.profiles = data.general.profiles.split(',');
      // }
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
    const iniData = ini.stringify(DEFAULT_SETTINGS);
    this.electronService.writeConfigFile(iniData).then(() => {
      this.log.info('Default config file created', { toast: 'success' });
      this._settings.next(DEFAULT_SETTINGS);
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
      const profileFiles: string[] = profiles.filter(profile => profile.fileName && profile.content).map((profile: Profile) => {
        return profile.fileName;
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
