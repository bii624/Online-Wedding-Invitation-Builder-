import { VectorSearchService } from './src/linh-ai/services/vector-search.service';
import { ConfigService } from '@nestjs/config';

require('dotenv').config();

async function run() {
  console.log('Starting...');
  const config = new ConfigService();
  const service = new VectorSearchService(config);
  await service.onModuleInit();
  const results = await service.search('quy trình dạm ngõ');
  console.log('Results length:', results.length);
  if (results.length > 0) {
    console.log('Top result:', results[0]);
  }
}
run().catch(console.error);
