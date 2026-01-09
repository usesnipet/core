import { Test, TestingModule } from '@nestjs/testing';
import { Subscriber } from 'rxjs';
import { OutputParserService } from './output-parser.service';
import { ExecuteSnipetDto } from '../dto/execute-snipet.dto';
import { SnipetResolvedContext } from '../context-resolver/context-resolver.types';
import { ExecutionEvent } from '../types/execution-event';
import { AnswerOutputStrategy } from './answer.parser';
import { SummarizeOutputStrategy } from './summarize.parser';
import { ExpandOutputStrategy } from './expand.parser';
import { SnipetIntent } from '@/types/snipet-intent';

describe('OutputParserService', () => {
  let service: OutputParserService;
  
  // Mock parsers
  const mockAnswerParser = { execute: jest.fn() };
  const mockSummarizeParser = { execute: jest.fn() };
  const mockExpandParser = { execute: jest.fn() };

  // Mock subscriber
  const mockSubscriber: Subscriber<ExecutionEvent> = {
    next: jest.fn(),
    error: jest.fn(),
    complete: jest.fn(),
  } as any;

  // Mock context
  const mockContext: SnipetResolvedContext = {
    // Add required properties here based on your context type
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OutputParserService,
        { provide: AnswerOutputStrategy, useValue: mockAnswerParser },
        { provide: SummarizeOutputStrategy, useValue: mockSummarizeParser },
        { provide: ExpandOutputStrategy, useValue: mockExpandParser },
      ],
    }).compile();

    service = module.get<OutputParserService>(OutputParserService);
    
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    const testCases = [
      { intent: SnipetIntent.ANSWER, mockParser: mockAnswerParser },
      { intent: SnipetIntent.SUMMARIZE, mockParser: mockSummarizeParser },
      { intent: SnipetIntent.EXPAND, mockParser: mockExpandParser },
    ];

    testCases.forEach(({ intent, mockParser }) => {
      it(`should call ${intent} parser when intent is ${intent}`, () => {
        // Arrange
        const executeDto: ExecuteSnipetDto = {
          intent,
          // Add other required properties here
        } as any;

        // Act
        service.execute(executeDto, mockContext, mockSubscriber);

        // Assert
        expect(mockParser.execute).toHaveBeenCalledWith(
          executeDto,
          mockContext,
          mockSubscriber
        );
      });
    });

    it('should throw an error for unknown intent', () => {
      // Arrange
      const unknownIntent = 'UNKNOWN_INTENT' as SnipetIntent;
      const executeDto: ExecuteSnipetDto = {
        intent: unknownIntent,
      } as any;

      // Act & Assert
      expect(() => {
        service.execute(executeDto, mockContext, mockSubscriber);
      }).toThrow(`Output parser not implemented for intent: ${unknownIntent}`);
    });
  });
});
