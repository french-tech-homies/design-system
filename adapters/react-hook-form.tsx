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
 *
 * Validation is a resolver's (`zodResolver(schema)` above) or, with no
 * schema library, each field's own `rules`, react-hook-form's:
 *
 *   <FormTextField control={form.control} name="email" label="Email"
 *     rules={{ required: "Enter your email", pattern: { value: /@/, message: "Not an email" } }} />
 *
 * Each `Form*` field is given `validationBehavior="aria"`: the form decides
 * what is valid, so a field marked `isRequired` shows its asterisk and says
 * so, and the browser's own validation does not stop the submit before the
 * form's rules have run. Pass `validationBehavior="native"` to hand a field
 * back to the browser.
 *
 * A refused submit puts the focus in the first invalid field, as
 * react-hook-form does by default (`shouldFocusError`), and
 * `form.setFocus(name)` reaches a field: each `Form*` renders a hidden
 * marker before its control for that.
 *
 *   <FormNumberField control={form.control} name="price" label="Price"
 *     formatOptions={{ style: "currency", currency: "EUR" }} />
 *   <FormPhoneField control={form.control} name="phone" label="Phone" defaultCountry="FR" />
 *   <FormDatePicker control={form.control} name="opensOn" label="Opens on" />
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

import { type CalendarDate, parseDate } from "@internationalized/date";
import type { Key } from "react-aria-components";
import {
  Controller,
  type Control,
  type ControllerProps,
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
import { DatePicker, type DatePickerProps } from "../components/DatePicker";
import { NumberField, type NumberFieldProps } from "../components/NumberField";
import { ImageField, type ImageFieldProps } from "../components/ImageField";
import { PhoneField, type PhoneFieldProps } from "../components/PhoneField";
import { RadioGroup, type RadioGroupProps } from "../components/Radio";
import { Select, type SelectProps } from "../components/Select";
import { Switch, type SwitchProps } from "../components/Switch";
import { TextField, type TextFieldProps } from "../components/TextField";

/**
 * What react-hook-form focuses when a field is refused. The kit's controls
 * are not one element each, so the adapter hands it a hidden marker before
 * the control: focusing the field focuses the first thing in the control a
 * keyboard reaches. With it `shouldFocusError` (on by default) and
 * `form.setFocus(name)` work.
 *
 * Exported for a field of the project's own, bound with `Controller`: put
 * `<FocusAnchor fieldRef={field.ref} />` just before its control.
 */
export function FocusAnchor({ fieldRef }: { fieldRef: (instance: unknown) => void }) {
  return (
    <span
      hidden
      data-slot="form-field-anchor"
      ref={(anchor) => {
        fieldRef(
          anchor && {
            focus: () => {
              // React Aria renders a `template` before a control that holds
              // a collection (a select, a combo box): the control is after.
              let control = anchor.nextElementSibling;
              while (control?.tagName === "TEMPLATE") {
                control = control.nextElementSibling;
              }
              firstFocusable(control)?.focus();
            },
          },
        );
      }}
    />
  );
}

/**
 * The first element of a control that a keyboard reaches: not a hidden
 * native input a component keeps for the browser, not one taken out of the
 * tab order.
 */
function firstFocusable(control: Element | null): HTMLElement | undefined {
  if (!control) return undefined;
  const reached = (selector: string) =>
    [control, ...control.querySelectorAll(selector)].find(
      (el): el is HTMLElement =>
        el instanceof HTMLElement &&
        el.matches(selector) &&
        el.tabIndex >= 0 &&
        !el.matches(":disabled, [type=hidden]") &&
        !el.closest("[aria-hidden=true], [hidden]") &&
        el.getClientRects().length > 0,
    );
  // Where a control has both, the place a person types (a phone number, a
  // combo box's text) before the button beside it.
  return reached("input, textarea") ?? reached("select, button, [tabindex]");
}

type Bound<TValues extends FieldValues> = {
  control: Control<TValues>;
  name: FieldPath<TValues>;
  /** react-hook-form's own rules for this field (`required`, `minLength`,
   *  `pattern`, `validate`), for a form with no schema resolver. A rule's
   *  message is the field's error message. */
  rules?: ControllerProps<TValues, FieldPath<TValues>>["rules"];
};

export function FormTextField<TValues extends FieldValues>({
  control,
  name,
  rules,
  ...props
}: Bound<TValues> &
  Omit<TextFieldProps, "value" | "onChange" | "onBlur" | "name">) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => (
        <>
          <FocusAnchor fieldRef={field.ref} />
          <TextField
            validationBehavior="aria"
            {...props}
            name={field.name}
            value={field.value ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            isInvalid={fieldState.invalid}
            errorMessage={fieldState.error?.message}
          />
        </>
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
  rules,
  ...props
}: Bound<TValues> &
  Omit<NumberFieldProps, "value" | "onChange" | "onBlur" | "name">) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => (
        <>
          <FocusAnchor fieldRef={field.ref} />
          <NumberField
            validationBehavior="aria"
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
        </>
      )}
    />
  );
}

