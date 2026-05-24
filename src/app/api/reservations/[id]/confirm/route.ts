import { prisma } from '../../../../../lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  req: NextRequest,
  context: {
    params: Promise<{
      id: string
    }>
  }
) {
  try {
    const { id } =
      await context.params

    const reservation =
      await prisma.reservation.findUnique({
        where: { id },
      })

    if (!reservation) {
      return NextResponse.json(
        {
          error:
            'Reservation not found',
        },
        { status: 404 }
      )
    }

    if (
      reservation.status !==
      'PENDING'
    ) {
      return NextResponse.json(
        {
          error:
            'Reservation already processed',
        },
        { status: 400 }
      )
    }

    if (
      new Date() >
      reservation.expiresAt
    ) {
      return NextResponse.json(
        {
          error:
            'Reservation expired',
        },
        { status: 410 }
      )
    }

    await prisma.reservation.update({
      where: {
        id,
      },
      data: {
        status: 'CONFIRMED',
      },
    })

    return NextResponse.json({
      success: true,
      message:
        'Reservation confirmed',
    })

  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        error:
          'Failed to confirm reservation',
      },
      { status: 500 }
    )
  }
}