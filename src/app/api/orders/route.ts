import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { OrderType, OrderSide, OrderStatus, TimeInForce, AdvancedOrderType } from '@prisma/client';

// GET /api/orders - Get all orders for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const portfolioId = searchParams.get('portfolioId');
    const status = searchParams.get('status') as OrderStatus;
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const whereClause: any = { userId };
    
    if (portfolioId) {
      whereClause.portfolioId = portfolioId;
    }
    
    if (status && Object.values(OrderStatus).includes(status)) {
      whereClause.status = status;
    }

    const orders = await db.order.findMany({
      where: whereClause,
      include: {
        instrument: true,
        portfolio: true,
        position: true,
        childOrders: true,
        parentOrder: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// POST /api/orders - Create a new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      userId,
      portfolioId,
      instrumentId,
      type,
      side,
      quantity,
      price,
      stopPrice,
      limitPrice,
      timeInForce,
      orderType,
      triggerPrice,
      trailAmount,
      trailPercent,
      icebergQty,
      displayQty,
      strategy,
      tags,
      notes,
      expiresAt
    } = body;

    // Validate required fields
    if (!userId || !portfolioId || !instrumentId || !type || !side || !quantity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate enum values
    if (!Object.values(OrderType).includes(type)) {
      return NextResponse.json({ error: 'Invalid order type' }, { status: 400 });
    }
    
    if (!Object.values(OrderSide).includes(side)) {
      return NextResponse.json({ error: 'Invalid order side' }, { status: 400 });
    }
    
    if (timeInForce && !Object.values(TimeInForce).includes(timeInForce)) {
      return NextResponse.json({ error: 'Invalid time in force' }, { status: 400 });
    }
    
    if (orderType && !Object.values(AdvancedOrderType).includes(orderType)) {
      return NextResponse.json({ error: 'Invalid advanced order type' }, { status: 400 });
    }

    // Check if user exists
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if portfolio exists
    const portfolio = await db.portfolio.findUnique({ 
      where: { id: portfolioId },
      include: { user: true }
    });
    if (!portfolio || portfolio.userId !== userId) {
      return NextResponse.json({ error: 'Portfolio not found or access denied' }, { status: 404 });
    }

    // Check if instrument exists
    const instrument = await db.instrument.findUnique({ where: { id: instrumentId } });
    if (!instrument) {
      return NextResponse.json({ error: 'Instrument not found' }, { status: 404 });
    }

    // Create the order
    const order = await db.order.create({
      data: {
        userId,
        portfolioId,
        instrumentId,
        type,
        side,
        quantity: parseFloat(quantity),
        price: price ? parseFloat(price) : null,
        stopPrice: stopPrice ? parseFloat(stopPrice) : null,
        limitPrice: limitPrice ? parseFloat(limitPrice) : null,
        status: OrderStatus.PENDING,
        timeInForce: timeInForce || TimeInForce.DAY,
        orderType,
        triggerPrice: triggerPrice ? parseFloat(triggerPrice) : null,
        trailAmount: trailAmount ? parseFloat(trailAmount) : null,
        trailPercent: trailPercent ? parseFloat(trailPercent) : null,
        icebergQty: icebergQty ? parseFloat(icebergQty) : null,
        displayQty: displayQty ? parseFloat(displayQty) : null,
        strategy,
        tags: tags ? JSON.stringify(tags) : null,
        notes,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      },
      include: {
        instrument: true,
        portfolio: true,
        position: true,
        childOrders: true,
        parentOrder: true
      }
    });

    // For advanced orders, create child orders if needed
    if (orderType === AdvancedOrderType.BRACKET || orderType === AdvancedOrderType.OCO) {
      // This is a simplified version - in production, you'd want more sophisticated logic
      // for creating child orders based on the parent order parameters
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}