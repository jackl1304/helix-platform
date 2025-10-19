export type UseApprovalsResult = { data: any[] | undefined; isLoading: boolean; error: any; refetch: () => Promise<void> };
export const useApprovals = (): UseApprovalsResult => ({ data: [], isLoading: false, error: null, refetch: async () => {} });
