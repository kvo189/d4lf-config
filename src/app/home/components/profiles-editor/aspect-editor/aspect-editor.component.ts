import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Aspect } from '../../../../../interfaces/Profile';

@Component({
  selector: 'app-aspect-editor',
  templateUrl: './aspect-editor.component.html',
  styleUrls: ['./aspect-editor.component.scss'],
})
export class AspectEditorComponent implements OnChanges {
  aspectForm = this.fb.group({
    aspects: this.fb.array([])
  });

  @Output() save = new EventEmitter<Aspect[]>();
  @Input({ required: true }) aspects!: Aspect[] | null;

  private initialAspects: Aspect[] = []; // Store the initial state of the aspects

  constructor(private fb: FormBuilder) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.aspects && this.aspects) {
      this.initialAspects = JSON.parse(JSON.stringify(this.aspects)); // Deep copy
      this.loadAspects();
    }
  }

  get aspectsFormArray(): FormArray {
    return this.aspectForm.get('aspects') as FormArray;
  }

  private loadAspects() {
    // Clear the form array before loading new aspects
    this.aspectsFormArray.clear();
    this.aspectsFormArray.markAsPristine();

    // Load new aspects
    this.aspects?.forEach(aspect => {
      this.aspectsFormArray.push(this.createAspectFormGroup(aspect));
    });
  }

  private createAspectFormGroup(aspect: Aspect): FormGroup<{
    name: FormControl<string | null>;
    threshold: FormControl<number | null | undefined>;
    condition: FormControl<string | null>;
  }> {
    return this.fb.group({
      name: [aspect[0] || ''],
      threshold: [aspect[1] || null || undefined],
      condition: [aspect[2] || '']
    });
  }

  onSave() {
    const aspectFormVal = this.aspectForm.value.aspects;
    if (!aspectFormVal) return;
    const aspects = aspectFormVal.filter((aVal: any) => {
      return aVal.name
    }).map((aspect: any) => {
      console.log(aspect.name, aspect.threshold, aspect.condition)
      if (aspect.name && aspect.threshold && aspect.condition) {
        return [aspect.name, aspect.threshold, aspect.condition] as Aspect;
      } else if (aspect.name && aspect.threshold) {
        return [aspect.name, aspect.threshold] as Aspect;
      } else {
        return [aspect.name] as Aspect;
      }
    })
    console.log('aspectFormVal', aspectFormVal, 'aspects', aspects);
    this.save.emit(aspects);
  }

  onCancel() {
    this.loadAspects();
  }

  removeAspect(index: number) {
    this.aspectForm.markAsDirty();
    this.aspectsFormArray.removeAt(index);
  }

  addAspect() {
    this.aspectForm.markAsDirty();
    this.aspectsFormArray.push(this.createAspectFormGroup(['']));
  }
}
