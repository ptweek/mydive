import { UserIcon, UsersIcon } from "@heroicons/react/24/outline";
import { Button, Chip, TableCell, TableColumn } from "@nextui-org/react";
import { formatDateShort } from "mydive/app/_shared-frontend/utils/booking";
import type {
  ScheduledJumpDto,
  UserDto,
} from "mydive/server/api/routers/types";
import { getBookingStatusIcon } from "../../statusIcons";

export const getColumns = (isAdminView: boolean) => {
  return [
    <TableColumn key="date" className="text-left">
      SCHEDULED JUMP DATE
    </TableColumn>,
    <TableColumn key="zone" className="text-left">
      BOOKING ZONE
    </TableColumn>,
    ...(isAdminView
      ? [
          <TableColumn key="booked-by" className="text-center">
            BOOKED BY
          </TableColumn>,
        ]
      : []),
    <TableColumn key="status" className="text-center">
      STATUS
    </TableColumn>,
    <TableColumn key="jumpers" className="text-center">
      JUMPERS
    </TableColumn>,
    <TableColumn key="method" className="text-center">
      BOOKING METHOD
    </TableColumn>,
    <TableColumn key="created" className="text-center">
      CREATED
    </TableColumn>,
    <TableColumn key="updated" className="text-center">
      LAST UPDATED
    </TableColumn>,
    <TableColumn key="actions" className="text-center">
      ACTIONS
    </TableColumn>,
  ];
};

export const getTableCells = (
  isAdminView: boolean,
  scheduledJump: ScheduledJumpDto,
  handleJumpCancellationClick: (scheduledJump: ScheduledJumpDto) => void,
  user?: UserDto,
  handleContactInfoClick?: (user: UserDto) => void,
) => {
  return [
    // Date cell
    <TableCell key="date">
      <div className="flex flex-col space-y-1">
        <div className="mt-2 ml-5">
          <div className="text-sm font-semibold text-slate-700">
            {formatDateShort(scheduledJump.jumpDate)}
          </div>
        </div>
      </div>
    </TableCell>,

    // Booking Zone cell
    <TableCell key="zone" className="text-sm font-semibold text-slate-700">
      <div className="flex justify-center">{scheduledJump.bookingZone}</div>
    </TableCell>,

    // Conditionally include Booked By cell only for admin view
    ...(isAdminView && handleContactInfoClick
      ? [
          <TableCell key="booked-by">
            {user ? (
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
          </TableCell>,
        ]
      : []),

    // Status cell
    <TableCell key="status">
      <div className="flex justify-center">
        {getBookingStatusIcon(scheduledJump.status)}
      </div>
    </TableCell>,

    // Jumpers cell
    <TableCell key="jumpers">
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
    </TableCell>,

    // Booking Method cell
    <TableCell key="method">
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
    </TableCell>,

    // Created cell
    <TableCell key="created">
      <div className="flex justify-center">
        <div className="text-center">
          <div className="text-sm font-medium text-slate-700">
            {formatDateShort(scheduledJump.createdAt)}
          </div>
          <div className="text-xs text-slate-500">
            {new Date(scheduledJump.createdAt).toLocaleDateString("en-US", {
              weekday: "short",
            })}
          </div>
        </div>
      </div>
    </TableCell>,

    // Last Updated cell
    <TableCell key="updated">
      <div className="flex justify-center">
        <div className="text-center">
          <div className="text-sm font-medium text-slate-700">
            {formatDateShort(scheduledJump.updatedAt)}
          </div>
          <div className="text-xs text-slate-500">
            {new Date(scheduledJump.updatedAt).toLocaleDateString("en-US", {
              weekday: "short",
            })}
          </div>
        </div>
      </div>
    </TableCell>,

    // Actions cell
    <TableCell key="actions">
      <div className="flex justify-center gap-2">
        {scheduledJump.status !== "CANCELED" ? (
          <button
            onClick={() => handleJumpCancellationClick(scheduledJump)}
            className="rounded bg-red-500 px-3 py-1 text-xs text-white hover:bg-red-600"
          >
            Cancel
          </button>
        ) : (
          <span className="text-sm text-slate-400">--</span>
        )}
      </div>
    </TableCell>,
  ];
};
