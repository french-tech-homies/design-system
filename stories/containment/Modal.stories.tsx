import React, { useState } from "react";
import { Meta, StoryObj } from "@storybook/react-vite";
import Modal from "@french-tech-homies/design-system/components/Modal";
import Button from "@french-tech-homies/design-system/components/Button";
import { Card, CardContent } from "@french-tech-homies/design-system/components/Card";
import { motion, AnimatePresence } from "framer-motion";

const meta: Meta<typeof Modal> = {
  title: "MD3/Containment/Modal",
  component: Modal,
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<typeof Modal>;

const ModalExample = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onPress={() => setIsOpen(true)}>Open Modal</Button>
      {isOpen && (
        <Modal isOpen onOpenChange={setIsOpen}>
          <div className="bg-surface-container-low w-full max-w-md rounded-lg p-6 shadow-lg">
            <h2 className="text-on-surface mb-4 text-2xl font-bold">
              Modal Title
            </h2>
            <p className="text-on-surface-variant mb-4">
              This is the content of the modal. You can put any React components
              or HTML here.
            </p>
            <Button onPress={() => setIsOpen(false)}>Close Modal</Button>
          </div>
        </Modal>
      )}
    </>
  );
};

export const Default: Story = {
  render: () => <ModalExample />,
};

const ModalWithCardExample = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onPress={() => setIsOpen(true)}>Open Modal with Card</Button>
      {isOpen && (
        <Modal isOpen onOpenChange={setIsOpen}>
          <Card>
            <CardContent
              media="https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              mediaAspectRatio="16:9"
              headline="Play relaxing songs"
              supportingText="From your Spotify library"
              actions={
                <Button onPress={() => setIsOpen(false)}>Close Modal</Button>
              }
            />
          </Card>
        </Modal>
      )}
    </>
  );
};

export const WithCard: Story = {
  render: () => <ModalWithCardExample />,
};

const ModalWithCustomAnimationExample = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onPress={() => setIsOpen(true)}>
        Open Modal with Custom Animation
      </Button>
      <AnimatePresence>
        {isOpen && (
          <Modal isOpen onOpenChange={setIsOpen}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="bg-surface-container-low w-full max-w-md rounded-lg p-6 shadow-lg"
            >
              <h2 className="text-on-surface mb-4 text-2xl font-bold">
                Modal Title
              </h2>
              <p className="text-on-surface-variant mb-4">
                This is the content of the modal. You can put any React
                components or HTML here.
              </p>
              <Button onPress={() => setIsOpen(false)}>Close Modal</Button>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
};

export const WithCustomAnimation: Story = {
  render: () => <ModalWithCustomAnimationExample />,
};
