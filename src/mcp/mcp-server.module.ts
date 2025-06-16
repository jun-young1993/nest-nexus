import { Module } from '@nestjs/common';
import { McpModule } from '@rekog/mcp-nest';
import { GreetingTool } from './tools/greeting.tool';

@Module({
  imports: [
    McpModule.forRoot({
      name: 'rekog-server',
      version: '1.0.0',
    }),
  ],
  controllers: [],
  providers: [GreetingTool],
})
export class McpServerModule {}
