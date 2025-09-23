import { UsersIcon, UserIcon } from "@heroicons/react/24/outline";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Chip,
  Button,
} from "@nextui-org/react";
import { formatDateShort } from "mydive/app/_utils/booking";
import type { BookingStatus, ScheduledJump } from "@prisma/client";
import { getBookingStatusIcon } from "mydive/app/_components/statusIcons";
import type { UserDto } from "mydive/server/api/routers/types";
import { useMemo, useState } from "react";
import { ContactModal } from "../../modals/contact-modal";
import { CancelScheduleJumpConfirmationModal } from "../../modals/scheduled-jump-cancel-confirmation-modal";
import { api } from "mydive/trpc/react";
import ScheduledJumpsTableFilters from "./filters";

// Define the SchedulingMethod enum to match your schema
export type SchedulingMethod = "BOOKING_WINDOW" | "WAITLIST";

export type ScheduledJumpTableRow = {
  id: number;
  jumpDate: Date;
  bookingZone: string;
  numJumpers: number;
  schedulingMethod: SchedulingMethod;
  status: BookingStatus;
  bookedBy: string;
  confirmedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  // You can expand this with populated data as needed
  associatedBookingId: number;
  associatedWaitlistId?: number;
};

export default function ScheduledJumpsTable({
  scheduledJumps,
  users,
  isAdminView = false,
}: {
  scheduledJumps: ScheduledJump[];
  users: UserDto[];
  isAdminView?: boolean;
}) {
  // modal states
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [
    isScheduledJumpCancellationModalOpen,
    setIsScheduledJumpCancellationModalOpen,
  ] = useState(false);

  // selected user
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
  const [selectedScheduledJump, setSelectedScheduledJump] =
    useState<ScheduledJump | null>(null);

  // Filters
  const [showPast, setShowPast] = useState(false);
  const [showCancelled, setShowCancelled] = useState(false);

  // click and close handlers
  const handleContactInfoClick = (user: UserDto) => {
    setSelectedUser(user);
    setIsContactModalOpen(true);
  };
  const handleContactModalClose = () => {
    setSelectedUser(null);
    setIsContactModalOpen(false);
  };
  const handleJumpCancellationClick = (scheduledJump: ScheduledJump) => {
    setSelectedScheduledJump(scheduledJump);
    setIsScheduledJumpCancellationModalOpen(true);
  };
  const handleJumpCancellationClose = () => {
    setSelectedScheduledJump(null);
    setIsScheduledJumpCancellationModalOpen(false);
  };

  // mutations
  const cancelJumpDate =
    api.adminScheduledJumpsManager.cancelScheduledJump.useMutation({
      onSuccess: async () => {
        handleJumpCancellationClose();
      },
      onError: (error) => {
        console.error("Failed to cancel booking:", error.message);
      },
    });

  // useMemo hooks
  const convertedTableData = useMemo(() => {
    return scheduledJumps
      .map((scheduledJump) => {
        return {
          scheduledJump,
          user: users.find((user) => {
            return user.userId === scheduledJump.bookedBy;
          }),
        };
      })
      .sort((a, b) => {
        return (
          a.scheduledJump.jumpDate.getDate() -
          b.scheduledJump.jumpDate.getDate()
        );
      });
  }, [scheduledJumps, users]);

  const tableData = useMemo(() => {
    let tableData = convertedTableData;
    if (!showPast) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      tableData = tableData.filter((row) => {
        const jumpDate = new Date(row.scheduledJump.jumpDate);
        jumpDate.setHours(0, 0, 0, 0);
        return jumpDate >= today;
      });
    }
    if (!showCancelled) {
      tableData = tableData.filter((row) => {
        return row.scheduledJump.status !== "CANCELED";
      });
    }
    return tableData;
  }, [convertedTableData, showPast, showCancelled]);
  return (
    <>
      <ScheduledJumpsTableFilters
        numVisibleRows={tableData.length}
        showPast={showPast}
        setShowPast={setShowPast}
        showCancelled={showCancelled}
        setShowCancelled={setShowCancelled}
      />
      <Table
        aria-label="Scheduled Jumps Table"
        removeWrapper
        classNames={{
          base: "min-h-0 m-0 p-0 bg-white",
          wrapper: "p-0 m-0 shadow-none bg-transparent",
          table: "min-h-0 m-0 border-collapse",
          thead: "bg-white m-0",
          tbody: "bg-white m-0",
          th: "bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 font-semibold text-xs uppercase tracking-wider border-b-2 border-slate-200 py-3 px-6 m-0 first:rounded-none last:rounded-none",
          td: "py-4 px-6 border-b border-slate-100 m-0",
          tr: "hover:bg-slate-50/50 transition-colors duration-200 m-0",
        }}
      >
        <TableHeader>
          <TableColumn className="text-left">SCHEDULED JUMP DATE</TableColumn>
          <TableColumn className="text-left">BOOKING ZONE</TableColumn>
          <TableColumn className="text-center">BOOKED BY</TableColumn>
          <TableColumn className="text-center">STATUS</TableColumn>
          <TableColumn className="text-center">JUMPERS</TableColumn>
          <TableColumn className="text-center">BOOKING METHOD</TableColumn>
          <TableColumn className="text-center">CREATED</TableColumn>
          <TableColumn className="text-center">LAST UPDATED</TableColumn>
          <TableColumn className="text-center">ACTIONS</TableColumn>
        </TableHeader>
        <TableBody emptyContent="No scheduled jumps found">
          {tableData.map((row) => {
            const { scheduledJump, user } = row;
            return (
              <TableRow key={scheduledJump.id} className="group">
                <TableCell>
                  <div className="flex flex-col space-y-1">
                    <div className="mt-2 ml-5">
                      <div className="text-sm font-semibold text-slate-700">
                        {formatDateShort(scheduledJump.jumpDate)}
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="text-sm font-semibold text-slate-700">
                  <div className="flex justify-center">
                    {scheduledJump.bookingZone}
                  </div>
                </TableCell>
                <TableCell>
                  {isAdminView && user ? (
                    <Button
                      variant="ghost"
                      className="h-auto justify-start p-2 text-left transition-colors duration-200 hover:bg-blue-50"
                      onPress={() => handleContactInfoClick(user)}
                    >
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-blue-100 p-1">
                          <UserIcon className="h-3 w-3 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-700">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-xs text-slate-500">
                            Click for contact info
                          </div>
                        </div>
                      </div>
                    </Button>
                  ) : (
                    <div className="text-slate-500 italic">User not found</div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex justify-center">
                    {getBookingStatusIcon(scheduledJump.status)}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center justify-center">
                    <div className="rounded-full border border-purple-200 bg-gradient-to-r from-purple-100 to-pink-100 p-3">
                      <div className="flex items-center gap-2">
                        <UsersIcon className="h-4 w-4 text-purple-600" />
                        <span className="text-lg font-bold text-purple-800">
                          {scheduledJump.numJumpers}
                        </span>
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex justify-center text-sm font-medium text-slate-700">
                    <Chip
                      variant="flat"
                      color={
                        scheduledJump.schedulingMethod === "BOOKING_WINDOW"
                          ? "primary"
                          : "secondary"
                      }
                    >
                      {scheduledJump.schedulingMethod === "BOOKING_WINDOW"
                        ? "Booking Window"
                        : "Waitlist"}
                    </Chip>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex justify-center">
                    <div className="text-center">
                      <div className="text-sm font-medium text-slate-700">
                        {formatDateShort(scheduledJump.createdAt)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(scheduledJump.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "short",
                          },
                        )}
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex justify-center">
                    <div className="text-center">
                      <div className="text-sm font-medium text-slate-700">
                        {formatDateShort(scheduledJump.updatedAt)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(scheduledJump.updatedAt).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "short",
                          },
                        )}
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex justify-center gap-2">
                    {scheduledJump.status !== "CANCELED" ? (
                      <button
                        onClick={() =>
                          handleJumpCancellationClick(scheduledJump)
                        }
                        className="rounded bg-red-500 px-3 py-1 text-xs text-white hover:bg-red-600"
                      >
                        Cancel
                      </button>
                    ) : (
                      <span className="text-sm text-slate-400">--</span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {selectedUser && (
        <ContactModal
          isOpen={isContactModalOpen}
          user={selectedUser}
          onClose={handleContactModalClose}
        />
      )}
      {selectedScheduledJump && (
        <CancelScheduleJumpConfirmationModal
          isOpen={isScheduledJumpCancellationModalOpen}
          scheduledJump={selectedScheduledJump}
          onClose={handleJumpCancellationClose}
          onConfirm={() =>
            cancelJumpDate.mutate({ scheduledJumpId: selectedScheduledJump.id })
          }
        />
      )}
    </>
  );
}
