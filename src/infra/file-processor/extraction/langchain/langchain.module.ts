import { Module } from "@nestjs/common";

import { LangchainExtractor } from "./langchain.extractor";
import {
  LangchainCSVLoader, LangchainDocxLoader, LangchainJSONLLoader, LangchainJSONLoader, LangchainPDFLoader,
  LangchainPPTXLoader, LangchainTextLoader
} from "./loaders";

@Module({
  providers: [
    LangchainExtractor,
    LangchainCSVLoader,
    LangchainDocxLoader,
    LangchainJSONLoader,
    LangchainJSONLLoader,
    LangchainPDFLoader,
    LangchainPPTXLoader,
    LangchainTextLoader,
  ],
  exports: [LangchainExtractor],
})
export class LangchainModule {}