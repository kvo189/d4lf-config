import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Settings } from '../../../../interfaces/Settings';
import { ElectronService } from '../../../core/services';
import { FileService } from '../../../core/services/file/file.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();
  profileFiles: { id: string, name: string }[] = [];
  savedSettings: Settings | null = null;
  settingsForm = this.fb.group({
    general: this.fb.group({
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      profiles: [[]] as string[][], // Initialize as a FormArray ,
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

  readonly tooltip = {
    profiles: 'Which filter profiles should be run. All .yaml files with "Aspects" and "Affixes" sections will be used from (E.g. C:/Users/USERNAME/.d4lf/profiles/*.yaml)',
    visionOnStart: 'Whether to run vision mode on startup or not',
    checkChestTabs: 'How many tabs should be checked for items in chest. Note: All 5 Tabs must be unlocked!',
    hiddenTransparency: 'Transparency of the overlay when not hovering it (has a 3 second delay after hovering). The "shown" transparncy is 0.94',
    localPrefs: 'In case you get a warning about the LocalPref file not being found, you can either ignore the warning, or specify the correct path for your system here.'
  }


  @ViewChild('confirmResetModal', { static: false }) private confirmResetModal: NgbModal | undefined;

  constructor(
    private router: Router,
    private electronService: ElectronService,
    private fb: FormBuilder,
    private file: FileService,
    private modalService: NgbModal
  ) { }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    // this.file.readProfiles();
    // this.file.readConfigFile();
    this.file.settings$.pipe(takeUntil(this.destroy$)).subscribe(settings => {
      if (settings) {
        this.savedSettings = settings;
        this.settingsForm.reset(this.formSettings(settings));
      }
    });
    this.file.profileNames$.pipe(takeUntil(this.destroy$)).subscribe(files => {
      this.profileFiles = files.map(file => {
        const fileWithoutExt = file.replace(/\.y(a)?ml$/, '');
        return { id: fileWithoutExt, name: fileWithoutExt };
      });
    });
  }

  saveSettings() {
    const settings = this.fileSettings(this.settingsForm.value) as Settings;
    this.file.saveSettings(settings);
  }

  cancelChanges() {
    if (this.savedSettings) {
      this.settingsForm.reset(this.formSettings(this.savedSettings));
    }
  }

  resetSettings() {
    this.modalService.open(this.confirmResetModal);
    // this.file.promptCreateConfigFile('Are you sure you want to load the default settings?');
  }

  confirmReset() {
    this.file.createDefaultConfigFile();
  }

  fileSettings(settings: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
      ...settings,
      general: {
        ...settings.general,
        profiles: settings.general.profiles.length ? settings.general.profiles.join(',') : ''
      }
    }
  }

  formSettings(settings: Settings) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
      ...settings,
      general: {
        ...settings.general,
        profiles: settings.general.profiles ? settings.general.profiles.split(',') : []
      }
    }
  }
}
