import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
} from "@nextui-org/react";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  IdentificationIcon,
} from "@heroicons/react/24/outline";
import type { UserDto } from "mydive/server/api/routers/booking";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserDto | null;
}

export function ContactModal({ isOpen, onClose, user }: ContactModalProps) {
  if (!user) return null;

  const handleEmailClick = (email: string) => {
    window.open(`mailto:${email}`, "_blank");
  };

  const handlePhoneClick = (phone: string) => {
    window.open(`tel:${phone}`, "_blank");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      placement="center"
      classNames={{
        base: "bg-white",
        backdrop:
          "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-gradient-to-r from-blue-500 to-purple-600 p-2">
                  <UserIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Contact Information
                  </h3>
                  <p className="text-sm text-gray-500">
                    Customer details and contact options
                  </p>
                </div>
              </div>
            </ModalHeader>

            <ModalBody className="py-4">
              <div className="space-y-4">
                {/* Name Section */}
                <Card className="shadow-sm">
                  <CardBody className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-gray-100 p-2">
                        <IdentificationIcon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                          Full Name
                        </p>
                        <p className="text-lg font-semibold text-gray-900">
                          {user.firstName || user.lastName
                            ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
                            : "No name provided"}
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Email Section */}
                {user.email && user.email.length > 0 && (
                  <Card className="shadow-sm">
                    <CardBody className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-blue-100 p-2">
                          <EnvelopeIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="mb-2 text-xs font-medium tracking-wide text-gray-500 uppercase">
                            Email Address{user.email.length > 1 ? "es" : ""}
                          </p>
                          <div className="space-y-2">
                            {user.email.map((email, index) => (
                              <button
                                key={index}
                                onClick={() => handleEmailClick(email)}
                                className="group flex w-full items-center justify-between rounded-lg bg-blue-50 p-2 text-left transition-colors duration-200 hover:bg-blue-100"
                              >
                                <span className="font-medium text-blue-700">
                                  {email}
                                </span>
                                <EnvelopeIcon className="h-4 w-4 text-blue-500 group-hover:text-blue-700" />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                )}

                {/* Phone Section */}
                {user.phoneNumbers && user.phoneNumbers.length > 0 && (
                  <Card className="shadow-sm">
                    <CardBody className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-green-100 p-2">
                          <PhoneIcon className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="mb-2 text-xs font-medium tracking-wide text-gray-500 uppercase">
                            Phone Number
                            {user.phoneNumbers.length > 1 ? "s" : ""}
                          </p>
                          <div className="space-y-2">
                            {user.phoneNumbers.map((phone, index) => (
                              <button
                                key={index}
                                onClick={() => handlePhoneClick(phone)}
                                className="group flex w-full items-center justify-between rounded-lg bg-green-50 p-2 text-left transition-colors duration-200 hover:bg-green-100"
                              >
                                <span className="font-medium text-green-700">
                                  {phone}
                                </span>
                                <PhoneIcon className="h-4 w-4 text-green-500 group-hover:text-green-700" />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                )}

                {/* Empty State */}
                {(!user.email || user.email.length === 0) &&
                  (!user.phoneNumbers || user.phoneNumbers.length === 0) && (
                    <Card className="border-2 border-dashed border-gray-200 shadow-sm">
                      <CardBody className="p-6 text-center">
                        <div className="mb-2 text-gray-400">
                          <EnvelopeIcon className="mx-auto h-8 w-8" />
                        </div>
                        <p className="text-sm text-gray-500">
                          No contact information available for this user
                        </p>
                      </CardBody>
                    </Card>
                  )}
              </div>
            </ModalBody>

            <ModalFooter className="px-8 pt-4 pb-8">
              <Button color="primary" onPress={onClose} className="w-full">
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
