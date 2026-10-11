import type { Meta, StoryObj } from "@storybook/react-vite";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  FormCheckbox,
  FormCheckboxGroup,
  FormChipGroup,
  FormComboBox,
  FormImageField,
  FormNumberField,
  FormPhoneField,
  FormRadioGroup,
  FormSelect,
  FormSwitch,
  FormTextField,
} from "@french-tech-homies/design-system/adapters/react-hook-form";
import Button from "@french-tech-homies/design-system/components/Button";
import { Checkbox } from "@french-tech-homies/design-system/components/Checkbox";
import Chip from "@french-tech-homies/design-system/components/Chip";
import { ComboBoxItem } from "@french-tech-homies/design-system/components/ComboBox";
import { Radio } from "@french-tech-homies/design-system/components/Radio";
import { SelectItem } from "@french-tech-homies/design-system/components/Select";
import { Body, Title } from "@french-tech-homies/design-system/primitives/Typography";

/**
 * The react-hook-form adapter (`adapters/react-hook-form.tsx`): every kit
 * control bound through `Controller`, with Zod validation on submit. This is
 * the drop-in target for the app's shadcn `Form*` usages.
 */
const meta = {
  title: "MD3/Text inputs/Form (react-hook-form)",
  parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const schema = z.object({
  displayName: z.string().min(3, "Use at least 3 characters"),
  description: z.string().max(120, "Keep it under 120 characters").optional(),
  service: z.enum(["table", "counter", "delivery"], {
    message: "Choose a service",
  }),
  expiresIn: z.number({ message: "Choose an expiry" }),
  phone: z
    .string({ message: "Enter a phone number" })
    .min(1, "Enter a phone number"),
  minimumOrder: z
    .number({ message: "Enter a minimum order" })
    .min(0, "Can't be negative"),
  openDays: z.array(z.string()).min(1, "Open at least one day"),
  categories: z.array(z.string()).min(1, "Pick at least one category"),
  payments: z.array(z.string()).min(1, "Accept at least one payment method"),
  acceptsOrders: z.boolean(),
  logo: z.string().optional(),
  terms: z.literal(true, { message: "You must accept the terms" }),
});

type Values = z.infer<typeof schema>;

const expiry = [
  { id: 1, name: "1 day" },
  { id: 7, name: "1 week" },
  { id: 30, name: "1 month" },
];

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const categories = [
  { id: "starters", name: "Starters" },
  { id: "mains", name: "Mains" },
  { id: "desserts", name: "Desserts" },
  { id: "drinks", name: "Drinks" },
];

function CreateStoreForm() {
  const [submitted, setSubmitted] = useState<Values | null>(null);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      displayName: "",
      description: "",
      phone: "",
      minimumOrder: 15,
      openDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      categories: ["mains"],
      payments: ["card"],
      acceptsOrders: true,
      terms: false as unknown as true,
    },
    mode: "onBlur",
  });

  return (
    <form
      onSubmit={form.handleSubmit((values) => setSubmitted(values))}
      className="bg-surface-container-low rounded-shape-extra-large flex w-[420px] flex-col gap-5 p-6 [--md3-field-notch:var(--md-sys-color-surface-container-low)]"
      noValidate
    >
      <Title size="large" component="h2" className="text-on-surface">
        Create a store
      </Title>
      <FormTextField
        control={form.control}
        name="displayName"
        label="Display name"
        supportingText="Shown on the storefront"
      />
      <FormTextField
        control={form.control}
        name="description"
        label="Description"
        multiline
        maxLength={120}
        showCharacterCount
      />
      <FormSelect
        control={form.control}
        name="expiresIn"
        label="Invitation links expire in"
        items={expiry}
      >
        {(item) => <SelectItem id={item.id} label={item.name} />}
      </FormSelect>
      <FormNumberField
        control={form.control}
        name="minimumOrder"
        label="Minimum order"
        formatOptions={{ style: "currency", currency: "EUR" }}
        minValue={0}
        step={0.5}
        steppers
        supportingText="Orders below this amount are refused"
      />
      <FormPhoneField
        control={form.control}
        name="phone"
        label="Phone number"
        defaultCountry="FR"
        supportingText="Shown to customers on the storefront"
      />
      <FormRadioGroup control={form.control} name="service" label="Service">
        <Radio value="table">Table service</Radio>
        <Radio value="counter">Counter pickup</Radio>
        <Radio value="delivery">Delivery</Radio>
      </FormRadioGroup>
      <FormChipGroup control={form.control} name="openDays" label="Open days">
        {days.map((day) => (
          <Chip key={day} id={day} variant="filter">
            {day}
          </Chip>
        ))}
      </FormChipGroup>
      <FormComboBox
        control={form.control}
        name="categories"
        selectionMode="multiple"
        label="Categories"
        items={categories}
        supportingText="Type to filter, Backspace removes"
      >
        {(c) => <ComboBoxItem id={c.id} label={c.name} />}
      </FormComboBox>
      <FormImageField
        control={form.control}
        name="logo"
        label="Logo"
        aspectRatio="4:3"
        maxSize={2 * 1024 * 1024}
        supportingText="Optional — PNG, JPEG or WebP, up to 2 MB"
      />
      <FormCheckboxGroup
        control={form.control}
        name="payments"
        label="Payment methods"
      >
        <Checkbox value="card">Card</Checkbox>
        <Checkbox value="cash">Cash</Checkbox>
        <Checkbox value="voucher">Meal vouchers</Checkbox>
      </FormCheckboxGroup>
      <FormSwitch control={form.control} name="acceptsOrders">
        Accept online orders
      </FormSwitch>
      <FormCheckbox control={form.control} name="terms">
        I accept the terms of service
      </FormCheckbox>
      {form.formState.errors.terms && (
        <Body size="small" className="text-error -mt-3">
          {form.formState.errors.terms.message}
        </Body>
      )}
      <div className="flex justify-end gap-2">
        <Button variant="text" onPress={() => form.reset()}>
          Reset
        </Button>
        <Button type="submit" isLoading={form.formState.isSubmitting}>
          Create
        </Button>
      </div>
      {submitted && (
        <pre className="bg-surface-container-highest text-on-surface rounded-shape-small text-body-small overflow-auto p-3">
          {JSON.stringify(submitted, null, 2)}
        </pre>
      )}
    </form>
  );
}

export const CreateStore: Story = { render: () => <CreateStoreForm /> };

function ValidationOnSubmit() {
  const form = useForm<Values>({ resolver: zodResolver(schema) });
  return (
    <form
      onSubmit={form.handleSubmit(() => undefined)}
      className="flex w-[420px] flex-col gap-5"
      noValidate
    >
      <FormTextField
        control={form.control}
        name="displayName"
        label="Display name"
      />
      <FormSelect
        control={form.control}
        name="expiresIn"
        label="Expires in"
        items={expiry}
      >
        {(item) => <SelectItem id={item.id} label={item.name} />}
      </FormSelect>
      <FormNumberField
        control={form.control}
        name="minimumOrder"
        label="Minimum order"
        formatOptions={{ style: "currency", currency: "EUR" }}
      />
      <FormRadioGroup control={form.control} name="service" label="Service">
        <Radio value="table">Table service</Radio>
        <Radio value="counter">Counter pickup</Radio>
      </FormRadioGroup>
      <Button type="submit">Submit empty to see errors</Button>
    </form>
  );
}

export const ValidationErrors: Story = { render: () => <ValidationOnSubmit /> };
