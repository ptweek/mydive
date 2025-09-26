"use client";
import { Card, CardBody } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import DashboardActionButton from "mydive/app/_shared-frontend/components/buttons/dashboard-action-buttons";

export default function DashboardClient() {
  const router = useRouter();
  return (
    <div className="mx-auto w-full max-w-4xl overflow-auto px-4 py-6 sm:px-6">
      {/* Mobile: 1 column, Tablet+: 2 columns */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
        {/* Book Now Card */}
        <Card className="border-2 border-blue-400/30 bg-gradient-to-br from-blue-500/15 to-indigo-600/15 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-blue-300/50 hover:shadow-2xl hover:shadow-blue-500/20">
          <CardBody className="p-6 text-center sm:p-8">
            <div className="mb-4 sm:mb-6">
              <div className="mb-3 animate-bounce text-4xl sm:mb-4 sm:text-6xl">
                🪂
              </div>
              <h2 className="mb-2 text-2xl font-bold text-white sm:text-3xl">
                Book Now
              </h2>
              <p className="text-base text-white/80 sm:text-lg">
                Ready for your next adventure? Book your skydiving experience
                today!
              </p>
            </div>

            <DashboardActionButton
              text={"Book Now"}
              onPress={() => {
                router.push("/customer/booking-calendar");
              }}
            />
          </CardBody>
        </Card>

        {/* Manage Bookings Card */}
        <Card className="border-2 border-blue-400/30 bg-gradient-to-br from-blue-500/15 to-indigo-600/15 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-blue-300/50 hover:shadow-2xl hover:shadow-blue-500/20">
          <CardBody className="p-6 text-center sm:p-8">
            <div className="mb-4 sm:mb-6">
              <div className="mb-3 text-4xl sm:mb-4 sm:text-6xl">📋</div>
              <h2 className="mb-2 text-2xl font-bold text-white sm:text-3xl">
                Manage Bookings
              </h2>
              <p className="text-base text-white/80 sm:text-lg">
                View and manage your upcoming skydiving reservations
              </p>
            </div>

            <DashboardActionButton
              text={"View Bookings"}
              onPress={() => {
                router.push("/customer/manage-booking-requests");
              }}
            />
          </CardBody>
        </Card>

        {/* My Scheduled Jumps Card */}
        <Card className="border-2 border-blue-400/30 bg-gradient-to-br from-blue-500/15 to-indigo-600/15 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-blue-300/50 hover:shadow-2xl hover:shadow-blue-500/20">
          <CardBody className="p-6 text-center sm:p-8">
            <div className="mb-4 sm:mb-6">
              <div className="mb-3 text-4xl sm:mb-4 sm:text-6xl">✈️</div>
              <h2 className="mb-2 text-2xl font-bold text-white sm:text-3xl">
                My Scheduled Jumps
              </h2>
              <p className="text-base text-white/80 sm:text-lg">
                Manage your past or upcoming jump dates
              </p>
            </div>

            <DashboardActionButton
              text={"View Scheduled Jumps"}
              onPress={() => {
                router.push("/customer/scheduled-jumps");
              }}
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
