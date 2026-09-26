// Jellyfin injects its ApiClient onto window at runtime.
interface Window {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ApiClient?: any;
  JFPeoplePage?: { rootId?: string };
  __JF_PEOPLE_BUNDLE__?: boolean;
}

// Processed stylesheet imported as text (esbuild --loader:.css=text).
declare module "*.css" {
  const content: string;
  export default content;
}
