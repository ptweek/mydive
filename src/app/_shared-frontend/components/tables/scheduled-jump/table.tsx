import { Table, TableBody, TableHeader, TableRow } from "@nextui-org/react";
import type { ScheduledJump } from "@prisma/client";
import type { UserDto } from "mydive/server/api/routers/types";
import { useMemo, useState } from "react";
import { ContactModal } from "../../modals/contact-modal";
import { CancelScheduleJumpConfirmationModal } from "../../modals/cancellation-confirmation/scheduled-jump";
import { api } from "mydive/trpc/react";
import ScheduledJumpsTableFilters from "./filters";
import { getColumns, getTableCells } from "./table-helpers";
import { useRouter } from "next/navigation";

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
  return (
    <>
      <ScheduledJumpsTableFilters
        numVisibleRows={tableData.length}
        showPast={showPast}
        setShowPast={setShowPast}
        showCancelled={showCancelled}
        setShowCancelled={setShowCancelled}
      />
      <div className="max-h-[400px] overflow-auto">
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
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
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
    </>
  );
}
