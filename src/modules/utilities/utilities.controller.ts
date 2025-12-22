import { Controller, HttpPost } from "@/shared/controller/decorators";
import { Body, Inject } from "@nestjs/common";
import { StructuredOutputDto } from "./dto/structured-output.dto";
import { ExpandDto } from "./dto/expand.dto";
import { SummaryDto } from "./dto/summary.dto";
import { UtilitiesService } from "./utilities.service";

@Controller('utilities')
export class UtilitiesController {
 
  @Inject() private readonly utilitiesService: UtilitiesService;

  @HttpPost("structured-output")
  structuredOutput(@Body() dto: StructuredOutputDto) {
    return this.utilitiesService.structuredOutput(dto);
  }

  @HttpPost("summary")
  summary(@Body() dto: SummaryDto) {
    return this.utilitiesService.summary(dto);
  }

  @HttpPost("expand")
  expand(@Body() dto: ExpandDto) {
    return this.utilitiesService.expand(dto);
  }
}