import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const ratePlan = await prisma.ratePlan.findUnique({
            where: { id },
            include: { roomType: true },
        });
        if (!ratePlan) {
            return NextResponse.json({ error: "RatePlan not found" }, { status: 404 });
        }
        return NextResponse.json(ratePlan);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const ratePlan = await prisma.ratePlan.update({
            where: { id },
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

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.ratePlan.delete({
            where: { id },
        });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
