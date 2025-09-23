import {
  CalendarIcon,
  UserIcon,
  UsersIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
} from "@nextui-org/react";
import type { WaitlistStatus } from "@prisma/client";
import { getBookingStatusIcon } from "mydive/app/_shared-frontend/components/statusIcons";
import {
  formatDateShort,
  getActiveScheduledJumps,
  getActiveScheduledJumpFromPopulatedWaitlist,
} from "mydive/app/_shared-frontend/utils/booking";
import { BookingActionsDropdown } from "./booking-actions-dropdown";
import type {
  BookingTableData,
  BookingTableRow,
  WaitlistWithUsers,
} from "../../types";
import type {
  BookingWindowDto,
  ScheduledJumpDto,
  UserDto,
  WaitlistPopulatedDto,
} from "mydive/server/api/routers/types";
import BookingRequestsTableFilters from "mydive/app/_shared-frontend/components/tables/manage-booking-requests/filters";
import { useMemo, useState } from "react";
import { api } from "mydive/trpc/react";
import { useRouter } from "next/navigation";
import { CancelBookingWindowConfirmationModal } from "mydive/app/_shared-frontend/components/modals/cancellation-confirmation/booking-window";
import { ModifyScheduledJumpsModal } from "../modals/modify-scheduled-jumps-modal";
import { ContactModal } from "mydive/app/_shared-frontend/components/modals/contact-modal";
import AdminWaitlistInfoModal from "../modals/admin-waitlist-info-modal";
import AdminScheduledJumpInfoModal from "../modals/admin-scheduled-jump-info-modal";

