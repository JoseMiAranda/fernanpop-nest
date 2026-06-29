import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query, Req } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post('product/:productId')
  @HttpCode(HttpStatus.CREATED)
  createOrGetByProduct(@Param('productId') productId: string, @Req() request: Request) {
    return this.conversationsService.createOrGetByProduct(productId, request['firebaseUser']['uid']);
  }

  @Get()
  findByUser(@Req() request: Request) {
    return this.conversationsService.findByUser(request['firebaseUser']['uid']);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() request: Request) {
    return this.conversationsService.findOne(id, request['firebaseUser']['uid']);
  }

  @Get(':id/messages')
  findMessages(
    @Param('id') id: string,
    @Query('since') since: string | undefined,
    @Req() request: Request,
  ) {
    return this.conversationsService.findMessages(id, request['firebaseUser']['uid'], since);
  }

  @Post(':id/messages')
  @HttpCode(HttpStatus.CREATED)
  createMessage(
    @Param('id') id: string,
    @Body() createMessageDto: CreateMessageDto,
    @Req() request: Request,
  ) {
    return this.conversationsService.createMessage(id, request['firebaseUser']['uid'], createMessageDto);
  }
}
