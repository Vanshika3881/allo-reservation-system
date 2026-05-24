import { prisma } from '../../../lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      productId,
      warehouseId,
      quantity,
    } = body

    if (
      !productId ||
      !warehouseId ||
      !quantity
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const result = await prisma.$transaction(
      async (tx) => {

        const inventory = await tx.inventory.findFirst({
          where: {
            productId,
            warehouseId,
          },
        })

        if (!inventory) {
          throw new Error('Inventory not found')
        }

        const availableQuantity =
          inventory.totalQuantity -
          inventory.reservedQuantity

        if (availableQuantity < quantity) {
          return {
            error: 'Insufficient inventory',
            status: 409,
          }
        }

        await tx.inventory.update({
          where: {
            id: inventory.id,
          },
          data: {
            reservedQuantity: {
              increment: quantity,
            },
          },
        })

        const expiresAt = new Date(
          Date.now() + 15 * 60 * 1000
        )

        const reservation =
          await tx.reservation.create({
            data: {
              productId,
              warehouseId,
              quantity,
              status: 'PENDING',
              expiresAt,
            },
          })

        return {
          reservation,
          status: 201,
        }
      }
    )

    return NextResponse.json(
      result,
      {
        status:
          result.status || 201,
      }
    )

  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Reservation failed',
      },
      { status: 500 }
    )
  }
}