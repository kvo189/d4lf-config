import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LogComponent } from "../../log/log.component";
import { FileService } from '../../../services/file/file.service';

@Component({
  selector: 'app-navigation',
  standalone: true,
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    LogComponent,
    RouterModule
  ]
})
export class NavigationComponent {
  constructor(
    private fileService: FileService
  ) {
  }

  launchD4LF() {
    this.fileService.launchD4LF();
  }
}
