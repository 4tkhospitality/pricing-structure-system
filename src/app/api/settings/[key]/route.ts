import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ key: string }> }
) {
    try {
        const { key } = await params;
        const setting = await prisma.hotelSetting.findUnique({
            where: { key },
        });
        if (!setting) {
            return NextResponse.json({ error: "Setting not found" }, { status: 404 });
        }
        return NextResponse.json(setting.value);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ key: string }> }
) {
    try {
        const { key } = await params;
        const body = await request.json();
        const setting = await prisma.hotelSetting.upsert({
            where: { key },
            update: { value: body },
            create: { key, value: body },
        });
        return NextResponse.json(setting.value);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
