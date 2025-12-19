import { Injectable } from "@nestjs/common";

import { NormalizedDocument } from "../stage-2-normalization/interfaces/normalized-document";

import { ClassifiedDocument } from "./interfaces/classification-document";
import { StructuralHints } from "./interfaces/structural-hints";
import { continuationSignal } from "./signals/continuation.signal";
import { listItemSignal } from "./signals/list-item.signal";
import { noiseSignal } from "./signals/noise.signal";
import { paragraphSignal } from "./signals/paragraph.signal";
import { titleSignal } from "./signals/title.signal";

@Injectable()
export class ClassificationService {
  classify(document: NormalizedDocument): ClassifiedDocument {
    const nodes = document.nodes.map(node => {
      const structuralHints: StructuralHints = {
        titleScore: titleSignal(node),
        subtitleScore: 0,
        paragraphScore: paragraphSignal(node),
        listItemScore: listItemSignal(node),
        continuationScore: continuationSignal(node),
        noiseScore: noiseSignal(node),
      };

      return {
        ...node,
        structuralHints,
      };
    });

    return {
      nodes,
      metadata: {
        classifiedAt: new Date().toISOString(),
      },
    };
  }
}
