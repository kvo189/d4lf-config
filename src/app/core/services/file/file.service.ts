import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject } from 'rxjs';
import { DEFAULT_SETTINGS, Settings } from '../../../../interfaces/Settings';
import { ElectronService } from '../electron/electron.service';
import { LogService } from '../log/log.service';
import * as ini from 'ini';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  private _profileFiles: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  profileFiles$ = this._profileFiles.asObservable();

  private _selectedFile: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  selectedFile$ = this._profileFiles.asObservable();

  private _settings: BehaviorSubject<Settings | undefined> = new BehaviorSubject<Settings | undefined>(undefined);
  settings$ = this._settings.asObservable();

  constructor(
    private electronService: ElectronService,
    private toast: ToastrService,
    private log: LogService
  ) { }


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

  getProfileFiles() {
    this.electronService.getProfileFiles().then(files => {
      // Use 'files' to populate the available profiles
      this._profileFiles.next(files);
      // Optionally set a default selected profile
      if (files.length > 0) {
        // this.selectedProfile = files[0];
      }
      this.log.info(`Profiles found`, { data: files });
    }).catch(error => {
      this.log.error(`Error getting profile files`, { data: error });
    });
  }
}
