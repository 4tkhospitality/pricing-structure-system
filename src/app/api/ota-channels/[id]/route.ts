import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const otaChannel = await prisma.oTAChannel.findUnique({
            where: { id },
        });
        if (!otaChannel) {
            return NextResponse.json({ error: "OTAChannel not found" }, { status: 404 });
        }
        return NextResponse.json(otaChannel);
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
        const otaChannel = await prisma.oTAChannel.update({
            where: { id },
            data: {
                name: body.name,
                calcType: body.calcType,
                defaultComm: body.defaultComm,
            },
        });
        return NextResponse.json(otaChannel);
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
        await prisma.oTAChannel.delete({
            where: { id },
        });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
