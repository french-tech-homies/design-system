// Vite's `?raw`: the file's text, bundled, with no request made for it later.
declare module "*.css?raw" {
  const text: string;
  export default text;
}
