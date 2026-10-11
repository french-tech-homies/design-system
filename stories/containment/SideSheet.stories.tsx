import React, { useState } from "react";
import { Meta, StoryObj } from "@storybook/react-vite";
import SideSheet from "@french-tech-homies/design-system/components/SideSheet";
import Button from "@french-tech-homies/design-system/components/Button";
import { Display, Title, Body } from "@french-tech-homies/design-system/primitives/Typography";

const meta: Meta<typeof SideSheet> = {
  title: "MD3/Containment/Side sheet",
  component: SideSheet,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

type Story = StoryObj<typeof SideSheet>;

const SideSheetExample = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="grid h-screen grid-cols-[1fr_auto] grid-rows-[auto_minmax(0,1fr)] gap-4">
      <div className="bg-surface col-span-2 p-4">
        <Display>Header</Display>
      </div>
      <div className="bg-surface-container ml-4 overflow-auto rounded-xl p-4">
        <Display className="mb-8">Main Content</Display>
        <Button onPress={() => setIsOpen(!isOpen)}>
          {isOpen ? "Close SideSheet" : "Open SideSheet"}
        </Button>
        <Body className="mt-4">
          This is the main content area. The SideSheet will appear on the right
          when opened.
        </Body>
      </div>
      <SideSheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="SideSheet Title"
        className="w-[360px]"
      >
        <Title className="mb-4">SideSheet Content</Title>
        <Body>
          This is the content of the SideSheet. You can put any React components
          or HTML here.
        </Body>
        <Body className="mt-4">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam
          euismod, nisi vel consectetur interdum, nisl nunc egestas nunc, vitae
          tincidunt nisl nunc euismod nunc.
        </Body>
      </SideSheet>
    </div>
  );
};

export const Default: Story = {
  render: () => <SideSheetExample />,
};

const ModalSideSheetExample = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="grid h-screen grid-cols-[1fr_auto] grid-rows-[auto_minmax(0,1fr)] gap-4">
      <div className="bg-surface col-span-2 p-4">
        <Display>Header</Display>
      </div>
      <div className="bg-surface-container ml-4 overflow-auto rounded-xl p-4">
        <Display className="mb-8">Main Content</Display>
        <Button onPress={() => setIsOpen(!isOpen)}>
          {isOpen ? "Close Modal SideSheet" : "Open Modal SideSheet"}
        </Button>
        <Body className="mt-4">
          This is the main content area. The Modal SideSheet will appear when
          opened.
        </Body>
      </div>
      <SideSheet
        variant="modal"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Modal SideSheet"
      >
        <Title className="mb-4">Modal SideSheet Content</Title>
        <Body>
          This is a modal variant of the SideSheet. It appears as a modal dialog
          and can be dismissed by clicking outside or using the close button.
        </Body>
        <Body className="mt-4">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam
          euismod, nisi vel consectetur interdum, nisl nunc egestas nunc, vitae
          tincidunt nisl nunc euismod nunc.
        </Body>
        <Button className="mt-4" onPress={() => setIsOpen(false)}>
          Close
        </Button>
      </SideSheet>
    </div>
  );
};

export const ModalVariant: Story = {
  render: () => <ModalSideSheetExample />,
};

const LeftAlignedModalSideSheetExample = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="grid h-screen grid-cols-[1fr_auto] grid-rows-[auto_minmax(0,1fr)] gap-4">
      <div className="bg-surface col-span-2 p-4">
        <Display>Header</Display>
      </div>
      <div className="bg-surface-container ml-4 overflow-auto rounded-xl p-4">
        <Display className="mb-8">Main Content</Display>
        <Button onPress={() => setIsOpen(!isOpen)}>
          {isOpen ? "Close Left Modal SideSheet" : "Open Left Modal SideSheet"}
        </Button>
        <Body className="mt-4">
          This is the main content area. The Left-aligned Modal SideSheet will
          appear when opened.
        </Body>
      </div>
      <SideSheet
        variant="modal"
        align="left"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Left-Aligned Modal SideSheet"
      >
        <Title className="mb-4">Left-Aligned Modal SideSheet Content</Title>
        <Body>
          This is a modal variant of the SideSheet, aligned to the left. It
          appears as a modal dialog and can be dismissed by clicking outside or
          using the close button.
        </Body>
        <Body className="mt-4">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam
          euismod, nisi vel consectetur interdum, nisl nunc egestas nunc, vitae
          tincidunt nisl nunc euismod nunc.
        </Body>
        <Button className="mt-4" onPress={() => setIsOpen(false)}>
          Close
        </Button>
      </SideSheet>
    </div>
  );
};

export const LeftAlignedModalVariant: Story = {
  render: () => <LeftAlignedModalSideSheetExample />,
};
