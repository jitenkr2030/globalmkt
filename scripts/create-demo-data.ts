#!/usr/bin/env ts-node

import { createDemoData } from '../src/lib/demo-data';

async function main() {
  console.log('Starting demo data creation...');
  
  try {
    await createDemoData();
    console.log('✅ Demo data created successfully!');
  } catch (error) {
    console.error('❌ Error creating demo data:', error);
    process.exit(1);
  }
}

main();