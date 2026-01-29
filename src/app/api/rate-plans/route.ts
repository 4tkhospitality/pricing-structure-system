import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

export async function GET() {
    try {
        const ratePlans = await prisma.ratePlan.findMany({
            include: {
                roomType: true,
            },
        });
        return NextResponse.json(ratePlans);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const ratePlan = await prisma.ratePlan.create({
            data: {
                name: body.name,
                basePrice: body.basePrice,
                roomTypeId: body.roomTypeId,
            },
        });
        return NextResponse.json(ratePlan);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
