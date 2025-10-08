import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
  Card,
  CardBody,
} from "@nextui-org/react";
import type { ScheduledJump } from "@prisma/client";
import type { UserDto } from "mydive/server/api/routers/types";
import { useMemo, useState } from "react";
import { ContactModal } from "../../modals/contact-modal";
import { CancelScheduleJumpConfirmationModal } from "../../modals/cancellation-confirmation/scheduled-jump";
import { api } from "mydive/trpc/react";
import ScheduledJumpsTableFilters from "./filters";
import { getColumns, getTableCells } from "./table-helpers";
import { useRouter } from "next/navigation";
import { CompleteScheduleJumpConfirmationModal } from "../../modals/complete-confirmation/scheduled-jump";
import { CalendarIcon, UserIcon } from "@heroicons/react/24/outline";
import { formatDateShort } from "mydive/app/_shared-frontend/utils/booking";
import { getScheduledJumpStatusIcon } from "mydive/app/_shared-frontend/components/statusIcons";
import { isDateInPast } from "mydive/app/(routes)/customer/booking-calendar/components/calendar/helpers";
import {
  convertBookingZoneEnumToDisplayString,
  convertSchedulingMethodToDisplayString,
} from "mydive/app/_shared-types/defaults";

// Mobile Card Component
const MobileScheduledJumpCard = ({
  scheduledJump,
  user,
  isAdminView,
  handleJumpCancellationClick,
  handleContactInfoClick,
}: {
  scheduledJump: ScheduledJump;
  user?: UserDto;
  isAdminView: boolean;
  handleJumpCancellationClick: (scheduledJump: ScheduledJump) => void;
  handleContactInfoClick: (user: UserDto) => void;
  handleJumpCompletionClick: (scheduledJump: ScheduledJump) => void;
}) => {
  return (
    <Card className="mb-3 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <CardBody className="p-4">
        {/* Header with Date and Status */}
        <div className="mb-3 flex items-start justify-between">
          <div className="flex-1">
            <div className="text-base font-semibold text-slate-800">
              {formatDateShort(scheduledJump.jumpDate)}
            </div>
            <div className="mt-1 flex items-center gap-1 text-sm text-slate-500">
              <CalendarIcon className="h-4 w-4" />
              Jump Date
            </div>
          </div>

          <div className="ml-4 flex items-center gap-3">
            {getScheduledJumpStatusIcon(scheduledJump.status)}
          </div>
        </div>

        {/* Customer Info (Admin View Only) */}
        {isAdminView && user && (
          <div className="mb-4 rounded-lg bg-gray-50 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-800">
                  {user.firstName} {user.lastName}
                </span>
              </div>
              <button
                onClick={() => handleContactInfoClick(user)}
                className="text-xs font-medium text-blue-600 hover:text-blue-800"
              >
                Contact Info
              </button>
            </div>
            <div className="mt-1 text-xs text-gray-600">{user.email}</div>
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
          {/* Jump Type */}
          <div className="text-center">
            <div className="rounded-lg bg-purple-50 px-3 py-2 text-purple-700">
              <div className="text-sm font-semibold capitalize">
                {convertBookingZoneEnumToDisplayString(
                  scheduledJump.bookingZone,
                )}
              </div>
            </div>
            <div className="mt-1 text-xs text-slate-500">Booking Zone</div>
          </div>

          {/* Created Date */}
          <div className="text-center">
            <div className="rounded-lg bg-blue-50 px-3 py-2 text-blue-700">
              <div className="text-sm font-semibold">
                {convertSchedulingMethodToDisplayString(
                  scheduledJump.schedulingMethod,
                )}
              </div>
            </div>
            <div className="mt-1 text-xs text-slate-500">Scheduling Method</div>
          </div>
        </div>

        {/* Actions */}
        {!isAdminView &&
        scheduledJump.status === "SCHEDULED" &&
        !isDateInPast(scheduledJump.jumpDate) ? (
          <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
            <button
              onClick={() => handleJumpCancellationClick(scheduledJump)}
              className={`${isAdminView ? "flex-1" : "w-full"} rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700`}
            >
              Cancel Jump
            </button>
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
};

export default function ScheduledJumpsTable({
  scheduledJumps,
  users,
  isAdminView = false,
}: {
  scheduledJumps: ScheduledJump[];
  users?: UserDto[];
  isAdminView?: boolean;
}) {
  const router = useRouter();
  // modal states
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [
    isScheduledJumpCancellationModalOpen,
    setIsScheduledJumpCancellationModalOpen,
  ] = useState(false);
  const [
    isScheduledJumpCompletionModalOpen,
    setIsScheduledJumpCompletionModalOpen,
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
  const handleJumpCompletionClick = (scheduledJump: ScheduledJump) => {
    setSelectedScheduledJump(scheduledJump);
    setIsScheduledJumpCompletionModalOpen(true);
  };
  const handleJumpCompletionClose = () => {
    setSelectedScheduledJump(null);
    setIsScheduledJumpCompletionModalOpen(false);
  };

  // mutations
  const cancelJumpDate =
    api.adminScheduledJumpsManager.cancelScheduledJump.useMutation({
      onSuccess: async () => {
        router.refresh();
        handleJumpCancellationClose();
      },
      onError: (error) => {
        console.error("Failed to cancel booking:", error.message);
      },
    });

  const completeScheduledJump =
    api.adminScheduledJumpsManager.completeScheduledJump.useMutation({
      onSuccess: async () => {
        router.refresh();
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
          user: users?.find((user) => {
            return user.userId === scheduledJump.bookedBy;
          }),
        };
      })
      .sort((a, b) => {
        return (
          a.scheduledJump.jumpDate.getTime() -
          b.scheduledJump.jumpDate.getTime()
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

  // Column Definitions
  const columns = getColumns(isAdminView);

  if (tableData.length === 0) {
    return (
      <div className="flex h-full flex-col">
        {/* Fixed Filters */}
        <div className="flex-shrink-0">
          <ScheduledJumpsTableFilters
            numVisibleRows={tableData.length}
            showPast={showPast}
            setShowPast={setShowPast}
            showCancelled={showCancelled}
            setShowCancelled={setShowCancelled}
          />
        </div>

        {/* Empty State */}
        <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
          <CalendarIcon className="mb-4 h-16 w-16 text-gray-300" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            No scheduled jumps found
          </h3>
          <p className="text-gray-500">
            Your scheduled jumps will appear here when they are booked.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col p-0">
      {/* Fixed Filters */}
      <div className="flex-shrink-0">
        <ScheduledJumpsTableFilters
          numVisibleRows={tableData.length}
          showPast={showPast}
          setShowPast={setShowPast}
          showCancelled={showCancelled}
          setShowCancelled={setShowCancelled}
        />
      </div>

      {/* Scrollable Content */}
      <div className="min-h-0 flex-1 overflow-auto">
        {/* Mobile View - Cards */}
        <div className="block p-4 md:hidden">
          {tableData.map((row) => {
            const { scheduledJump, user } = row;
            return (
              <MobileScheduledJumpCard
                key={scheduledJump.id}
                scheduledJump={scheduledJump}
                user={user}
                isAdminView={isAdminView}
                handleJumpCancellationClick={handleJumpCancellationClick}
                handleContactInfoClick={handleContactInfoClick}
                handleJumpCompletionClick={handleJumpCompletionClick}
              />
            );
          })}
        </div>

        {/* Desktop View - Table */}
        <div className="hidden md:block">
          <Table
            aria-label="Scheduled Jumps Table"
            id="scheduled-jumps-table"
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
            <TableHeader>{columns}</TableHeader>
            <TableBody emptyContent="No scheduled jumps found">
              {tableData.map((row) => {
                const { scheduledJump, user } = row;
                return (
                  <TableRow key={scheduledJump.id} className="group">
                    {getTableCells(
                      isAdminView,
                      scheduledJump,
                      handleJumpCancellationClick,
                      user,
                      handleContactInfoClick,
                      handleJumpCompletionClick,
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

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
      {selectedScheduledJump && (
        <CompleteScheduleJumpConfirmationModal
          isOpen={isScheduledJumpCompletionModalOpen}
          scheduledJump={selectedScheduledJump}
          onClose={handleJumpCompletionClose}
          onConfirm={() =>
            completeScheduledJump.mutate({
              scheduledJumpId: selectedScheduledJump.id,
            })
          }
        />
      )}
    </div>
  );
}
