import { ElectronService } from './../core/services/electron/electron.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DEFAULT_SETTINGS, Settings } from '../../interfaces/Settings';
import * as ini from 'ini';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  profileFiles: string[] = [];
  selectedProfile = '';

  constructor(
    private router: Router,
    private electronService: ElectronService,
    private fb: FormBuilder
  ) { }

  settingsForm = this.fb.group({
    general: this.fb.group({
      profiles: [''],
      run_vision_mode_on_startup: [''],
      check_chest_tabs: [''],
      hidden_transparency: [''],
      local_prefs_path: ['']
    }),
    char: this.fb.group({
      inventory: [''],
      skill4: [''],
      skill3: [''],
      health_pot: ['']
    }),
    advanced_options: this.fb.group({
      run_scripts: [''],
      run_filter: [''],
      exit_key: [''],
      log_lvl: [''],
      scripts: ['']
    })
  });

  ngOnInit(): void {
    this.readConfigFile();
    this.getProfileFiles();
    // this.loadDefaultSettings();
  }

  loadDefaultSettings() {
    // Load default settings
    this.settingsForm.patchValue(DEFAULT_SETTINGS);
  }

  saveSettings() {
    const settings = this.settingsForm.value;
    const iniData = ini.stringify(settings);

    console.log('Saved Settings:\n' + iniData);

    this.electronService.writeConfigFile(iniData).then(() => {
      console.log('writeConfigFile -> success');
    }).catch((error) => {
      console.error('writeConfigFile -> error', error);
    });
  }

  cancelChanges() {
    this.loadDefaultSettings();
  }

  resetSettings() {
    this.settingsForm.reset();
  }

  getProfileFiles() {
    this.electronService.getProfileFiles().then(files => {
      console.log('Profile Files:', files);
      // Use 'files' to populate the available profiles
      this.profileFiles = files;
      // Optionally set a default selected profile
      if (files.length > 0) {
        this.selectedProfile = files[0];
      }
    }).catch(error => {
      console.error('Error getting profile files:', error);
    });
  }

  readConfigFile() {
    this.electronService.readConfigFile().then((data) => {
      console.log(this.settingsForm)
      console.log('readConfigFile data', data);
      this.settingsForm.patchValue(data as Settings);
    }).catch((error) => {
      console.error('readConfigFile error', error);
    });
  }

}
