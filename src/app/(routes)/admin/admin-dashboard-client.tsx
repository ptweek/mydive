"use client";

import { Button, Card, CardBody } from "@nextui-org/react";
import DashboardActionButton from "mydive/app/_shared-frontend/components/buttons/dashboard-action-buttons";
import { useRouter } from "next/navigation";
export default function AdminDashboardClient({
  userFirstName,
}: {
  userFirstName?: string | null;
}) {
  const welcomeStr = userFirstName
    ? `Welcome back, ${userFirstName}`
    : `Welcome back`;
  const router = useRouter();
  return (
    <div>
      <Card className="mb-8 border-2 border-white/20 shadow-2xl backdrop-blur-sm">
        <CardBody className="p-8 text-center">
          <h1 className="mb-4 text-6xl font-bold text-white drop-shadow-lg">
            {welcomeStr}
          </h1>
          <p className="text-2xl font-semibold text-white">
            Admin Dashboard - Manage your skydiving business
          </p>
        </CardBody>
      </Card>
      <div className="mx-auto flex max-w-4xl gap-6 p-6">
        <Card className="flex-1 border-2 border-blue-400/30 bg-gradient-to-br from-blue-500/15 to-indigo-600/15 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-blue-300/50 hover:shadow-2xl hover:shadow-blue-500/20">
          <CardBody className="p-8 text-center">
            <div className="mb-6">
              <div className="mb-4 animate-bounce text-6xl">🪂</div>
              <h2 className="mb-2 text-3xl font-bold text-white">
                Manage Bookings
              </h2>
              <p className="text-lg text-white/80">
                Manage bookings made by customers
              </p>
            </div>
            <DashboardActionButton
              text={"View Bookings Now"}
              onPress={() => {
                router.push("/admin/manage-booking-requests");
              }}
            />
          </CardBody>
        </Card>

        <Card className="border-2 border-blue-400/30 bg-gradient-to-br from-blue-500/15 to-indigo-600/15 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-blue-300/50 hover:shadow-2xl hover:shadow-blue-500/20">
          <CardBody className="p-6 text-center sm:p-8">
            <div className="mb-4 sm:mb-6">
              <div className="mb-3 animate-bounce text-4xl sm:mb-4 sm:text-6xl">
                🪂
              </div>
              <h2 className="mb-2 text-2xl font-bold text-white sm:text-3xl">
                Scheduled Jumps
              </h2>
              <p className="text-base text-white/80 sm:text-lg">
                Manage scheduled jumps for your customers
              </p>
            </div>

            <DashboardActionButton
              text={"View Scheduled Jumps"}
              onPress={() => {
                router.push("/admin/scheduled-jumps");
              }}
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