/** A calendar date from the form's ISO string; nothing for anything else. */
function toDate(value: unknown): CalendarDate | null {
  if (typeof value !== "string" || !value) return null;
  try {
    return parseDate(value);
  } catch {
    return null;
  }
}

/**
 * Date picker. The form value is the ISO date string (`"2026-06-15"`), the
 * form a server and `z.iso.date()` take, or `undefined` while no date is
 * picked. Every prop of the kit's `DatePicker` passes through (`layout`,
 * `minValue`, `isDateUnavailable`), given as calendar dates.
 */
export function FormDatePicker<TValues extends FieldValues>({
  control,
  name,
  rules,
  ...props
}: Bound<TValues> &
  Omit<
    DatePickerProps<CalendarDate>,
    "value" | "defaultValue" | "onChange" | "onBlur" | "name"
  >) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => (
        <>
          <FocusAnchor fieldRef={field.ref} />
          <DatePicker
            validationBehavior="aria"
            {...props}
            name={field.name}
            value={toDate(field.value)}
            onChange={(date) =>
              field.onChange(date ? date.toString() : undefined)
            }
            onBlur={field.onBlur}
            isInvalid={fieldState.invalid}
            errorMessage={fieldState.error?.message}
          />
        </>
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
  rules,
  ...props
}: Bound<TValues> &
  Omit<PhoneFieldProps, "value" | "onChange" | "onBlur" | "name">) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => (
        <>
          <FocusAnchor fieldRef={field.ref} />
          <PhoneField
            validationBehavior="aria"
            {...props}
            name={field.name}
            value={typeof field.value === "string" ? field.value : ""}
            onChange={(value) => field.onChange(value)}
            onBlur={field.onBlur}
            isInvalid={fieldState.invalid}
            errorMessage={fieldState.error?.message}
          />
        </>
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
  rules,
  ...props
}: Bound<TValues> & Omit<ImageFieldProps, "value" | "onChange">) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => (
        <>
          <FocusAnchor fieldRef={field.ref} />
          <ImageField
            {...props}
            value={typeof field.value === "string" ? field.value : ""}
            onChange={(value) => field.onChange(value)}
            isInvalid={fieldState.invalid}
            errorMessage={fieldState.error?.message}
          />
        </>
      )}
    />
  );
}

export function FormCheckbox<TValues extends FieldValues>({
  control,
  name,
  rules,
  ...props
}: Bound<TValues> &
  Omit<CheckboxProps, "isSelected" | "onChange" | "onBlur" | "name">) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => (
        <>
          <FocusAnchor fieldRef={field.ref} />
          <Checkbox
            validationBehavior="aria"
            {...props}
            name={field.name}
            isSelected={!!field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            isInvalid={fieldState.invalid}
            // Always a string, so the box is not remade, and keeps the
            // focus, when its message appears or clears.
            errorMessage={fieldState.error?.message ?? ""}
          />
        </>
      )}
    />
  );
}

