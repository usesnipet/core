import { Injectable } from "@nestjs/common";

import { GenericDocument } from "../stage-1-extraction/interfaces/generic-document";

import { NormalizedDocument } from "./interfaces/normalized-document";
import { NormalizedNode } from "./interfaces/normalized-node";
import { NormalizationWarning } from "./interfaces/normalized-warning";
import { normalizeMetadata } from "./steps/normalize-metadata.step";
import { normalizePosition } from "./steps/normalize-position.step";
import { normalizeText } from "./steps/normalize-text.step";
import { preserveOriginal } from "./steps/preserve-original.step";
import { validateNode } from "./steps/validate-node.step";

@Injectable()
export class NormalizationService {
  normalize(document: GenericDocument): NormalizedDocument {
    const warnings: NormalizationWarning[] = [];

    let nodes: NormalizedNode[] = document.nodes.map(preserveOriginal);

    nodes = nodes.map(normalizeText);
    nodes = normalizePosition(nodes);
    nodes = nodes.map(normalizeMetadata);

    nodes.forEach(node => {
      const nodeWarnings = validateNode(node);
      if (nodeWarnings.length) warnings.push(...nodeWarnings);
    });

    return {
      nodes,
      warnings,
      metadata: {
        source: document.source,
        normalizedAt: new Date().toISOString(),
      },
    };
  }
}
