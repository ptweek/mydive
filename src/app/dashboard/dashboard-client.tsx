"use client";
import { Button, Card, CardBody } from "@nextui-org/react";
import { useRouter } from "next/navigation";
export default function DashboardClient() {
  const router = useRouter();
  return (
    <div className="mx-auto flex max-w-4xl gap-6 p-6">
      {/* Book Now Card */}
      <Card className="flex-1 border-2 border-blue-400/30 bg-gradient-to-br from-blue-500/15 to-indigo-600/15 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-blue-300/50 hover:shadow-2xl hover:shadow-blue-500/20">
        <CardBody className="p-8 text-center">
          <div className="mb-6">
            <div className="mb-4 animate-bounce text-6xl">🪂</div>
            <h2 className="mb-2 text-3xl font-bold text-white">Book Now</h2>
            <p className="text-lg text-white/80">
              Ready for your next adventure? Book your skydiving experience
              today!
            </p>
          </div>

          <Button
            size="lg"
            variant="shadow"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 py-6 text-lg font-semibold tracking-wider text-white uppercase hover:from-blue-500 hover:to-indigo-600 hover:shadow-xl hover:shadow-blue-500/30"
            onPress={() => {
              router.push("/booking-calendar");
            }}
          >
            Book Now
          </Button>
        </CardBody>
      </Card>

      {/* My Bookings Card */}
      <Card className="flex-1 border-2 border-blue-400/30 bg-gradient-to-br from-blue-500/15 to-indigo-600/15 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-blue-300/50 hover:shadow-2xl hover:shadow-blue-500/20">
        <CardBody className="p-8 text-center">
          <div className="mb-6">
            <div className="mb-4 text-6xl">📋</div>
            <h2 className="mb-2 text-3xl font-bold text-white">My Bookings</h2>
            <p className="text-lg text-white/80">
              View and manage your upcoming skydiving reservations
            </p>
          </div>

          <Button
            size="lg"
            variant="shadow"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 py-6 text-lg font-semibold tracking-wider text-white uppercase hover:from-blue-500 hover:to-indigo-600 hover:shadow-xl hover:shadow-blue-500/30"
          >
            My Bookings
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
