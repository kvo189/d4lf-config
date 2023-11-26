import { ToastrService } from 'ngx-toastr';
import { ChangeDetectionStrategy, Component, OnDestroy, type OnInit } from '@angular/core';
import { log } from 'console';
import { BehaviorSubject, combineLatest, map, Observable, shareReplay, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { Aspect, ItemGroup, Profile } from '../../../../interfaces/Profile';
import { FileService } from '../../../core/services/file/file.service';
import { LogService } from '../../../core/services/log/log.service';

@Component({
  selector: 'app-profiles-editor',
  templateUrl: './profiles-editor.component.html',
  styleUrls: ['./profiles-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilesEditorComponent implements OnInit, OnDestroy {

  profileNames$ = this.file.profileNames$.pipe(tap((profileNames) => {
    if (profileNames.length > 0 && !this._selectedProfile.value) {
      console.log('emitting profile names', profileNames)
      this._selectedProfile.next(profileNames[0]);
    }
  }));

  profiles$ = this.file.profiles$;
  openFileOnSave = false;

  private destroy$ = new Subject<void>();
  private _selectedProfile = new BehaviorSubject<string | undefined>(undefined);
  selectedProfile$ = this._selectedProfile.asObservable().pipe(
    tap((profile) => console.log('new profile emitted', profile)),
    shareReplay(1),
  );
  aspects$: Observable<Aspect[]> = combineLatest([
    this.selectedProfile$,
    this.profiles$,
  ]).pipe(
    map(([profileName, profiles]) => {
      if (!profileName) {
        return [] as Aspect[]
      }
      return profiles.find(p => p.fileName === profileName)?.content?.Aspects || [];
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
      return profiles.find(p => p.fileName === profileName)?.content?.Affixes || [];
    }),
    tap(itemGroups => {
      itemGroups.forEach(itemGroup => {
        Object.entries(itemGroup).forEach(([key, item]) => {
          console.log('item', key, item)
        })
      })
    }),
    takeUntil(this.destroy$),
  )


  activeTabId: 'aspects' | 'affixes' | 'uniques' = 'aspects' ;

  constructor(
    private file: FileService,
    private toast: ToastrService,
    private log: LogService
  ) {

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit(): void {
    this.file.readProfiles();
    this.aspects$.subscribe((aspects: Aspect[]) => {
      console.log('aspects', aspects);
    })
  }

  onChangeSelectedProfile(eventTarget: EventTarget) {
    const selectedProfile = (eventTarget as HTMLSelectElement).value;
    console.log('selectedProfile', selectedProfile);
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

}
