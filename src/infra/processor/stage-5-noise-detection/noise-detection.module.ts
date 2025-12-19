import { Module } from "@nestjs/common";

import { NoiseDetectionService } from "./noise-detection.service";

@Module({
  providers: [NoiseDetectionService],
  exports: [NoiseDetectionService],
})
export class NoiseDetectionModule {}
