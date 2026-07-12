import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatTime(date: Date) {
  return date.toISOString().slice(11, 16);
}

function statusToUi(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

async function getSystemUser() {
  return prisma.user.findFirst({ where: { deletedAt: null } });
}

export async function GET() {
  try {
    const [assets, bookings] = await Promise.all([
      prisma.asset.findMany({
        where: { deletedAt: null, sharedResource: true },
        include: { category: true },
        orderBy: { assetTag: "asc" },
      }),
      prisma.resourceBooking.findMany({
        where: { deletedAt: null },
        include: { asset: { include: { category: true } }, bookedBy: true },
        orderBy: { startTime: "desc" },
      }),
    ]);

    return NextResponse.json({
      resources: assets.map((asset) => ({
        id: asset.id,
        name: asset.name,
        type:
          asset.category.type === "ROOMS"
            ? "Room"
            : asset.category.type === "VEHICLES"
              ? "Vehicle"
              : "Equipment",
        location: asset.currentLocation ?? "Unassigned",
      })),
      bookings: bookings.map((booking) => ({
        id: booking.id.slice(0, 8).toUpperCase(),
        dbId: booking.id,
        resourceId: booking.assetId,
        title: booking.purpose,
        organizer: booking.bookedBy.name,
        date: formatDate(booking.startTime),
        startTime: formatTime(booking.startTime),
        endTime: formatTime(booking.endTime),
        status: statusToUi(booking.status),
        overlapConflict: false,
      })),
    });
  } catch (error) {
    console.error("Failed to load bookings", error);
    return NextResponse.json({ message: "Failed to load bookings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = await getSystemUser();
    const asset = await prisma.asset.findFirst({
      where: { OR: [{ id: body.resourceId }, { assetTag: body.resourceId }] },
    });

    if (!user || !asset) {
      return NextResponse.json({ message: "A user and target asset are required" }, { status: 400 });
    }

    const booking = await prisma.resourceBooking.create({
      data: {
        assetId: asset.id,
        bookedById: user.id,
        purpose: String(body.title ?? "Resource booking"),
        startTime: new Date(`${body.date}T${body.startTime}:00`),
        endTime: new Date(`${body.date}T${body.endTime}:00`),
      },
      include: { asset: { include: { category: true } }, bookedBy: true },
    });

    await prisma.activityLog.create({
      data: {
        action: "RESOURCE_BOOKED",
        module: "BOOKING",
        entityType: "RESOURCE_BOOKING",
        entityId: booking.id,
      },
    });

    return NextResponse.json(
      {
        booking: {
          id: booking.id.slice(0, 8).toUpperCase(),
          dbId: booking.id,
          resourceId: booking.assetId,
          title: booking.purpose,
          organizer: booking.bookedBy.name,
          date: formatDate(booking.startTime),
          startTime: formatTime(booking.startTime),
          endTime: formatTime(booking.endTime),
          status: statusToUi(booking.status),
          overlapConflict: false,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create booking", error);
    return NextResponse.json({ message: "Failed to create booking" }, { status: 500 });
  }
}
