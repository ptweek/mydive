import {
  CalendarIcon,
  ClockIcon,
  UsersIcon,
  MapPinIcon,
  QueueListIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
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
import { ContactModal } from "../modals/contact-modal";

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

const ScheduledJumpSummaryInfo = ({
  jumpDate,
  bookingZone,
  schedulingMethod,
}: {
  jumpDate: Date;
  bookingZone: string;
  schedulingMethod: SchedulingMethod;
}) => {
  return (
    <div className="flex flex-col space-y-1 text-black">
      <div className="mt-2 ml-5">
        <div className="text-sm font-semibold text-slate-700">
          {formatDateShort(jumpDate)}
        </div>
        <div className="mt-1 flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <MapPinIcon className="h-3 w-3" />
            {bookingZone}
          </div>
          <Chip
            size="sm"
            variant="flat"
            color={
              schedulingMethod === "BOOKING_WINDOW" ? "primary" : "secondary"
            }
            className="text-xs"
          >
            {schedulingMethod === "BOOKING_WINDOW" ? (
              <>
                <CalendarIcon className="mr-1 h-3 w-3" />
                Booking Window
              </>
            ) : (
              <>
                <QueueListIcon className="mr-1 h-3 w-3" />
                Waitlist
              </>
            )}
          </Chip>
        </div>
      </div>
    </div>
  );
};

export default function ScheduledJumpsTable({
  scheduledJumps,
  users,
  handleJumpCancellationClick,
  isAdminView = false,
}: {
  scheduledJumps: ScheduledJump[];
  users: UserDto[];
  handleJumpCancellationClick?: (jump: ScheduledJump) => void;
  isAdminView?: boolean;
}) {
  // modal states
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // selected user
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);

  const handleContactInfoClick = (user: UserDto) => {
    setSelectedUser(user);
    setIsContactModalOpen(true);
  };
  const handleContactModalClose = () => {
    setSelectedUser(null);
    setIsContactModalOpen(false);
  };

  // useMemo hooks
  const tableData = useMemo(() => {
    return scheduledJumps
      .map((scheduledJump) => {
        return {
          ...scheduledJump,
          user: users.find((user) => {
            return user.userId === scheduledJump.bookedBy;
          }),
        };
      })
      .sort((a, b) => {
        return a.jumpDate.getDate() - b.jumpDate.getDate();
      });
  }, [scheduledJumps, users]);
  return (
    <>
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
          {tableData.map((jump) => {
            const { user } = jump;
            return (
              <TableRow key={jump.id} className="group">
                <TableCell>
                  <div className="flex flex-col space-y-1">
                    <div className="mt-2 ml-5">
                      <div className="text-sm font-semibold text-slate-700">
                        {formatDateShort(jump.jumpDate)}
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="text-sm font-semibold text-slate-700">
                  <div className="flex justify-center">{jump.bookingZone}</div>
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
                    {getBookingStatusIcon(jump.status)}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center justify-center">
                    <div className="rounded-full border border-purple-200 bg-gradient-to-r from-purple-100 to-pink-100 p-3">
                      <div className="flex items-center gap-2">
                        <UsersIcon className="h-4 w-4 text-purple-600" />
                        <span className="text-lg font-bold text-purple-800">
                          {jump.numJumpers}
                        </span>
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex justify-center text-black">
                    <Chip
                      variant="flat"
                      color={
                        jump.schedulingMethod === "BOOKING_WINDOW"
                          ? "primary"
                          : "secondary"
                      }
                    >
                      {jump.schedulingMethod === "BOOKING_WINDOW"
                        ? "Booking Window"
                        : "Waitlist"}
                    </Chip>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex justify-center">
                    <div className="text-center">
                      <div className="text-sm font-medium text-slate-700">
                        {formatDateShort(jump.createdAt)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(jump.createdAt).toLocaleDateString("en-US", {
                          weekday: "short",
                        })}
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex justify-center">
                    <div className="text-center">
                      <div className="text-sm font-medium text-slate-700">
                        {formatDateShort(jump.updatedAt)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(jump.updatedAt).toLocaleDateString("en-US", {
                          weekday: "short",
                        })}
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex justify-center gap-2">
                    {handleJumpCancellationClick ? (
                      <>
                        {handleJumpCancellationClick &&
                          jump.status !== "CANCELED" && (
                            <button
                              onClick={() => handleJumpCancellationClick(jump)}
                              className="rounded bg-red-500 px-3 py-1 text-xs text-white hover:bg-red-600"
                            >
                              Cancel
                            </button>
                          )}
                      </>
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
    </>
  );
}
