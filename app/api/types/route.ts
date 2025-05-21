import { prisma } from '@/prisma/prisma-client';
import { NextResponse } from 'next/server';

export async function GET() {
  const types = await prisma.type.findMany();

  return NextResponse.json(types);
}
