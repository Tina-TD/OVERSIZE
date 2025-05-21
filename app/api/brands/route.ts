import { prisma } from '@/prisma/prisma-client';
import { NextResponse } from 'next/server';

export async function GET() {
  const brands = await prisma.brand.findMany();

  return NextResponse.json(brands);
}
