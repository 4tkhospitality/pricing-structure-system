import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

export async function GET() {
    try {
        const otaChannels = await prisma.oTAChannel.findMany();
        return NextResponse.json(otaChannels);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const otaChannel = await prisma.oTAChannel.create({
            data: {
                name: body.name,
                calcType: body.calcType || 'PROGRESSIVE',
                defaultComm: body.defaultComm ?? 15,
            },
        });
        return NextResponse.json(otaChannel);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