/** Checkbox set. The field holds an array of the selected checkbox values. */
export function FormCheckboxGroup<TValues extends FieldValues>({
  control,
  name,
  rules,
  ...props
}: Bound<TValues> &
  Omit<CheckboxGroupProps, "value" | "onChange" | "onBlur" | "name">) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => (
        <>
          <FocusAnchor fieldRef={field.ref} />
          <CheckboxGroup
            validationBehavior="aria"
            {...props}
            name={field.name}
            value={Array.isArray(field.value) ? field.value : []}
            onChange={field.onChange}
            onBlur={field.onBlur}
            isInvalid={fieldState.invalid}
            errorMessage={fieldState.error?.message}
          />
        </>
      )}
    />
  );
}

export function FormSwitch<TValues extends FieldValues>({
  control,
  name,
  rules,
  ...props
}: Bound<TValues> &
  Omit<SwitchProps, "isSelected" | "onChange" | "onBlur" | "name">) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field }) => (
        <>
          <FocusAnchor fieldRef={field.ref} />
          <Switch
            {...props}
            name={field.name}
            isSelected={!!field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
          />
        </>
      )}
    />
  );
}

export function FormRadioGroup<TValues extends FieldValues>({
  control,
  name,
  rules,
  ...props
}: Bound<TValues> &
  Omit<RadioGroupProps, "value" | "onChange" | "onBlur" | "name">) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => (
        <>
          <FocusAnchor fieldRef={field.ref} />
          <RadioGroup
            validationBehavior="aria"
            {...props}
            name={field.name}
            // "" is how a form holds no choice. Given to the group as a
            // value, no radio has it and none is a Tab stop.
            value={field.value === "" ? null : (field.value ?? null)}
            onChange={field.onChange}
            onBlur={field.onBlur}
            isInvalid={fieldState.invalid}
            errorMessage={fieldState.error?.message}
          />
        </>
      )}
    />
  );
}

export function FormSelect<TValues extends FieldValues, T extends object>({
  control,
  name,
  rules,
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
      rules={rules}
      render={({ field, fieldState }) => (
        <>
          <FocusAnchor fieldRef={field.ref} />
          <Select<T>
            validationBehavior="aria"
            {...props}
            name={field.name}
            selectedKey={field.value ?? null}
            onSelectionChange={(key) => field.onChange(key)}
            onBlur={field.onBlur}
            isInvalid={fieldState.invalid}
            errorMessage={fieldState.error?.message}
          />
        </>
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
  rules,
  selectionMode = "multiple",
  ...props
}: Bound<TValues> &
  Omit<ChipGroupProps, "selectedKeys" | "onSelectionChange" | "name">) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => (
        <>
          <FocusAnchor fieldRef={field.ref} />
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
        </>
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
/**
 * `ComboBox` bound to a field that holds the chosen option: its key, or an
 * array of keys with `selectionMode="multiple"`. It does not hold the text
 * typed: text that matches no option is not the field's value.
 *
 * For a field whose value is the text itself, with options as suggestions
 * (an address that fills other fields, a tag to be created), bind the kit's
 * `ComboBox` yourself, on its text:
 *
 *   <Controller control={form.control} name="street"
 *     render={({ field, fieldState }) => (
 *       <ComboBox label="Street" items={suggestions} allowsCustomValue
 *         inputValue={field.value} onInputChange={field.onChange}
 *         onBlur={field.onBlur} validationBehavior="aria"
 *         isInvalid={fieldState.invalid}
 *         errorMessage={fieldState.error?.message}>
 *         {(s) => <ComboBoxItem id={s.id} label={s.label} />}
 *       </ComboBox>
 *     )} />
 */
export function FormComboBox<
  TValues extends FieldValues,
  T extends object,
  M extends "single" | "multiple" = "single",
>({
  control,
  name,
  rules,
  ...props
}: Bound<TValues> &
  Omit<ComboBoxProps<T, M>, "value" | "onChange" | "onBlur" | "name">) {
  const multiple = props.selectionMode === "multiple";
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => (
        <>
          <FocusAnchor fieldRef={field.ref} />
          <ComboBox<T, M>
            validationBehavior="aria"
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
        </>
      )}
    />
  );
}
