import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { OrderStatus, OrderType, OrderSide } from '@prisma/client';

// POST /api/orders/execute - Execute a market order or simulate execution
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      orderId,
      userId,
      simulatedPrice, // For testing purposes
      simulateOnly = false // If true, only simulate, don't actually execute
    } = body;

    if (!orderId || !userId) {
      return NextResponse.json({ error: 'Order ID and User ID are required' }, { status: 400 });
    }

    // Get the order with all related data
    const order = await db.order.findUnique({
      where: { id: orderId },
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

    if (order.userId !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if order can be executed
    if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.OPEN) {
      return NextResponse.json({ error: 'Order cannot be executed' }, { status: 400 });
    }

    // For market orders, we can execute immediately
    // For other order types, we would need to check market conditions
    if (order.type !== OrderType.MARKET && !simulateOnly) {
      return NextResponse.json({ error: 'Only market orders can be executed directly' }, { status: 400 });
    }

    // Get current price (in a real system, this would come from market data)
    const currentPrice = simulatedPrice || order.instrument.currentPrice || 100.00; // Default price for demo

    // Calculate execution details
    const executionPrice = currentPrice;
    const commission = order.quantity * executionPrice * 0.001; // 0.1% commission
    const totalValue = order.quantity * executionPrice;

    // Update or create position
    let position = order.position;
    
    if (!position) {
      // Create new position
      position = await db.position.create({
        data: {
          portfolioId: order.portfolioId,
          instrumentId: order.instrumentId,
          userId: order.userId,
          quantity: order.side === OrderSide.BUY ? order.quantity : -order.quantity,
          averagePrice: executionPrice,
          currentPrice: executionPrice,
          unrealizedPnL: 0,
          realizedPnL: 0
        }
      });
    } else {
      // Update existing position
      const newQuantity = order.side === OrderSide.BUY 
        ? position.quantity + order.quantity 
        : position.quantity - order.quantity;
      
      const totalQuantity = position.quantity + (order.side === OrderSide.BUY ? order.quantity : 0);
      const newAveragePrice = totalQuantity > 0 
        ? ((position.quantity * position.averagePrice) + (order.quantity * executionPrice)) / totalQuantity
        : position.averagePrice;

      const unrealizedPnL = (currentPrice - newAveragePrice) * newQuantity;

      await db.position.update({
        where: { id: position.id },
        data: {
          quantity: newQuantity,
          averagePrice: newAveragePrice,
          currentPrice: executionPrice,
          unrealizedPnL
        }
      });
    }

    // Update order status
    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.FILLED,
        filledQuantity: order.quantity,
        averagePrice: executionPrice,
        commission,
        executedAt: new Date(),
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

    // Update portfolio total value (simplified)
    await db.portfolio.update({
      where: { id: order.portfolioId },
      data: {
        totalValue: {
          increment: order.side === OrderSide.BUY ? -totalValue : totalValue
        },
        updatedAt: new Date()
      }
    });

    // Handle advanced order logic (trailing stops, OCO, etc.)
    if (order.orderType && !simulateOnly) {
      await handleAdvancedOrderExecution(order, currentPrice);
    }

    return NextResponse.json({
      order: updatedOrder,
      position,
      executionDetails: {
        price: executionPrice,
        quantity: order.quantity,
        commission,
        totalValue,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Error executing order:', error);
    return NextResponse.json({ error: 'Failed to execute order' }, { status: 500 });
  }
}

// Helper function to handle advanced order types
async function handleAdvancedOrderExecution(order: any, currentPrice: number) {
  switch (order.orderType) {
    case 'TRAILING_STOP':
      // Update trailing stop price based on current market conditions
      if (order.side === OrderSide.BUY && currentPrice > (order.triggerPrice || 0)) {
        // For long positions, update stop price as price increases
        const newStopPrice = currentPrice * (1 - (order.trailPercent || 0) / 100);
        await db.order.update({
          where: { id: order.id },
          data: { triggerPrice: newStopPrice }
        });
      }
      break;

    case 'OCO':
      // One-Cancels-Other logic
      if (order.childOrders.length > 0) {
        // Cancel all child orders when one is executed
        await db.order.updateMany({
          where: { parentOrderId: order.id },
          data: { status: OrderStatus.CANCELLED }
        });
      }
      break;

    case 'BRACKET':
      // Bracket order logic - create stop-loss and take-profit orders
      if (order.childOrders.length === 0) {
        const stopLossPrice = order.averagePrice * 0.95; // 5% stop loss
        const takeProfitPrice = order.averagePrice * 1.10; // 10% take profit

        // Create stop-loss order
        await db.order.create({
          data: {
            portfolioId: order.portfolioId,
            instrumentId: order.instrumentId,
            userId: order.userId,
            type: OrderType.STOP,
            side: order.side === OrderSide.BUY ? OrderSide.SELL : OrderSide.BUY,
            quantity: order.quantity,
            stopPrice: stopLossPrice,
            status: OrderStatus.OPEN,
            timeInForce: 'GTC',
            parentOrderId: order.id
          }
        });

        // Create take-profit order
        await db.order.create({
          data: {
            portfolioId: order.portfolioId,
            instrumentId: order.instrumentId,
            userId: order.userId,
            type: OrderType.LIMIT,
            side: order.side === OrderSide.BUY ? OrderSide.SELL : OrderSide.BUY,
            quantity: order.quantity,
            price: takeProfitPrice,
            status: OrderStatus.OPEN,
            timeInForce: 'GTC',
            parentOrderId: order.id
          }
        });
      }
      break;
  }
}