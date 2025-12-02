export enum Capability {
  /**
   * Capability for save content in a vector store, this sends the file to snipet core, for save in internal vector store
   */
  INGEST = 'INGEST',
  /**
   * Capability for search data on user query
   */
  SEARCH = 'SEARCH',
  /**
   * Capability for execute an action
   */
  ACTION = 'ACTION',
}