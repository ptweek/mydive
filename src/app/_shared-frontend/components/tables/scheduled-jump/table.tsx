import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
  Pagination,
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
import CalendarToolbar from "mydive/app/(routes)/customer/booking-calendar/components/calendar/components/toolbar";
import { normalizeToUTCMidnight } from "mydive/server/utils/dates";
import { momentLocalizer } from "react-big-calendar";
import moment from "moment";
import styles from "./style-overrides.module.css";
import { MobileScheduledJumpCard } from "./mobile-scheduled-jump-card";

export type PaginationProps = {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  isLoading?: boolean;
  page: number;
  setPage: (page: number) => void;
  rowsPerPage: number;
  setRowsPerPage: (rowsPerPage: number) => void;
  numPages?: number;
  totalBookings?: number;
};

export default function ScheduledJumpsTable({
  scheduledJumps,
  users,
  isAdminView = false,
  paginationProps,
}: {
  scheduledJumps: ScheduledJump[];
  users?: UserDto[];
  isAdminView?: boolean;
  // we only paginate right now on admin view.
  paginationProps?: PaginationProps;
}) {
  // extract admin-only pagination props
  const currentDate = paginationProps?.currentDate;
  const setCurrentDate = paginationProps?.setCurrentDate;
  const isLoading = paginationProps?.isLoading;
  const page = paginationProps?.page;
  const setPage = paginationProps?.setPage;
  const rowsPerPage = paginationProps?.rowsPerPage;
  const setRowsPerPage = paginationProps?.setRowsPerPage;
  const numPages = paginationProps?.numPages;
  const totalBookings = paginationProps?.totalBookings;

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
  // for admin, we always show past views, because we are showing in a booking table where we want to review the full month.
  const [showPast, setShowPast] = useState(isAdminView ? true : false);
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
      ?.map((scheduledJump) => {
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
      const today = normalizeToUTCMidnight(new Date());
      tableData = tableData?.filter((row) => {
        const jumpDate = row.scheduledJump.jumpDate; // should be already normalized.
        return jumpDate >= today;
      });
    }
    if (!showCancelled) {
      tableData = tableData?.filter((row) => {
        return row.scheduledJump.status !== "CANCELED";
      });
    }
    return tableData;
  }, [convertedTableData, showPast, showCancelled]);

  // Column Definitions
  const columns = getColumns(isAdminView);

  const localizer = momentLocalizer(moment);

  return (
    <>
      {isAdminView && currentDate && setCurrentDate && (
        <CalendarToolbar
          date={currentDate}
          onNavigate={(action, date) => {
            if (action === "NEXT") {
              const nextMonth = currentDate;
              nextMonth.setMonth(nextMonth.getMonth() + 1);
              setCurrentDate(normalizeToUTCMidnight(nextMonth));
            } else if (action === "PREV") {
              const prevMonth = currentDate;
              prevMonth.setMonth(prevMonth.getMonth() - 1);
              setCurrentDate(normalizeToUTCMidnight(prevMonth));
            } else if (action === "TODAY") {
              setCurrentDate(normalizeToUTCMidnight(new Date()));
            } else if (action === "DATE") {
              if (!date) {
                throw new Error("There should be a date here!");
              }
              setCurrentDate(date);
            }
          }}
          view="month"
          views={["month"]}
          label="calendar"
          localizer={localizer}
          isAdmin={true}
          onView={() => {
            /* empty */
          }}
        />
      )}

      {/* Fixed Filters */}
      <div className="flex-shrink-0">
        <ScheduledJumpsTableFilters
          numVisibleRows={tableData?.length ?? 0}
          isAdmin={isAdminView}
          showPast={showPast}
          setShowPast={setShowPast}
          showCancelled={showCancelled}
          setShowCancelled={setShowCancelled}
        />
      </div>

      {/* Scrollable Content */}
      <div className="block overflow-auto p-4 md:hidden">
        {tableData?.map((row) => {
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
      <div className="relative overflow-auto">
        <Table
          aria-label="Scheduled Jumps Table"
          id="scheduled-jumps-table"
          removeWrapper
          suppressHydrationWarning
          classNames={{
            base: "bg-transparent min-h-[400px]",
            wrapper: "p-0 shadow-none bg-transparent",
            table: "min-h-full",
            thead: "bg-transparent",
            tbody: "bg-transparent min-h-[400px]",
            th: "bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 font-semibold text-xs uppercase tracking-wider border-b-2 border-slate-200 py-4 sticky top-0 z-10",
            td: "py-4 px-6 border-b border-slate-100",
            tr: "hover:bg-slate-50/50 transition-colors duration-200",
          }}
        >
          <TableHeader>{columns}</TableHeader>
          <TableBody
            emptyContent={
              isLoading ? (
                <div className="flex min-h-[300px] items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-600"></div>
                    <span className="text-sm font-medium text-slate-600">
                      Loading scheduled jumps...
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[300px] min-w-full items-center justify-center text-center text-slate-700">
                  <span>No scheduled jumps found</span>
                </div>
              )
            }
          >
            {isLoading
              ? []
              : tableData.map((row) => {
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
      {isAdminView &&
        setRowsPerPage &&
        setPage &&
        page !== undefined &&
        rowsPerPage &&
        !isLoading && (
          <div>
            <div
              className={`${styles.paginationCustom} mt-4 flex justify-center`}
            >
              {!isLoading && (
                <Pagination
                  total={numPages ?? 0}
                  page={page}
                  onChange={setPage}
                  showControls
                  variant="light"
                  radius="sm"
                  classNames={{
                    wrapper: "gap-2",
                    item: "text-black/40 bg-transparent border-none",
                    prev: "text-black",
                    next: "text-black",
                  }}
                />
              )}
            </div>
            <div className="mx-2 mb-4 flex items-center justify-between">
              {!isLoading && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">Rows per page:</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setPage(1);
                    }}
                    className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 focus:outline-none"
                  >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                </div>
              )}
              {!isLoading && (
                <span className="text-sm text-slate-600">
                  Showing{" "}
                  {tableData.length > 0 ? (page - 1) * rowsPerPage + 1 : 0} to{" "}
                  {Math.min(
                    page * rowsPerPage,
                    (page - 1) * rowsPerPage + tableData.length,
                  )}{" "}
                  of {totalBookings} bookings
                </span>
              )}
            </div>
          </div>
        )}

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
    </>
  );
}
