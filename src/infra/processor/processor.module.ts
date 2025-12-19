import { Module } from "@nestjs/common";

import { ProcessorService } from "./processor.service";
import { ExtractionModule } from "./stage-1-extraction/extraction.module";
import { NormalizationModule } from "./stage-2-normalization/normalization.module";
import { ClassificationModule } from "./stage-3-classification/classification.module";
import { GroupingModule } from "./stage-4-grouping/grouping.module";
import { NoiseDetectionModule } from "./stage-5-noise-detection/noise-detection.module";
import { StructureModule } from "./stage-6-structure/structure.module";

@Module({
  imports: [
    ExtractionModule,
    NormalizationModule,
    ClassificationModule,
    GroupingModule,
    NoiseDetectionModule,
    StructureModule,
  ],
  providers: [ProcessorService],
  exports: [ProcessorService],
})
export class ProcessorModule {}