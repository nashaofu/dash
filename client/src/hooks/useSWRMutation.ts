import useInnerSWRMutation, { SWRMutationConfiguration } from 'swr/mutation';

type IFetcher<T, R> = (url: string, data: T) => Promise<R>;

export default function useSWRMutation<Data = unknown, Resp = unknown>(
  key: string,
  fetcher: IFetcher<Data, Resp>,
  options?: SWRMutationConfiguration<Resp, unknown>,
) {
  return useInnerSWRMutation<Resp, unknown, string, Data>(
    key,
    (url, { arg }) => fetcher(url, arg),
    options,
  );
}
