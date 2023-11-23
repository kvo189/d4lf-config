import { ChangeDetectionStrategy, Component, type OnInit } from '@angular/core';

@Component({
  selector: 'app-profiles-editor',
  templateUrl: './profiles-editor.component.html',
  styleUrls: ['./profiles-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilesEditorComponent implements OnInit {

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit(): void { }

}
