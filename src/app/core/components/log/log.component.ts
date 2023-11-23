import { CommonModule } from '@angular/common';
import { AfterViewChecked, ChangeDetectionStrategy, Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { LogService } from '../../services/log/log.service';

@Component({
  selector: 'app-log',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogComponent implements AfterViewChecked{
  @ViewChild('logsContainer') private logContainer?: ElementRef;
  logs = this.log.getLogs();
  isLogsShown = false;


  constructor(
    private log: LogService,
    private renderer: Renderer2
  ) {}

  ngAfterViewChecked(): void {
    this.scrollToBottom()
  }

  toggleShow() {
    this.isLogsShown = !this.isLogsShown;
  }

  private scrollToBottom(): void {
    if (!this.logContainer?.nativeElement || !this.isLogsShown) return;
    const element = this.logContainer.nativeElement;
    this.renderer.setProperty(element, 'scrollTop', element.scrollHeight);
  }
}
