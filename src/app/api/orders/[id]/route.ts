import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { OrderStatus } from '@prisma/client';

interface RouteParams {
  params: { id: string };
}

// GET /api/orders/[id] - Get a specific order
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    
    const order = await db.order.findUnique({
      where: { id },
      include: {
        instrument: true,
        portfolio: true,
        position: true,
        childOrders: true,
        parentOrder: true
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

// PUT /api/orders/[id] - Update an order
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const {
      userId,
      quantity,
      price,
      stopPrice,
      limitPrice,
      triggerPrice,
      trailAmount,
      trailPercent,
      icebergQty,
      displayQty,
      notes,
      status
    } = body;

    // Check if order exists and belongs to the user
    const existingOrder = await db.order.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (existingOrder.userId !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if order can be modified (only pending or open orders can be modified)
    if (existingOrder.status !== OrderStatus.PENDING && existingOrder.status !== OrderStatus.OPEN) {
      return NextResponse.json({ error: 'Order cannot be modified' }, { status: 400 });
    }

    // Update the order
    const updatedOrder = await db.order.update({
      where: { id },
      data: {
        quantity: quantity ? parseFloat(quantity) : undefined,
        price: price ? parseFloat(price) : undefined,
        stopPrice: stopPrice ? parseFloat(stopPrice) : undefined,
        limitPrice: limitPrice ? parseFloat(limitPrice) : undefined,
        triggerPrice: triggerPrice ? parseFloat(triggerPrice) : undefined,
        trailAmount: trailAmount ? parseFloat(trailAmount) : undefined,
        trailPercent: trailPercent ? parseFloat(trailPercent) : undefined,
        icebergQty: icebergQty ? parseFloat(icebergQty) : undefined,
        displayQty: displayQty ? parseFloat(displayQty) : undefined,
        notes,
        status: status ? status as OrderStatus : undefined
      },
      include: {
        instrument: true,
        portfolio: true,
        position: true,
        childOrders: true,
        parentOrder: true
      }
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

// DELETE /api/orders/[id] - Cancel/delete an order
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Check if order exists and belongs to the user
    const existingOrder = await db.order.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (existingOrder.userId !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if order can be cancelled
    if (existingOrder.status === OrderStatus.FILLED || existingOrder.status === OrderStatus.CANCELLED) {
      return NextResponse.json({ error: 'Order cannot be cancelled' }, { status: 400 });
    }

    // Update order status to cancelled
    const cancelledOrder = await db.order.update({
      where: { id },
      data: {
        status: OrderStatus.CANCELLED,
        updatedAt: new Date()
      },
      include: {
        instrument: true,
        portfolio: true,
        position: true,
        childOrders: true,
        parentOrder: true
      }
    });

    // Cancel child orders if they exist
    if (cancelledOrder.childOrders.length > 0) {
      await db.order.updateMany({
        where: { parentOrderId: id },
        data: { status: OrderStatus.CANCELLED }
      });
    }

    return NextResponse.json(cancelledOrder);
  } catch (error) {
    console.error('Error cancelling order:', error);
    return NextResponse.json({ error: 'Failed to cancel order' }, { status: 500 });
  }
}