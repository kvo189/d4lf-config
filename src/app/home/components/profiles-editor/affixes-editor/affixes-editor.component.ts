import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Affix, Item, ItemGroup, ItemType } from '../../../../../interfaces/Profile';
import affixesJson from '../../../../../assets/affixes.json';

interface AffixesFormValue {
  itemGroups: {
    key: string;
    item: ItemFormValue;
  }[];
}

interface ItemFormValue {
  itemType: ItemType | ItemType[];
  minPower: number;
  affixPool: AffixPoolFormValue[];
  minAffixCount: number;
}

interface AffixPoolFormValue { key: string, threshold: number | null, condition: string | null }

@Component({
  selector: 'app-affixes-editor',
  templateUrl: './affixes-editor.component.html',
  styleUrls: ['./affixes-editor.component.scss'],
})
export class AffixesEditorComponent implements OnChanges {

  @Output() save = new EventEmitter<ItemGroup[]>();
  @Input({ required: true }) itemGroups: ItemGroup[] | null = [];
  @Input({ required: true }) selectedProfile: string | undefined;

  affixesForm = this.fb.group({
    itemGroups: this.fb.array([])
  });
  selectedItemGroupIndex: number | null = null;
  itemTypesArray = Object.entries(ItemType).map(([key, value]) => ({ key, value }));

  aspectKeys: string[] = Object.keys(affixesJson);

  constructor(private fb: FormBuilder) {
    this.affixesForm = this.fb.group({
      itemGroups: this.fb.array([])
    });
  }

  ngOnChanges(): void {
    this.loadItemGroups();
  }

  get itemGroupsArray(): FormArray {
    return this.affixesForm.get('itemGroups') as FormArray;
  }

  private loadItemGroups() {
    this.affixesForm.markAsPristine();
    if (!this.itemGroups) return;
    // Clear existing FormArray
    this.itemGroupsArray.clear();
    // Populate FormArray with new data
    this.itemGroups.forEach(itemGroup => {
      this.itemGroupsArray.push(this.createItemGroupFormGroup(itemGroup));
    });
  }

  private createItemGroupFormGroup(itemGroup: ItemGroup): FormGroup {
    // Assuming each itemGroup has only one key-value pair
    const [key, item] = Object.entries(itemGroup)[0];
    return this.fb.group({
      key: key,
      item: this.createItemFormGroup(item)
    });
  }

  private createItemFormGroup(item: Item): FormGroup {

    if (isString(item.itemType)) {
      item.itemType = [item.itemType as ItemType]
    }

    return this.fb.group({
      itemType: [item.itemType],
      minPower: [item.minPower],
      affixPool: this.fb.array(item.affixPool.map(this.createAffixFormGroup)),
      minAffixCount: [item.minAffixCount]
    });
  }

  createAffixFormGroup = (affix: Affix): FormGroup => {
    return this.fb.group({
      key: [affix[0]],
      threshold: [affix[1]],
      condition: [affix[2] || '']
    });
  };

  getFormGroup(control: AbstractControl | null): FormGroup | null {
    if (!control) {
      return null; // Return null if the control doesn't exist
    }
    return control as FormGroup;
  }

  getFormArray(control: AbstractControl | null): FormArray | null {
    if (!control || !(control instanceof FormArray)) {
      return null;
    }
    return control;
  }

  selectItemGroup(index: number) {
    if (this.selectedItemGroupIndex === index) {
      this.selectedItemGroupIndex = null;
      return;
    }
    this.selectedItemGroupIndex = index;
  }

  addItemGroup() {
    const newItemGroup: ItemGroup = {
      'New item group name': {
        itemType: [],
        minPower: 725,
        affixPool: [],
        minAffixCount: 0
      }
    };
    this.itemGroupsArray.push(this.createItemGroupFormGroup(newItemGroup));
    this.affixesForm.markAsDirty();
  }

  deleteItemGroup(index: number) {
    this.itemGroupsArray.removeAt(index);
    this.affixesForm.markAsDirty();
    this.selectedItemGroupIndex = null;
  }

  addAffixToGroup() {
    const affixPool = this.getFormArray(this.selectedItemAffixControl);
    affixPool?.push(this.createAffixFormGroup(['']));
    this.affixesForm.markAsDirty();
  }

  deleteAffixFromGroup(affixIndex: number) {
    const affixPool = this.getFormArray(this.selectedItemAffixControl);
    affixPool?.removeAt(affixIndex);
    this.affixesForm.markAsDirty();
  }

  get selectedItemAffixControl(): AbstractControl | null {
    if (this.selectedItemGroupIndex === null) return null;
    const itemControl = this.itemGroupsArray.at(this.selectedItemGroupIndex).get('item')?.get('affixPool');
    if (!itemControl) return null;
    return itemControl;
  }

  onSave() {
    const formValue: AffixesFormValue = this.affixesForm.value as AffixesFormValue;
    const newItemGroups: ItemGroup[] = [];

    formValue.itemGroups?.forEach((group: { key: string, item: ItemFormValue }) => {
      newItemGroups.push({
        [group.key]: {
          itemType: group.item.itemType,
          minPower: group.item.minPower,
          minAffixCount: group.item.minAffixCount,
          affixPool: group.item.affixPool.filter((affix: AffixPoolFormValue) => {
            return affix.key
          }).map((affix: AffixPoolFormValue) => {
            if (affix.key && affix.threshold && affix.condition) {
              return [affix.key, affix.threshold, affix.condition] as Affix;
            } else if (affix.key && affix.threshold) {
              return [affix.key, affix.threshold] as Affix;
            } else {
              return [affix.key] as Affix;
            }
          }),
        }
      })
    })
    this.save.emit(newItemGroups);
  }

  onCancel() {
    this.loadItemGroups();
  }

}

function isString(x: string | ItemType[]) {
  return Object.prototype.toString.call(x) === "[object String]"
}
