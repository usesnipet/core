export type ExecutionEvent = {
  event: 
    "start" |
    "context.start" | "context.read-knowledge" | "context.retrieved-knowledge" | "context.read-snipet" | "context.retrieved-snipet" | "context.read-connector" | "context.retrieved-connector" | "context.finish" |
    "action.start" | "action.plan" | "action.execute" | "action.finish" |
    "output.start" | "output.data" | "output.streaming" | "output.finish" |
    "finish";
  payload?: any;
}