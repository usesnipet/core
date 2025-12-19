import { env } from "@/env";
import { Inject, Injectable } from "@nestjs/common";

import { ExtractionService } from "./stage-1-extraction/extraction.service";
import { NormalizationService } from "./stage-2-normalization/normalization.service";
import { ClassificationService } from "./stage-3-classification/classification.service";
import { GroupingService } from "./stage-4-grouping/grouping.service";
import { NoiseDetectionService } from "./stage-5-noise-detection/noise-detection.service";
import { StructureService } from "./stage-6-structure/structure.service";

@Injectable()
export class ProcessorService {
  @Inject() private readonly extractorService: ExtractionService;
  @Inject() private readonly normalizerService: NormalizationService;
  @Inject() private readonly classifierService: ClassificationService;
  @Inject() private readonly grouperService: GroupingService;
  @Inject() private readonly noiseDetectorService: NoiseDetectionService;
  @Inject() private readonly structureService: StructureService;

  async process(blob: Blob, metadata: Record<string, any>): Promise<StructuredDocument> {
    const genericDocument = await this.extractorService.extract(
      env.DEFAULT_EXTRACTOR,
      blob,
      metadata,
      env.EXTRACTOR_SETTINGS,
    );

    const normalizedBlocks = await this.normalizerService.normalize(genericDocument);
    const classifiedBlocks = await this.classifierService.classify(normalizedBlocks);
    const groupedBlocks = await this.grouperService.group(classifiedBlocks);
    const noiseDetectedBlocks = await this.noiseDetectorService.detect(groupedBlocks);
    const structuredDocument = await this.structureService.build(noiseDetectedBlocks);
    return structuredDocument;
  }
}