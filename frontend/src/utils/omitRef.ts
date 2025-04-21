// Utility to filter out 'ref' from props for ReactMarkdown/MUI integration
export function omitRef<T extends object>(props: T): Omit<T, 'ref'> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { ref, ...rest } = props as Record<string, unknown>;
  return rest as Omit<T, 'ref'>;
}
