import { ToastrService } from 'ngx-toastr';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface LogEntry {
  timestamp: string | Date;
  message: string;
  level: 'INFO' | 'DEBUG' | 'ERROR';
  data?: any;
}

interface LogOptions {
  toast?: 'success' | 'info' | 'warning' | 'error';
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class LogService {
  // private logs: LogEntry[] = [];
  private _logs = new BehaviorSubject<LogEntry[]>([]);
  readonly logs$ = this._logs.asObservable();

  constructor(
    private toast: ToastrService
  ) { }

  private addLog(message: string, level: 'INFO' | 'DEBUG' | 'ERROR', options? : LogOptions): void {
    let dataString;
    let data = options?.data;

    if (data instanceof Error) {
      data = data.message;
    }

    if (data !== undefined) {
      dataString = JSON.stringify(data, null, 2);
    }

    if (options?.toast) {
      switch (options.toast) {
        case 'success':
          this.toast.success(message);
          break;
        case 'info':
          this.toast.info(message);
          break;
        case 'warning':
          this.toast.warning(message);
          break;
        case 'error':
          this.toast.error(message);
          break;
        default:
          this.toast.info(message);
          break;
      }
    }

    this._logs.next([...this._logs.value, { timestamp: new Date(), message: message, level, data: dataString}]);
  }

  info(message: string, options? : LogOptions): void {
    console.info(message, options?.data);
    this.addLog(message, 'INFO', options);

  }

  debug(message: string, options? : LogOptions): void {
    console.debug(message, options?.data);
    this.addLog(message, 'DEBUG', options);
  }

  error(message: string, options? : LogOptions): void {
    console.error(message, options?.data);
    this.addLog(message, 'ERROR', options);
  }

  clearLogs(): void {
    this._logs.next([]);
  }

}

