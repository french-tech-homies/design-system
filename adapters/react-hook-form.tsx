"use client";

/**
 * Optional adapter: kit form controls bound to react-hook-form.
 *
 * Each `Form*` wraps a kit control in a `Controller`, maps the field state
 * onto the control's React Aria props (`value`/`onChange`/`onBlur`,
 * `isInvalid`, `errorMessage`) and lets every other prop through. The kit
 * itself never imports react-hook-form — delete this file if you don't use it.
 *
 *   const form = useForm<Values>({ resolver: zodResolver(schema) });
 *   <FormTextField control={form.control} name="displayName" label="Name" />
 *   <FormNumberField control={form.control} name="price" label="Price"
 *     formatOptions={{ style: "currency", currency: "EUR" }} />
 *   <FormPhoneField control={form.control} name="phone" label="Phone" defaultCountry="FR" />
 *   <FormImageField control={form.control} name="image" label="Photo" maxSize={2_000_000} />
 *   <FormSelect control={form.control} name="tableId" label="Table" items={tables}>
 *     {(t) => <SelectItem id={t.id} label={t.name} />}
 *   </FormSelect>
 *   <FormCheckboxGroup control={form.control} name="productIds" label="Products">
 *     <Checkbox value="p1">Burger</Checkbox>
 *   </FormCheckboxGroup>
 *   <FormChipGroup control={form.control} name="days" label="Days">
 *     <Chip id="mon" variant="filter">Mon</Chip>
 *   </FormChipGroup>
 *   <FormComboBox control={form.control} name="categoryIds" selectionMode="multiple"
 *     label="Categories" items={categories}>
 *     {(c) => <ComboBoxItem id={c.id} label={c.name} />}
 *   </FormComboBox>
 */

import type { Key } from "react-aria-components";
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import {
  Checkbox,
  CheckboxGroup,
  type CheckboxGroupProps,
  type CheckboxProps,
} from "../components/Checkbox";
import { ChipGroup, type ChipGroupProps } from "../components/Chip";
import { ComboBox, type ComboBoxProps } from "../components/ComboBox";
import { NumberField, type NumberFieldProps } from "../components/NumberField";
import { ImageField, type ImageFieldProps } from "../components/ImageField";
import { PhoneField, type PhoneFieldProps } from "../components/PhoneField";
import { RadioGroup, type RadioGroupProps } from "../components/Radio";
import { Select, type SelectProps } from "../components/Select";
import { Switch, type SwitchProps } from "../components/Switch";
import { TextField, type TextFieldProps } from "../components/TextField";

type Bound<TValues extends FieldValues> = {
  control: Control<TValues>;
  name: FieldPath<TValues>;
};

export function FormTextField<TValues extends FieldValues>({
  control,
  name,
  ...props
}: Bound<TValues> &
  Omit<TextFieldProps, "value" | "onChange" | "onBlur" | "name">) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <TextField
          {...props}
          name={field.name}
          value={field.value ?? ""}
          onChange={field.onChange}
          onBlur={field.onBlur}
          isInvalid={fieldState.invalid}
          errorMessage={fieldState.error?.message}
        />
      )}
    />
  );
}

/**
 * Number field. The form value is a `number`, or `undefined` while the field
 * is empty (React Aria's `NaN` never reaches the form), so `z.number()`
 * reads as required and `z.number().optional()` as optional.
 */
export function FormNumberField<TValues extends FieldValues>({
  control,
  name,
  ...props
}: Bound<TValues> &
  Omit<NumberFieldProps, "value" | "onChange" | "onBlur" | "name">) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <NumberField
          {...props}
          name={field.name}
          value={typeof field.value === "number" ? field.value : NaN}
          onChange={(value) =>
            field.onChange(Number.isNaN(value) ? undefined : value)
          }
          onBlur={field.onBlur}
          isInvalid={fieldState.invalid}
          errorMessage={fieldState.error?.message}
        />
      )}
    />
  );
}

/**
 * Phone field. The form value is the E.164 string (`"+33612345678"`), or
 * `undefined` once the field is emptied — so a bare `z.string()` still
 * rejects an empty phone; use `.optional()` for optional ones.
 */
export function FormPhoneField<TValues extends FieldValues>({
  control,
  name,
  ...props
}: Bound<TValues> &
  Omit<PhoneFieldProps, "value" | "onChange" | "onBlur" | "name">) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <PhoneField
          {...props}
          name={field.name}
          value={typeof field.value === "string" ? field.value : ""}
          onChange={(value) => field.onChange(value)}
          onBlur={field.onBlur}
          isInvalid={fieldState.invalid}
          errorMessage={fieldState.error?.message}
        />
      )}
    />
  );
}

/**
 * Image upload. The form value is the image as a data URL (or the stored
 * image's URL), or `undefined` once removed.
 */
