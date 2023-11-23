import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { LogComponent } from './components/log/log.component';

@NgModule({
  declarations: [],
  providers: [DatePipe],
  imports: [
    CommonModule,
    LogComponent
  ]
})
export class CoreModule { }