const AdminBookingRequestsTable = ({
  bookingWindows,
  users,
  waitlists,
  scheduledJumps,
  adminUser,
}: {
  bookingWindows: BookingWindowDto[];
  users: UserDto[];
  waitlists: WaitlistPopulatedDto[];
  scheduledJumps: ScheduledJumpDto[];
  adminUser: UserDto;
}) => {
  const router = useRouter();

  // Modal States
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [
    isCancelBookingWindowConfirmationModalOpen,
    setIsCancelBookingWindowConfirmationModalOpen,
  ] = useState(false);
  const [isModifyScheduledJumpsModalOpen, setIsModifyScheduledJumpsModalOpen] =
    useState(false);
  const [
    isScheduledJumpDateInfoModalOpen,
    setIsScheduledJumpDateInfoModalOpen,
  ] = useState(false);
  const [isWaitlistInfoModalOpen, setIsWaitlistInfoModalOpen] = useState(false);

  // Filter States
  const [showCancelled, setShowCancelled] = useState(false);
  const [showPast, setShowPast] = useState(false);

  // Selections
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
  const [selectedBookingTableRow, setSelectedBookingTableRow] =
    useState<BookingTableRow | null>(null);
  const [selectedJumpDate, setSelectedJumpDate] =
    useState<ScheduledJumpDto | null>(null);
  const selectedJumpDateUser = useMemo(() => {
    if (!selectedJumpDate) {
      return null;
    } else {
      return users.find((user) => {
        return user.userId === selectedJumpDate.bookedBy;
      });
    }
  }, [selectedJumpDate, users]);
  const [selectedWaitlist, setSelectedWaitlist] =
    useState<WaitlistWithUsers | null>(null);

  // Click Handlers
  const handleContactClick = (user: UserDto) => {
    setSelectedUser(user);
    setIsContactModalOpen(true);
  };
  const handleModifyBookingWindowClick = (booking: BookingTableRow) => {
    setSelectedBookingTableRow(booking);
    setIsModifyScheduledJumpsModalOpen(true);
  };
  const handleCancelBookingWindowClick = (booking: BookingTableRow) => {
    setSelectedBookingTableRow(booking);
    setIsCancelBookingWindowConfirmationModalOpen(true);
  };

  // Mutations
  const cancelBookingWindowMutation =
    api.adminBookingManager.cancelBookingWindow.useMutation({
      onSuccess: async () => {
        setIsCancelBookingWindowConfirmationModalOpen(false);
        setSelectedBookingTableRow(null);
        router.refresh();
      },
      onError: (error) => {
        console.error("Failed to cancel booking:", error.message);
        // You could add a toast notification here
      },
    });

  // prepping data
  const tableData: BookingTableData = useMemo(() => {
    const userMap = new Map(users.map((user) => [user.userId, user]));
    return bookingWindows.map((bookingWindow) => ({
      ...bookingWindow,
      bookedByUser: userMap.get(bookingWindow.bookedBy),
      waitlists: waitlists
        .filter((waitlist) => waitlist.associatedBookingId === bookingWindow.id)
        .map((waitlist) => ({
          ...waitlist,
          entries: waitlist.entries.map((entry) => ({
            ...entry,
            user: userMap.get(entry.waitlistedUserId),
          })),
        })),
      scheduledJumps: scheduledJumps.filter(
        (jump) => jump.associatedBookingId === bookingWindow.id,
      ),
    }));
  }, [bookingWindows, scheduledJumps, users, waitlists]);

  const filteredBookings = useMemo(() => {
    let filtered = tableData;
    if (!showCancelled) {
      filtered = filtered.filter((booking) => booking.status !== "CANCELED");
    }
    if (!showPast) {
      filtered = filtered.filter(
        (booking) => new Date(booking.windowEndDate) >= new Date(),
      );
    }
    // sort filtered by startDate
    filtered.sort((a, b) => {
      const dateA = new Date(a.windowStartDate);
      const dateB = new Date(b.windowStartDate);
      return dateA.getTime() - dateB.getTime();
    });
    return filtered;
  }, [showCancelled, showPast, tableData]);

  return (
    <>
      <BookingRequestsTableFilters
        numVisibleRows={filteredBookings.length}
        showCancelled={showCancelled}
        setShowCancelled={setShowCancelled}
        showPast={showPast}
        setShowPast={setShowPast}
      />
      <Table
        aria-label="Booking table"
        removeWrapper
        classNames={{
          base: "min-h-0",
          wrapper: "p-0 shadow-none bg-transparent",
          table: "min-h-0",
          thead: "bg-transparent",
          tbody: "bg-transparent",
          th: "bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 font-semibold text-xs uppercase tracking-wider border-b-2 border-slate-200 py-4 sticky top-0 z-10",
          td: "py-4 px-6 border-b border-slate-100",
          tr: "hover:bg-slate-50/50 transition-colors duration-200",
        }}
      >
        <TableHeader>
          <TableColumn className="text-left">BOOKING WINDOW</TableColumn>
          <TableColumn className="text-left">BOOKED BY</TableColumn>
          <TableColumn className="text-center">STATUS</TableColumn>
          <TableColumn className="text-center">JUMPERS</TableColumn>
          <TableColumn className="text-center">IDEAL JUMP DATE</TableColumn>
          <TableColumn className="text-center">
            SCHEDULED JUMP DATES
          </TableColumn>
          <TableColumn className="text-center">DATE BOOKED</TableColumn>
          <TableColumn className="text-center">WAITLISTS</TableColumn>
          <TableColumn className="text-center">ACTIONS</TableColumn>
        </TableHeader>
        <TableBody emptyContent="No bookings found">
          {filteredBookings.map((booking) => {
            const user = users.find((user) => {
              return user.userId === booking.bookedBy;
            });
            const status = booking.status;
            return (
              <TableRow key={booking.id} className="group">
                <TableCell>
                  <div className="flex flex-col space-y-1">
                    <div className="mt-2 ml-5">
                      <div className="text-sm font-semibold text-slate-700">
                        {formatDateShort(booking.windowStartDate)} -{" "}
                        {formatDateShort(booking.windowEndDate)}
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                        <CalendarIcon className="h-3 w-3" />
                        3-day booking window
                      </div>
                    </div>
                  </div>
                </TableCell>
                {/* Updated Booked By Cell - Now Clickable */}
                <TableCell>
                  {user ? (
                    <Button
                      variant="ghost"
                      className="h-auto justify-start p-2 text-left transition-colors duration-200 hover:bg-blue-50"
                      onPress={() => handleContactClick(user)}
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
                  <div className="flex justify-center text-black">
                    {getBookingStatusIcon(status)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center">
                    <div className="rounded-full border border-purple-200 bg-gradient-to-r from-purple-100 to-pink-100 p-3">
                      <div className="flex items-center gap-2">
                        <UsersIcon className="h-4 w-4 text-purple-600" />
                        <span className="text-lg font-bold text-purple-800">
                          {booking.numJumpers}
                        </span>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center">
                    <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-center">
                      <div className="text-sm font-semibold text-blue-900">
                        {formatDateShort(booking.idealizedJumpDate)}
                      </div>
                      <div className="text-xs text-blue-600">Preferred</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center">
                    {getActiveScheduledJumps(
                      booking.scheduledJumps,
                      "BOOKING_WINDOW",
                    ).length > 0 ? (
                      <div className="space-y-1">
                        {getActiveScheduledJumps(
                          booking.scheduledJumps,
                          "BOOKING_WINDOW",
                        )
                          .sort(
                            (a, b) =>
                              a.jumpDate.getTime() - b.jumpDate.getTime(),
                          )
                          .map((scheduledJump, idx) => (
                            <div
                              key={`${idx}-${scheduledJump.jumpDate.toISOString()}`}
                              className="flex items-center gap-2 rounded-md bg-green-50 px-2 py-1 text-sm"
                              onClick={() => {
                                setSelectedJumpDate(scheduledJump);
                                setIsScheduledJumpDateInfoModalOpen(true);
                              }}
                            >
                              <CheckCircleIcon className="h-4 w-4 text-green-600" />
                              <span className="font-medium text-green-800">
                                {formatDateShort(scheduledJump.jumpDate)}
                              </span>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <ClockIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-500">
                            Pending
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-gray-400">
                          Awaiting confirmation
                        </div>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center">
                    <div className="text-center">
                      <div className="text-sm font-medium text-slate-700">
                        {formatDateShort(booking.createdAt)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(booking.createdAt).toLocaleDateString(
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
                    {booking.waitlists.length > 0 ? (
                      <div className="space-y-1">
                        {booking.waitlists
                          .filter((waitlist) => {
                            return waitlist.entries.find((entry) => {
                              return entry.status !== "CANCELED";
                            });
                          })
                          .sort((a, b) => {
                            return a.day.getDate() - b.day.getDate();
                          })
                          .map((waitlist, idx) => {
                            // Determine colors based on waitlist status
                            const getStatusColors = (
                              status: WaitlistStatus,
                            ) => {
                              switch (status) {
                                case "OPENED":
                                  return {
                                    bg: "bg-yellow-50",
                                    icon: "text-yellow-600",
                                    text: "text-yellow-800",
                                  };
                                case "CONFIRMED":
                                  return {
                                    bg: "bg-green-50",
                                    icon: "text-green-600",
                                    text: "text-green-800",
                                  };
                                case "CLOSED":
                                  return {
                                    bg: "bg-red-50",
                                    icon: "text-red-600",
                                    text: "text-red-800",
                                  };
                                default:
                                  return {
                                    bg: "bg-gray-50",
                                    icon: "text-gray-600",
                                    text: "text-gray-800",
                                  };
                              }
                            };

                            const colors = getStatusColors(waitlist.status);
                            const activeScheduledJump =
                              getActiveScheduledJumpFromPopulatedWaitlist(
                                waitlist,
                              );

                            return (
                              <div
                                key={`${idx}-${waitlist.day.toISOString()}`}
                                className={`flex items-center gap-2 rounded-md ${colors.bg} px-2 py-1 text-sm`}
                              >
                                <CheckCircleIcon
                                  className={`h-4 w-4 ${colors.icon}`}
                                />
                                <span
                                  className={`font-medium ${colors.text} cursor-pointer`}
                                  onClick={() => {
                                    if (waitlist.status === "CLOSED") {
                                      return;
                                    }
                                    if (waitlist.status !== "CONFIRMED") {
                                      setSelectedWaitlist(waitlist);
                                      setIsWaitlistInfoModalOpen(true);
                                    } else {
                                      if (!activeScheduledJump) {
                                        throw Error(
                                          "No active scheduled jump found for confirmed waitlist!",
                                        );
                                      }
                                      setIsScheduledJumpDateInfoModalOpen(true);
                                      setSelectedJumpDate(activeScheduledJump);
                                    }
                                  }}
                                >
                                  {formatDateShort(waitlist.day)}
                                </span>
                              </div>
                            );
                          })}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <ClockIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-500">
                            No waitlist signups
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  {!(booking.status === "CANCELED") && (
                    <div className="z-0 flex justify-center">
                      <BookingActionsDropdown
                        booking={booking}
                        onModifyBookingWindowClick={() =>
                          handleModifyBookingWindowClick(booking)
                        }
                        onCancelBookingWindowClick={() =>
                          handleCancelBookingWindowClick(booking)
                        }
                      />
                    </div>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {selectedBookingTableRow && (
        <CancelBookingWindowConfirmationModal
          isOpen={isCancelBookingWindowConfirmationModalOpen}
          onClose={() => {
            setIsCancelBookingWindowConfirmationModalOpen(false);
            setSelectedBookingTableRow(null);
          }}
          onConfirm={() => {
            cancelBookingWindowMutation.mutate({
              bookingWindowId: selectedBookingTableRow.id,
            });
          }}
          bookingWindow={selectedBookingTableRow}
        />
      )}
      {selectedBookingTableRow && (
        <ModifyScheduledJumpsModal
          adminUserId={adminUser.userId}
          isOpen={isModifyScheduledJumpsModalOpen}
          onClose={() => {
            setIsModifyScheduledJumpsModalOpen(false);
            setSelectedBookingTableRow(null);
          }}
          booking={selectedBookingTableRow}
        />
      )}
      {selectedUser && (
        <ContactModal
          isOpen={isContactModalOpen}
          onClose={() => {
            setIsContactModalOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
        />
      )}
      {selectedWaitlist && (
        <AdminWaitlistInfoModal
          isOpen={isWaitlistInfoModalOpen}
          onClose={() => {
            setIsWaitlistInfoModalOpen(false);
            setSelectedWaitlist(null);
          }}
          waitlist={selectedWaitlist}
          adminUserId={adminUser.userId}
        />
      )}
      {selectedJumpDate && selectedJumpDateUser && (
        <AdminScheduledJumpInfoModal
          isOpen={isScheduledJumpDateInfoModalOpen}
          onClose={() => {
            setIsScheduledJumpDateInfoModalOpen(false);
            setSelectedJumpDate(null);
          }}
          adminUser={adminUser}
          bookingUser={selectedJumpDateUser}
          scheduledJump={selectedJumpDate}
        />
      )}
    </>
  );
};

export default AdminBookingRequestsTable;