export function FormImageField<TValues extends FieldValues>({
  control,
  name,
  ...props
}: Bound<TValues> & Omit<ImageFieldProps, "value" | "onChange">) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <ImageField
          {...props}
          value={typeof field.value === "string" ? field.value : ""}
          onChange={(value) => field.onChange(value)}
          isInvalid={fieldState.invalid}
          errorMessage={fieldState.error?.message}
        />
      )}
    />
  );
}

export function FormCheckbox<TValues extends FieldValues>({
  control,
  name,
  ...props
}: Bound<TValues> &
  Omit<CheckboxProps, "isSelected" | "onChange" | "onBlur" | "name">) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Checkbox
          {...props}
          name={field.name}
          isSelected={!!field.value}
          onChange={field.onChange}
          onBlur={field.onBlur}
          isInvalid={fieldState.invalid}
        />
      )}
    />
  );
}

/** Checkbox set. The field holds an array of the selected checkbox values. */
export function FormCheckboxGroup<TValues extends FieldValues>({
  control,
  name,
  ...props
}: Bound<TValues> &
  Omit<CheckboxGroupProps, "value" | "onChange" | "onBlur" | "name">) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <CheckboxGroup
          {...props}
          name={field.name}
          value={Array.isArray(field.value) ? field.value : []}
          onChange={field.onChange}
          onBlur={field.onBlur}
          isInvalid={fieldState.invalid}
          errorMessage={fieldState.error?.message}
        />
      )}
    />
  );
}

export function FormSwitch<TValues extends FieldValues>({
  control,
  name,
  ...props
}: Bound<TValues> &
  Omit<SwitchProps, "isSelected" | "onChange" | "onBlur" | "name">) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Switch
          {...props}
          name={field.name}
          isSelected={!!field.value}
          onChange={field.onChange}
          onBlur={field.onBlur}
        />
      )}
    />
  );
}

export function FormRadioGroup<TValues extends FieldValues>({
  control,
  name,
  ...props
}: Bound<TValues> &
  Omit<RadioGroupProps, "value" | "onChange" | "onBlur" | "name">) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <RadioGroup
          {...props}
          name={field.name}
          value={field.value ?? null}
          onChange={field.onChange}
          onBlur={field.onBlur}
          isInvalid={fieldState.invalid}
          errorMessage={fieldState.error?.message}
        />
      )}
    />
  );
}

export function FormSelect<TValues extends FieldValues, T extends object>({
  control,
  name,
  ...props
}: Bound<TValues> &
  Omit<
    SelectProps<T>,
    "selectedKey" | "onSelectionChange" | "onBlur" | "name"
  >) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Select<T>
          {...props}
          name={field.name}
          selectedKey={field.value ?? null}
          onSelectionChange={(key) => field.onChange(key)}
          onBlur={field.onBlur}
          isInvalid={fieldState.invalid}
          errorMessage={fieldState.error?.message}
        />
      )}
    />
  );
}

/**
 * Filter chip set. The field holds an array of keys for
 * `selectionMode="multiple"` (the default) and a single key or `null` for
 * `"single"`.
 */
export function FormChipGroup<TValues extends FieldValues>({
  control,
  name,
  selectionMode = "multiple",
  ...props
}: Bound<TValues> &
  Omit<ChipGroupProps, "selectedKeys" | "onSelectionChange" | "name">) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <ChipGroup
          {...props}
          selectionMode={selectionMode}
          selectedKeys={toKeys(field.value)}
          onSelectionChange={(keys) =>
            field.onChange(
              selectionMode === "single"
                ? (Array.from(keys)[0] ?? null)
                : Array.from(keys),
            )
          }
          onBlur={field.onBlur}
          isInvalid={fieldState.invalid}
          errorMessage={fieldState.error?.message}
        />
      )}
    />
  );
}

function toKeys(value: unknown): Iterable<Key> {
  if (Array.isArray(value)) return value as Key[];
  if (value === null || value === undefined) return [];
  return [value as Key];
}

/**
 * Autocomplete / chips field. The field holds one key (or `null`) for
 * `selectionMode="single"` and an array of keys for `"multiple"`.
 */
export function FormComboBox<
  TValues extends FieldValues,
  T extends object,
  M extends "single" | "multiple" = "single",
>({
  control,
  name,
  ...props
}: Bound<TValues> &
  Omit<ComboBoxProps<T, M>, "value" | "onChange" | "onBlur" | "name">) {
  const multiple = props.selectionMode === "multiple";
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <ComboBox<T, M>
          {...props}
          name={field.name}
          value={
            (multiple
              ? Array.isArray(field.value)
                ? field.value
                : []
              : (field.value ?? null)) as ComboBoxProps<T, M>["value"]
          }
          onChange={(value) => field.onChange(value)}
          onBlur={field.onBlur}
          isInvalid={fieldState.invalid}
          errorMessage={fieldState.error?.message}
        />
      )}
    />
  );
}
