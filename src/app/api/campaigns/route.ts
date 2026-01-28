import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

export async function GET() {
    try {
        const campaigns = await prisma.campaignInstance.findMany();
        return NextResponse.json(campaigns);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const campaign = await prisma.campaignInstance.create({
            data: {
                name: body.name,
                discountValue: body.discountValue,
                calcType: body.calcType as any,
                isActive: body.isActive ?? true,
                isPercentage: true,
                applyOrder: 0,
                incompatibleWith: [],
            },
        });
        return NextResponse.json(campaign);
    } catch (error: any) {
        console.error("CAMPAIGN POST ERROR:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
