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
            'Only pending reservations can be released',
        },
        { status: 400 }
      )
    }

    await prisma.$transaction(
      async (tx) => {

        const inventory =
          await tx.inventory.findFirst({
            where: {
              productId:
                reservation.productId,
              warehouseId:
                reservation.warehouseId,
            },
          })

        if (!inventory) {
          throw new Error(
            'Inventory not found'
          )
        }

        await tx.inventory.update({
          where: {
            id: inventory.id,
          },
          data: {
            reservedQuantity: {
              decrement:
                reservation.quantity,
            },
          },
        })

        await tx.reservation.update({
          where: { id },
          data: {
            status: 'RELEASED',
          },
        })
      }
    )

    return NextResponse.json({
      success: true,
      message:
        'Reservation released',
    })

  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        error:
          'Failed to release reservation',
      },
      { status: 500 }
    )
  }
}
