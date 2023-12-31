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
import { ShellComponent } from "../shared/components/shell/shell.component";
import { SettingsComponent } from './components/settings/settings.component';
import { AspectEditorComponent } from './components/profiles-editor/aspect-editor/aspect-editor.component';
import { AffixesEditorComponent } from './components/profiles-editor/affixes-editor/affixes-editor.component';
import { UniquesEditorComponent } from './components/profiles-editor/uniques-editor/uniques-editor.component';
import { ClickOutsideDirective } from '../shared/directives/ClickOutsideDirective';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';

@NgModule({
    declarations: [
        SettingsComponent,
        ProfilesEditorComponent,
        AspectEditorComponent,
        AffixesEditorComponent,
        UniquesEditorComponent,
        ClickOutsideDirective
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
        ShellComponent,
        AutocompleteLibModule
    ]
})
export class HomeModule { }
