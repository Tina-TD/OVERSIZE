import { prisma } from '@/prisma/prisma-client';
import { NextResponse } from 'next/server';

export async function GET() {
  const colors = await prisma.color.findMany();

  return NextResponse.json(colors);
}
