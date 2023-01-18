import { FieldSchema, StructureSchema } from '@ephox/boulder';
import { Arr, Fun, Optional, Result } from '@ephox/katamari';

import * as ComponentSchema from '../../core/ComponentSchema';
import { DialogToggleMenuItem, dialogToggleMenuItemSchema, DialogToggleMenuItemSpec } from './ToggleMenuItem';

export type DialogHeaderMenuButtonItemSpec = DialogToggleMenuItemSpec;
export type DialogHeaderToggleMenuItem = DialogToggleMenuItem;

const dialogHeaderButtonTypes = [ 'submit', 'cancel', 'fullscreen', 'custom' ] as const;
type DialogHeaderButtonTypes = typeof dialogHeaderButtonTypes[number];

const buttonType = [ 'primary', 'secondary' ] as const;
type ButtonType = typeof buttonType[number];

const align = [ 'start', 'end' ] as const;
type Align = typeof align[number];

const ArrClone = <T>(arr: readonly T[]): T[] => Arr.map(arr, Fun.identity);

// Note: This interface doesn't extend from a common button interface as this is only a configuration that specifies a button, but it's not by itself a button.
interface BaseDialogHeaderButtonSpec {
  name?: string;
  align?: Align;
  /** @deprecated use `buttonType: "primary"` instead */
  primary?: boolean;
  enabled?: boolean;
  icon?: string;
  buttonType?: ButtonType;
}

export interface DialogHeaderNormalButtonSpec extends BaseDialogHeaderButtonSpec {
  type: DialogHeaderButtonTypes;
  text: string;
}

export interface DialogHeaderMenuButtonSpec extends BaseDialogHeaderButtonSpec {
  type: 'menu';
  text?: string;
  tooltip?: string;
  icon?: string;
  items: DialogHeaderMenuButtonItemSpec[];
}

export type DialogHeaderButtonSpec = DialogHeaderNormalButtonSpec | DialogHeaderMenuButtonSpec;

interface BaseDialogHeaderButton {
  name: string;
  align: Align;
  /** @deprecated use `buttonType: "primary"` instead */
  primary: boolean;
  enabled: boolean;
  icon: Optional<string>;
  buttonType: Optional<ButtonType>;
}

export interface DialogHeaderNormalButton extends BaseDialogHeaderButton {
  type: DialogHeaderButtonTypes;
  text: string;
}

export interface DialogHeaderMenuButton extends BaseDialogHeaderButton {
  type: 'menu';
  text: Optional<string>;
  tooltip: Optional<string>;
  icon: Optional<string>;
  items: DialogHeaderToggleMenuItem[];
}

export type DialogHeaderButton = DialogHeaderNormalButton | DialogHeaderMenuButton;

const baseHeaderButtonFields = [
  ComponentSchema.generatedName('button'),
  ComponentSchema.optionalIcon,
  FieldSchema.defaultedStringEnum('align', 'end', ArrClone(align)),
  // this should be removed, but must live here because FieldSchema doesn't have a way to manage deprecated fields
  ComponentSchema.primary,
  ComponentSchema.enabled,
  // this should be defaulted to `secondary` but the implementation needs to manage the deprecation
  FieldSchema.optionStringEnum('buttonType', ArrClone(buttonType))
];

export const dialogHeaderButtonFields = [
  ...baseHeaderButtonFields,
  ComponentSchema.text
];

const normalHeaderButtonFields = [
  FieldSchema.requiredStringEnum('type', ArrClone(dialogHeaderButtonTypes)),
  ...dialogHeaderButtonFields
];

const menuHeaderButtonFields = [
  FieldSchema.requiredStringEnum('type', [ 'menu' ]),
  ComponentSchema.optionalText,
  ComponentSchema.optionalTooltip,
  ComponentSchema.optionalIcon,
  FieldSchema.requiredArrayOf('items', dialogToggleMenuItemSchema),
  ...baseHeaderButtonFields
];

export const dialogHeaderButtonSchema = StructureSchema.choose(
  'type',
  {
    submit: normalHeaderButtonFields,
    cancel: normalHeaderButtonFields,
    custom: normalHeaderButtonFields,
    fullscreen: normalHeaderButtonFields,
    menu: menuHeaderButtonFields
  }
);

export const createDialogHeaderButton = (spec: DialogHeaderButtonSpec): Result<DialogHeaderButton, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw<DialogHeaderButton>('dialogfooterbutton', dialogHeaderButtonSchema, spec);
