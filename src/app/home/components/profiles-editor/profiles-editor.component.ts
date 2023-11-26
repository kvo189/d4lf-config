import { ToastrService } from 'ngx-toastr';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, ViewChild, type OnInit } from '@angular/core';
import { log } from 'console';
import { BehaviorSubject, combineLatest, map, Observable, shareReplay, Subject, switchMap, take, takeUntil, tap } from 'rxjs';
import { Aspect, ItemGroup, Profile } from '../../../../interfaces/Profile';
import { FileService } from '../../../core/services/file/file.service';
import { LogService } from '../../../core/services/log/log.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-profiles-editor',
  templateUrl: './profiles-editor.component.html',
  styleUrls: ['./profiles-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilesEditorComponent implements OnInit, OnDestroy {

  profileNames$ = this.file.profileNames$;
  profiles$ = this.file.profiles$;
  openFileOnSave = false;

  private destroy$ = new Subject<void>();
  private _selectedProfile = new BehaviorSubject<string | undefined>(undefined);
  readonly selectedProfile$ = this._selectedProfile.asObservable().pipe(
    shareReplay(1),
  );
  selectedProfile: string | undefined = undefined;

  aspects$: Observable<Aspect[]> = combineLatest([
    this.selectedProfile$,
    this.profiles$,
  ]).pipe(
    map(([profileName, profiles]) => {
      if (!profileName) {
        return [] as Aspect[]
      }
      return profiles.find(p => p.fileName === profileName + '.yaml')?.content?.Aspects || [];
    }),
    takeUntil(this.destroy$),
  );

  itemGroups$: Observable<ItemGroup[]> = combineLatest([
    this.selectedProfile$,
    this.profiles$,
  ]).pipe(
    map(([profileName, profiles]) => {
      if (!profileName) {
        return [] as ItemGroup[];
      }
      return profiles.find(p => p.fileName === profileName + '.yaml')?.content?.Affixes || [];
    }),
    takeUntil(this.destroy$),
  )

  activeTabId: 'aspects' | 'affixes' | 'uniques' = 'aspects';
  isEdittingProfile = false;
  isAddingProfile = false;
  editableProfileName = '';

  @ViewChild('profileNameInput') profileNameInput: ElementRef<HTMLInputElement> | undefined;
  @ViewChild('confirmDeleteModal', { static: false }) private confirmDeleteModal: NgbModal | undefined;

  constructor(
    private file: FileService,
    private toast: ToastrService,
    private log: LogService,
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal
  ) {

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit(): void {
    this.selectedProfile$.pipe(takeUntil(this.destroy$)).subscribe((profile) => {
      this.selectedProfile = profile;
    });
  }

  onChangeSelectedProfile(eventTarget: EventTarget) {
    const selectedProfile = (eventTarget as HTMLSelectElement).value;
    this._selectedProfile.next(selectedProfile);
  }

  onAspectsSave(aspects: Aspect[]) {
    const selectedProfile = this._selectedProfile.value;
    if (!selectedProfile) {
      this.log.error('No profile selected');
      return;
    }
    this.file.saveProfile(selectedProfile, { Aspects: aspects }, { openOnSave: this.openFileOnSave });
  }

  onAffixesSave(itemGroups: ItemGroup[]) {
    const selectedProfile = this._selectedProfile.value;
    if (!selectedProfile) {
      this.log.error('No profile selected');
      return;
    }
    this.file.saveProfile(selectedProfile, { Affixes: itemGroups }, { openOnSave: this.openFileOnSave });
  }

  newProfile() {
    this.isAddingProfile = true;
    this.editableProfileName = '';
    setTimeout(() => this.profileNameInput?.nativeElement.focus());
  }

  editProfile() {
    this.isEdittingProfile = true;
    this.editableProfileName = this.selectedProfile ?? '';
    setTimeout(() => this.profileNameInput?.nativeElement.focus());
  }

  saveNewProfile() {
    this.isAddingProfile = false;
    if (!this.editableProfileName) {
      this.log.error('No profile name entered');
      return;
    }
    this.saveProfileNameChange('', this.editableProfileName);
  }

  saveEditProfile() {
    this.isEdittingProfile = false;
    if (!this.selectedProfile) {
      this.log.error('No profile selected');
      return;
    }
    if (!this.editableProfileName) {
      this.log.error('No profile name entered');
      return;
    }
    this.isEdittingProfile = false;
    this.saveProfileNameChange(this.selectedProfile, this.editableProfileName);
  }

  cancelEdit() {
    this.isEdittingProfile = false;
    this.isAddingProfile = false;
    this.editableProfileName = '';
  }

  saveProfileNameChange(oldName: string, newName: string) {
    console.log('changing name...', oldName, newName)
    this.file.saveProfileName(oldName, newName, { openOnSave: this.openFileOnSave }).then(() => {
      this._selectedProfile.next(newName);
    }).catch((error) => {
      throw error
    })
  }

  deleteProfile() {
    if (!(this.selectedProfile)) return;
    this.onModalOpen(this.confirmDeleteModal)
  }

  onSelectedProfileOutsideClick() {
    console.log('onSelectedProfileOutsideClick')
    this.isAddingProfile = false;
    this.isEdittingProfile = false;
  }

  onModalOpen(content: any) {
    this.modalService.open(content).result.then(
      (result: string) => {
        console.log(`Closed with: ${result}`);
        if (!this.selectedProfile) {
          this.log.error('No profile selected', { toast: 'error' });
          return;
        }
        this.file.deleteProfile(this.selectedProfile);
        this.profileNames$.pipe(take(1)).subscribe(
          (profileNames) => {
            const newNames = profileNames.filter((currentProfile) => currentProfile !== this.selectedProfile);
            console.log('profiles left', newNames)
            if (newNames.length > 0) {
              this._selectedProfile.next(newNames[0]);
            } else {
              this._selectedProfile.next(undefined);
            }
          }
        );
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (reason: string) => {
      },
    )
  }
}
