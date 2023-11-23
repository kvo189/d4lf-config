import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from '../shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { ProfilesEditorComponent } from './components/profiles-editor/profiles-editor.component';
import { ShellComponent } from "../shared/components/shell/shell/shell.component";
import { SettingsComponent } from './components/settings/settings.component';

@NgModule({
    declarations: [
        SettingsComponent,
        ProfilesEditorComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        HomeRoutingModule,
        NgbModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        ToastrModule.forRoot(),
        NgSelectModule,
        FormsModule,
        ShellComponent
    ]
})
export class HomeModule { }
