import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

export async function GET() {
    try {
        const roomTypes = await prisma.roomType.findMany();
        return NextResponse.json(roomTypes);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const roomType = await prisma.roomType.create({
            data: {
                name: body.name,
                description: body.description || '',
                basePrice: body.basePrice || 0,
            },
        });
        return NextResponse.json(roomType);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
