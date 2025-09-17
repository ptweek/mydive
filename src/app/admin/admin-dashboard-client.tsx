"use client";

import { Button, Card, CardBody } from "@nextui-org/react";
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
        {/* Book Now Card */}
        <Card className="flex-1 border-2 border-blue-400/30 bg-gradient-to-br from-blue-500/15 to-indigo-600/15 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-blue-300/50 hover:shadow-2xl hover:shadow-blue-500/20">
          <CardBody className="p-8 text-center">
            <div className="mb-6">
              <div className="mb-4 animate-bounce text-6xl">🪂</div>
              <h2 className="mb-2 text-3xl font-bold text-white">
                Manage Bookings
              </h2>
              <p className="text-lg text-white/80">
                Manage bookings made by your customers
              </p>
            </div>

            <Button
              size="lg"
              variant="shadow"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-lg font-semibold tracking-wider text-white uppercase hover:from-blue-500 hover:to-indigo-600 hover:shadow-xl hover:shadow-blue-500/30"
              onPress={() => {
                router.push("/admin/manage-bookings");
              }}
            >
              View Bookings Now
            </Button>
          </CardBody>
        </Card>

        {/* My Bookings Card */}
        <Card className="flex-1 border-2 border-blue-400/30 bg-gradient-to-br from-blue-500/15 to-indigo-600/15 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-blue-300/50 hover:shadow-2xl hover:shadow-blue-500/20">
          <CardBody className="p-8 text-center">
            <div className="mb-6">
              <div className="mb-4 text-6xl">📋</div>
              <h2 className="mb-2 text-3xl font-bold text-white">
                Manage Users
              </h2>
              <p className="text-lg text-white/80">
                View existing or new users. Update permissions and roles
              </p>
            </div>

            <Button
              size="lg"
              variant="shadow"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-lg font-semibold tracking-wider text-white uppercase hover:from-blue-500 hover:to-indigo-600 hover:shadow-xl hover:shadow-blue-500/30"
              onPress={() => {
                router.push("/admin");
              }}
            >
              Manage Users
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
