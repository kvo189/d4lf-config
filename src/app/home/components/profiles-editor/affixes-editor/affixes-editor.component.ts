import { CommonModule } from '@angular/common';
import { Component, type OnInit } from '@angular/core';

@Component({
  selector: 'app-affixes-editor',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './affixes-editor.component.html',
  styleUrls: ['./affixes-editor.component.scss'],
})
export class AffixesEditorComponent implements OnInit {

  ngOnInit(): void { }

}
